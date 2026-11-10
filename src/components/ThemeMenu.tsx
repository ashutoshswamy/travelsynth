import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Monitor, Moon, Sun } from 'lucide-react';
import './ThemeMenu.css';

export type ThemePref = 'light' | 'dark' | 'system';

const OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

interface ThemeMenuProps {
  value: ThemePref;
  onChange: (v: ThemePref) => void;
  /** "shell" sits on the cobalt header, "paper" on the page background. */
  tone?: 'shell' | 'paper';
}

export function ThemeMenu({ value, onChange, tone = 'shell' }: ThemeMenuProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();
  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[2];
  const CurrentIcon = current.icon;

  // Close on outside press.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  // Move focus to the selected item when opened.
  useEffect(() => {
    if (open) items.current[OPTIONS.findIndex((o) => o.value === value)]?.focus();
  }, [open, value]);

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  };

  const onMenuKey = (e: React.KeyboardEvent) => {
    const i = items.current.findIndex((el) => el === document.activeElement);
    const focus = (n: number) => items.current[(n + OPTIONS.length) % OPTIONS.length]?.focus();
    if (e.key === 'ArrowDown') { e.preventDefault(); focus(i + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focus(i - 1); }
    else if (e.key === 'Home') { e.preventDefault(); focus(0); }
    else if (e.key === 'End') { e.preventDefault(); focus(OPTIONS.length - 1); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') setOpen(false);
  };

  return (
    <div className={`tm tm-${tone}`} ref={root}>
      <button
        ref={trigger}
        type="button"
        className="tm-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Theme: ${current.label}`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); }
        }}
      >
        <CurrentIcon size={17} aria-hidden />
        <span className="tm-label">{current.label}</span>
        <ChevronDown size={16} aria-hidden className="tm-chev" />
      </button>

      {open && (
        <div id={menuId} className="tm-menu" role="menu" aria-label="Theme" onKeyDown={onMenuKey}>
          {OPTIONS.map((o, i) => {
            const Icon = o.icon;
            const selected = o.value === value;
            return (
              <button
                key={o.value}
                ref={(el) => { items.current[i] = el; }}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                className="tm-item"
                onClick={() => { onChange(o.value); close(); }}
              >
                <Icon size={17} aria-hidden />
                <span>{o.label}</span>
                {selected && <Check size={16} aria-hidden className="tm-check" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
