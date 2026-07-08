import type { ReactNode } from 'react';
import { Loader2, AlertTriangle, Inbox } from 'lucide-react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(38,34,25,0.05)] ${className}`}>{children}</div>;
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
      <div>
        <h3 className="font-display text-[15px] font-semibold text-ink">{title}</h3>
        {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-muted">
      <Loader2 size={18} className="animate-spin text-primary" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger/5 px-4 py-10 text-danger">
      <AlertTriangle size={18} />
      <span className="text-sm">{message}</span>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-muted">
      <Inbox size={26} />
      <span className="text-sm">{message}</span>
    </div>
  );
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'primary' }) {
  const tones: Record<string, string> = {
    neutral: 'bg-cream text-ink-soft border-line',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-primary-soft text-primary-dark border-primary/25',
    danger: 'bg-danger/10 text-danger border-danger/20',
    primary: 'bg-primary text-white border-primary',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone = status === 'Paid' || status === 'Active' || status === 'Completed' || status === 'Filed'
    ? 'success'
    : status === 'Overdue' || status === 'Inactive'
      ? 'danger'
      : status === 'Unpaid' || status === 'Pending' || status === 'Draft'
        ? 'warning'
        : 'neutral';
  return <Badge tone={tone as 'success'}>{status}</Badge>;
}

export function Field({ label, children, error }: { label: string; children: ReactNode; error?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}

export const inputCls =
  'w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted';

export function PrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-50 ${props.className || ''}`}
    >
      {children}
    </button>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-line bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-muted hover:bg-cream" aria-label="Close dialog">✕</button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
