import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';
import { LEGAL_VERSION } from './constants';

export interface Profile {
  email: string | null;
  displayName: string | null;
  ageConfirmed18: boolean;
  acceptedLegalVersion: string;
}

interface AuthState {
  /** Signed in AND has recorded age + terms consent. */
  user: User | null;
  /** Signed in with Firebase but consent not recorded yet (new Google user). */
  needsConsent: boolean;
  loading: boolean;
  configured: boolean;
  signUpEmail: (name: string, email: string, password: string) => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  /** Opens the Google popup. Resolves true when the account already has consent on file. */
  signInGoogle: (consented: boolean) => Promise<boolean>;
  completeConsent: () => Promise<void>;
  cancelConsent: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const requireFirebase = () => {
  if (!auth || !db) throw Object.assign(new Error('Firebase is not configured.'), { code: 'app/not-configured' });
  return { auth, db };
};

const writeProfile = async (user: User, displayName?: string | null) => {
  const { db } = requireFirebase();
  const profile: Profile = {
    email: user.email,
    displayName: displayName ?? user.displayName,
    ageConfirmed18: true,
    acceptedLegalVersion: LEGAL_VERSION,
  };
  await setDoc(doc(db, 'users', user.uid), { ...profile, acceptedAt: serverTimestamp(), createdAt: serverTimestamp() }, { merge: true });
  return profile;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [fbUser, setFbUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  // While an email signup is writing its profile, do not flash the consent step.
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!auth || !db) return;
    const firestore = db;
    return onAuthStateChanged(auth, async (u) => {
      setFbUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(firestore, 'users', u.uid));
        setProfile(snap.exists() ? (snap.data() as Profile) : null);
      } catch {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  const signUpEmail = useCallback(async (name: string, email: string, password: string) => {
    const { auth } = requireFirebase();
    setWorking(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(cred.user, { displayName: name });
      setProfile(await writeProfile(cred.user, name || null));
      setFbUser(auth.currentUser);
    } finally {
      setWorking(false);
    }
  }, []);

  const signInEmail = useCallback(async (email: string, password: string) => {
    const { auth } = requireFirebase();
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signInGoogle = useCallback(async (consented: boolean) => {
    const { auth, db } = requireFirebase();
    setWorking(true);
    try {
      const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        setProfile(snap.data() as Profile);
        return true;
      }
      if (consented) {
        setProfile(await writeProfile(user));
        return true;
      }
      setProfile(null);
      return false;
    } finally {
      setWorking(false);
    }
  }, []);

  const completeConsent = useCallback(async () => {
    const { auth } = requireFirebase();
    if (!auth.currentUser) return;
    setProfile(await writeProfile(auth.currentUser));
  }, []);

  const cancelConsent = useCallback(async () => {
    const { auth } = requireFirebase();
    const u = auth.currentUser;
    if (u) {
      // A brand-new account with no consent should not linger.
      try {
        await deleteUser(u);
      } catch {
        await fbSignOut(auth);
      }
    }
    setProfile(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { auth } = requireFirebase();
    await sendPasswordResetEmail(auth, email);
  }, []);

  const signOut = useCallback(async () => {
    if (auth) await fbSignOut(auth);
  }, []);

  const hasConsent = Boolean(profile?.ageConfirmed18 && profile.acceptedLegalVersion);

  const value = useMemo<AuthState>(
    () => ({
      user: fbUser && hasConsent ? fbUser : null,
      needsConsent: Boolean(fbUser) && !hasConsent && !working && !loading,
      loading,
      configured: isFirebaseConfigured,
      signUpEmail,
      signInEmail,
      signInGoogle,
      completeConsent,
      cancelConsent,
      resetPassword,
      signOut,
    }),
    [fbUser, hasConsent, working, loading, signUpEmail, signInEmail, signInGoogle, completeConsent, cancelConsent, resetPassword, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

/** Plain-language messages for Firebase auth error codes. */
export function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'app/not-configured':
      return 'Sign-in is not set up yet. Add the Firebase keys to .env.local and restart.';
    case 'auth/invalid-email':
      return 'That email address does not look right.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.';
    case 'auth/weak-password':
      return 'Choose a password with at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email or password is incorrect.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a moment and try again.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'The Google window was closed before finishing.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google window. Allow pop-ups and try again.';
    case 'auth/network-request-failed':
      return 'Network problem. Check your connection and try again.';
    case 'permission-denied':
      return 'Database access was denied. Check the Firestore rules.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
