import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Boxes, LayoutDashboard, Bot, Puzzle, ShieldCheck, Store, Check, Sparkles, Braces } from 'lucide-react';
import { Card, Badge, PrimaryButton } from '../../components/ui';

const listings = [
  { id: 1, name: 'Tensora Accounting', by: 'TensoraMax', desc: 'Full double-entry accounting — companies, ledgers, vouchers, GST, inventory, payroll and reports.', icon: Calculator, tag: 'Module', to: '/accounting', price: 'Included' },
  { id: 2, name: 'Authentication Module', by: 'TensoraMax', desc: 'Drop-in auth for your apps — Google, GitHub and email flows with session management and RBAC.', icon: ShieldCheck, tag: 'Module', to: '/docs', price: 'Free' },
  { id: 3, name: 'Dashboard Templates', by: 'TensoraMax', desc: 'Production-ready analytics, admin and billing dashboard layouts in the Studio design language.', icon: LayoutDashboard, tag: 'Templates', to: '/docs', price: '₹999' },
  { id: 4, name: 'AI Agents', by: 'TensoraMax Labs', desc: 'Autonomous agents built on TXB Reasoning — research, support triage and workflow automation.', icon: Bot, tag: 'Agents', to: '/ai-studio', price: '₹1,499/mo' },
  { id: 5, name: 'Developer Plugins', by: 'community', desc: 'VS Code, JetBrains and terminal plugins for the TXB SDKs with inline completion via TXB Code.', icon: Puzzle, tag: 'Plugins', to: '/docs', price: 'Free' },
  { id: 6, name: 'TXB Model Pack', by: 'TensoraMax', desc: 'Priority access to the full TXB family with higher rate limits and early releases.', icon: Boxes, tag: 'Models', to: '/models', price: '₹2,999/mo' },
  { id: 7, name: 'SDK Starter Kits', by: 'community', desc: 'Example apps for Python and TypeScript — chat, RAG, and fine-tuning pipelines ready to clone.', icon: Braces, tag: 'Templates', to: '/docs', price: 'Free' },
];

const TAGS = ['All', 'Module', 'Templates', 'Agents', 'Plugins', 'Models'];

export default function Marketplace() {
  const [tag, setTag] = useState('All');
  const [installed, setInstalled] = useState<number[]>([1]);
  const filtered = tag === 'All' ? listings : listings.filter((l) => l.tag === tag);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-xl border border-primary/25 bg-primary-soft/50 px-5 py-4">
        <Sparkles size={18} className="shrink-0 text-primary" />
        <p className="text-sm text-ink-soft"><strong className="text-ink">Tensora Accounting</strong> is installed in your workspace — the first official Studio module.</p>
        <Link to="/accounting" className="ml-auto shrink-0 text-[13px] font-semibold text-primary hover:underline">Open →</Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {TAGS.map((t) => (
          <button key={t} onClick={() => setTag(t)} className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${tag === t ? 'border-primary bg-primary text-white' : 'border-line bg-surface text-ink-soft hover:border-primary/40'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((l) => {
          const isInstalled = installed.includes(l.id);
          return (
            <Card key={l.id} className="flex flex-col p-5 transition hover:border-primary/40">
              <div className="flex items-start justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary"><l.icon size={20} /></div>
                <Badge tone={l.tag === 'Module' ? 'primary' : 'neutral'}>{l.tag}</Badge>
              </div>
              <h3 className="mt-3 font-display text-[15px] font-semibold text-ink">{l.name}</h3>
              <p className="text-[11px] text-muted">by {l.by}</p>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-ink-soft">{l.desc}</p>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <span className="text-[13px] font-semibold text-ink">{l.price}</span>
                {isInstalled ? (
                  <Link to={l.to} className="flex items-center gap-1.5 rounded-lg bg-success/10 px-3.5 py-2 text-[12px] font-bold text-success">
                    <Check size={13} /> Installed · Open
                  </Link>
                ) : (
                  <PrimaryButton onClick={() => setInstalled((prev) => [...prev, l.id])} className="!px-3.5 !py-2 !text-[12px]">
                    <Store size={13} /> Install
                  </PrimaryButton>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
