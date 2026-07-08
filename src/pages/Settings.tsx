import { useState } from 'react';
import { Download } from 'lucide-react';
import { useCompany } from '../contexts/CompanyContext';
import { Card, CardHeader, Field, inputCls, PrimaryButton, Badge, Loading } from '../components/ui';

export default function SettingsPage() {
  const { company, loading } = useCompany();
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState({
    currency: 'INR (₹)',
    dateFormat: 'DD-MM-YYYY',
    fyStartMonth: 'April',
    gstScheme: 'Regular',
    defaultGst: '18',
    einvoice: true,
    lowStockAlerts: true,
    autoReconcile: false,
  });

  if (loading) return <Loading label="Loading settings…" />;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative h-6 w-11 rounded-full transition ${value ? 'bg-primary' : 'bg-line'}`}
      aria-pressed={value}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow transition-all ${value ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );

  return (
    <form onSubmit={save} className="max-w-3xl space-y-5">
      <Card>
        <CardHeader title="Company Profile" subtitle="Details of the active company" action={<Badge tone="primary">Active</Badge>} />
        <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2">
          <Field label="Company Name"><input className={inputCls} defaultValue={company?.name} readOnly /></Field>
          <Field label="GSTIN"><input className={inputCls} defaultValue={company?.gstin} readOnly /></Field>
          <Field label="PAN"><input className={inputCls} defaultValue={company?.pan} readOnly /></Field>
          <Field label="State"><input className={inputCls} defaultValue={company?.state} readOnly /></Field>
        </div>
      </Card>

      <Card>
        <CardHeader title="Preferences" subtitle="Books & display settings" />
        <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2">
          <Field label="Base Currency">
            <select className={inputCls} value={prefs.currency} onChange={(e) => setPrefs({ ...prefs, currency: e.target.value })}>
              <option>INR (₹)</option><option>USD ($)</option><option>AED (د.إ)</option>
            </select>
          </Field>
          <Field label="Date Format">
            <select className={inputCls} value={prefs.dateFormat} onChange={(e) => setPrefs({ ...prefs, dateFormat: e.target.value })}>
              <option>DD-MM-YYYY</option><option>MM-DD-YYYY</option><option>YYYY-MM-DD</option>
            </select>
          </Field>
          <Field label="Financial Year Starts">
            <select className={inputCls} value={prefs.fyStartMonth} onChange={(e) => setPrefs({ ...prefs, fyStartMonth: e.target.value })}>
              <option>April</option><option>January</option><option>July</option>
            </select>
          </Field>
          <Field label="GST Scheme">
            <select className={inputCls} value={prefs.gstScheme} onChange={(e) => setPrefs({ ...prefs, gstScheme: e.target.value })}>
              <option>Regular</option><option>Composition</option>
            </select>
          </Field>
          <Field label="Default GST Rate">
            <select className={inputCls} value={prefs.defaultGst} onChange={(e) => setPrefs({ ...prefs, defaultGst: e.target.value })}>
              {['0', '5', '12', '18', '28'].map((r) => <option key={r} value={r}>{r}%</option>)}
            </select>
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title="Automation" subtitle="Smart features" />
        <div className="space-y-4 px-5 py-5">
          {[
            { key: 'einvoice' as const, label: 'E-Invoice generation', desc: 'Generate IRN & QR for B2B invoices automatically' },
            { key: 'lowStockAlerts' as const, label: 'Low stock alerts', desc: 'Notify when items fall below reorder level' },
            { key: 'autoReconcile' as const, label: 'Auto bank reconciliation', desc: 'Match imported statements with vouchers' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">{label}</p>
                <p className="text-xs text-muted">{desc}</p>
              </div>
              <Toggle value={prefs[key]} onChange={(v) => setPrefs({ ...prefs, [key]: v })} />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <PrimaryButton type="submit">Save Preferences</PrimaryButton>
        {saved && <span className="text-sm font-medium text-success">Preferences saved ✓</span>}
      </div>

      <Card>
        <CardHeader title="Export" subtitle="Take your project with you" />
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div>
            <p className="text-sm font-medium text-ink">Download full source code</p>
            <p className="text-xs text-muted">
              React + Vite + Tailwind frontend, serverless API routes, and a README with Supabase setup instructions (.zip)
            </p>
          </div>
          <a
            href="/tensoramax-accounting-source.zip"
            download
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
          >
            <Download size={15} /> Download .zip
          </a>
        </div>
      </Card>
    </form>
  );
}
