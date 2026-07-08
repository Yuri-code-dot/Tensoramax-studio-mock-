import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sigma, Menu, X, ArrowRight, Calculator, Boxes, Database, Rocket, FolderKanban,
  Store, UsersRound, BookOpen, ShieldCheck, Zap, GitBranch, Check,
  Landmark, BarChart3, Sparkles, Terminal, Cloud, FileText, Cpu, Gauge, Braces,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: 'easeOut' as const },
};

const navLinks = [
  { to: '/workspace', label: 'Workspace' },
  { to: '/ai-studio', label: 'AI Studio' },
  { to: '/models', label: 'Models' },
  { to: '/datasets', label: 'Datasets' },
  { to: '/deploy', label: 'Deploy' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/docs', label: 'Documentation' },
  { to: '/community', label: 'Community' },
  { to: '/pricing', label: 'Pricing' },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3.5 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-cream">
            <Sigma size={18} strokeWidth={2.2} />
          </div>
          <span className="font-display text-lg font-semibold text-ink">TensoraMax <span className="text-primary">Studio</span></span>
        </Link>
        <nav className="ml-4 hidden items-center gap-1 xl:flex" aria-label="Main">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-ink-soft transition hover:bg-primary-soft hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <Link to="/dashboard" className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-primary-dark">
              Dashboard <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-4 py-2 text-[13px] font-semibold text-ink-soft transition hover:text-ink">Sign In</Link>
              <Link to="/signup" className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-primary-dark">Create Account</Link>
            </>
          )}
        </div>
        <button className="ml-auto rounded-lg border border-line bg-surface p-2 text-ink-soft md:ml-0 xl:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-line bg-surface px-4 py-3 xl:hidden" aria-label="Mobile">
          <div className="grid grid-cols-2 gap-1">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-primary-soft">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex gap-2 border-t border-line pt-3">
            {user ? (
              <Link to="/dashboard" className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="flex-1 rounded-lg border border-line px-4 py-2.5 text-center text-sm font-semibold text-ink">Sign In</Link>
                <Link to="/signup" className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white">Create Account</Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">{title}</h2>
      {sub && <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{sub}</p>}
    </motion.div>
  );
}

function MockWindow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_20px_60px_rgba(38,34,25,0.12)]">
      <div className="flex items-center gap-2 border-b border-line bg-cream px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-primary/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/50" />
        <span className="ml-2 text-[11px] font-semibold text-muted">{title}</span>
      </div>
      {children}
    </div>
  );
}

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-cream text-ink">
      <Navbar />

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -top-40 right-0 h-[480px] w-[480px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-40 -left-40 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(217,119,42,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary-soft px-4 py-1.5 text-xs font-semibold text-primary-dark">
              <Sparkles size={13} /> TXB Chat v2.1 is live in the Model Hub
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-6xl">
              Build. Train. <span className="text-primary">Deploy.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-ink-soft sm:text-lg">
              TensoraMax Studio is a unified AI platform for building, training, deploying and managing AI applications, models, datasets and developer workflows — from one workspace.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link to={user ? '/dashboard' : '/signup'} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-dark">
                Start Building <ArrowRight size={15} />
              </Link>
              <Link to="/workspace" className="flex items-center gap-2 rounded-xl border border-line bg-surface px-6 py-3 text-sm font-semibold text-ink transition hover:border-primary/40">
                <FolderKanban size={15} className="text-primary" /> Launch Workspace
              </Link>
              <Link to="/ai-studio" className="flex items-center gap-2 rounded-xl border border-line bg-surface px-6 py-3 text-sm font-semibold text-ink transition hover:border-primary/40">
                <Sparkles size={15} className="text-primary" /> Try AI Studio
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[13px] font-medium">
              <Link to="/models" className="inline-flex items-center gap-1 text-primary hover:underline"><Boxes size={13} /> Browse Models</Link>
              <span className="text-line">•</span>
              <Link to="/accounting" className="inline-flex items-center gap-1 text-primary hover:underline"><Calculator size={13} /> Explore Accounting</Link>
              <span className="text-line">•</span>
              <Link to="/docs" className="inline-flex items-center gap-1 text-primary hover:underline"><BookOpen size={13} /> Documentation</Link>
            </div>
          </motion.div>

          {/* Hero preview */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }} className="mx-auto mt-16 max-w-5xl">
            <MockWindow title="studio.tensoramax.app/dashboard">
              <div className="grid grid-cols-1 gap-0 md:grid-cols-[180px_1fr]">
                <div className="hidden border-r border-line bg-cream/60 p-3 md:block">
                  {[{ i: FolderKanban, l: 'Workspace' }, { i: Sparkles, l: 'AI Studio', active: true }, { i: Boxes, l: 'Models' }, { i: Database, l: 'Datasets' }, { i: Rocket, l: 'Deploy' }, { i: Calculator, l: 'Accounting' }].map(({ i: I, l, active }) => (
                    <div key={l} className={`mb-1 flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-semibold ${active ? 'bg-primary text-white' : 'text-ink-soft'}`}>
                      <I size={12} /> {l}
                    </div>
                  ))}
                </div>
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { l: 'API Requests', v: '18.4M', c: 'text-primary' },
                      { l: 'Deployments', v: '3 live', c: 'text-success' },
                      { l: 'GPU Hours', v: '2,460', c: 'text-ink' },
                      { l: 'Monthly Users', v: '12,480', c: 'text-success' },
                    ].map((k) => (
                      <div key={k.l} className="rounded-xl border border-line bg-cream/50 p-3">
                        <p className="text-[9px] font-bold uppercase tracking-wide text-muted">{k.l}</p>
                        <p className={`mt-1 font-display text-lg font-semibold ${k.c}`}>{k.v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-end gap-2 rounded-xl border border-line bg-cream/40 p-4" style={{ height: 130 }} aria-hidden>
                    {[42, 65, 50, 78, 60, 88, 72, 95, 80, 68, 90, 100].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.5, delay: 0.6 + i * 0.05 }}
                        className="flex-1 rounded-t-md bg-gradient-to-t from-primary/70 to-primary"
                        style={{ opacity: 0.5 + (i / 24) }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </MockWindow>
          </motion.div>

          {/* Stats strip */}
          <motion.div {...fadeUp} className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-6 text-center sm:grid-cols-4">
            {[
              { v: '6', l: 'TXB models' },
              { v: '18.4M', l: 'API requests / mo' },
              { v: '12k+', l: 'Monthly users' },
              { v: '99.9%', l: 'Uptime SLA' },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-display text-3xl font-semibold text-ink">{s.v}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">{s.l}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="Features" title="Everything your team needs, unified" sub="Stop stitching tools together. Studio gives models, data, infrastructure and even your books one home — with shared auth, shared search and one consistent design." />
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { i: Sparkles, t: 'AI Studio', d: 'An interactive playground for prompting, comparing and tuning the TXB model family in the browser.' },
            { i: Boxes, t: 'Model Hub', d: 'Version, evaluate and publish models — from TXB Small at the edge to TXB-1 in production.' },
            { i: Database, t: 'Dataset Hub', d: 'Host, license and stream datasets from megabytes to terabytes with instant previews.' },
            { i: Rocket, t: 'Instant Deploys', d: 'Ship to serverless, GPU endpoints, containers or static sites across four global regions.' },
            { i: Calculator, t: 'Full Accounting', d: 'A complete finance module — companies, ledgers, vouchers, GST, inventory, payroll and live reports.' },
            { i: ShieldCheck, t: 'Enterprise Security', d: 'Role-based access, audit trails and encrypted storage — secure by default on Supabase.' },
          ].map(({ i: I, t, d }, idx) => (
            <motion.div key={t} {...fadeUp} transition={{ duration: 0.5, delay: idx * 0.06 }} className="group rounded-2xl border border-line bg-surface p-6 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary transition group-hover:bg-primary group-hover:text-white">
                <I size={20} />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ STUDIO OVERVIEW ============ */}
      <section className="border-y border-line bg-surface/60">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <SectionHeading eyebrow="Studio Overview" title="One platform. Every module speaks the same language." sub="Modules share authentication, notifications, search and billing. Add a module and your team already knows how to use it." />
          <motion.div {...fadeUp} className="mx-auto mt-12 max-w-3xl">
            <div className="rounded-2xl border border-line bg-cream p-6 font-mono text-[13px] leading-7 text-ink-soft sm:p-8">
              <p className="flex items-center gap-2 font-semibold text-ink"><Terminal size={14} className="text-primary" /> tensoramax-studio/</p>
              {[
                { name: 'workspace', note: 'TXB Workspace — cross-module projects' },
                { name: 'ai-studio', note: 'playground for the TXB model family' },
                { name: 'models', note: 'TXB-1 · Chat · Vision · Code · Small · Reasoning' },
                { name: 'datasets', note: 'training data · conversations · examples' },
                { name: 'deploy', note: 'studio-frontend · api-gateway · model-api' },
                { name: 'marketplace', note: 'modules · templates · agents · plugins' },
              ].map((m) => (
                <p key={m.name}>├── <span className="text-ink">{m.name}</span> <span className="text-muted">— {m.note}</span></p>
              ))}
              <p>└── <span className="font-semibold text-primary">accounting</span> <span className="text-muted">— Tensora Accounting module</span></p>
              {['companies', 'customers', 'suppliers', 'ledgers', 'vouchers', 'inventory', 'gst', 'payroll'].map((s, i, a) => (
                <p key={s} className="pl-6">{i === a.length - 1 ? '└──' : '├──'} {s}</p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ WORKSPACE PREVIEW ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <motion.div {...fadeUp}>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Workspace</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-ink">Your projects, every module, one board</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
              Create projects that span models, datasets, deployments and finance. Track status, jump into any module, and keep the whole team aligned from a single view.
            </p>
            <ul className="mt-6 space-y-3">
              {['Cross-module project tracking', 'Status workflow — Active, Paused, Archived', 'Real-time activity feed', 'Instant module deep-links'].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-ink-soft"><Check size={15} className="shrink-0 text-success" /> {f}</li>
              ))}
            </ul>
            <Link to="/workspace" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark">
              Launch Workspace <ArrowRight size={14} />
            </Link>
          </motion.div>
          <motion.div {...fadeUp} transition={{ duration: 0.55, delay: 0.1 }}>
            <MockWindow title="Workspace — Projects">
              <div className="space-y-2.5 p-5">
                {[
                  { n: 'TXB Workspace', m: 'General', s: 'Active', i: FolderKanban },
                  { n: 'Model Hub', m: 'Models', s: 'Active', i: Boxes },
                  { n: 'Deploy Platform', m: 'Deploy', s: 'Active', i: Rocket },
                  { n: 'Tensora Accounting', m: 'Accounting', s: 'Active', i: Calculator },
                ].map(({ n, m, s, i: I }) => (
                  <div key={n} className="flex items-center gap-3 rounded-xl border border-line bg-cream/40 px-4 py-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary"><I size={16} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-ink">{n}</p>
                      <p className="text-[11px] text-muted">{m}</p>
                    </div>
                    <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-[10px] font-bold text-success">{s}</span>
                  </div>
                ))}
              </div>
            </MockWindow>
          </motion.div>
        </div>
      </section>

      {/* ============ ACCOUNTING PREVIEW ============ */}
      <section className="border-y border-line bg-surface/60">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <motion.div {...fadeUp} transition={{ duration: 0.55, delay: 0.1 }} className="order-2 lg:order-1">
              <MockWindow title="Tensora Accounting — Overview">
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { l: 'Receivables', v: '₹13.2L', i: BarChart3 },
                      { l: 'Payables', v: '₹13.8L', i: FileText },
                      { l: 'Net GST', v: '₹3.2L', i: Landmark },
                    ].map(({ l, v, i: I }) => (
                      <div key={l} className="rounded-xl border border-line bg-cream/40 p-3">
                        <I size={13} className="text-primary" />
                        <p className="mt-1.5 text-[9px] font-bold uppercase tracking-wide text-muted">{l}</p>
                        <p className="font-display text-sm font-semibold text-ink">{v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 overflow-hidden rounded-xl border border-line">
                    {[
                      ['INV-1002', 'Northwind Retail Group', '₹4,13,000', 'Paid'],
                      ['INV-1001', 'Meridian Analytics', '₹7,67,000', 'Unpaid'],
                      ['INV-1006', 'Meridian Analytics', '₹2,24,200', 'Overdue'],
                    ].map(([no, p, amt, st]) => (
                      <div key={no} className="flex items-center gap-3 border-b border-line/60 bg-surface px-3.5 py-2.5 text-[11px] last:border-0">
                        <span className="font-semibold text-primary">{no}</span>
                        <span className="flex-1 truncate text-ink-soft">{p}</span>
                        <span className="font-semibold text-ink">{amt}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${st === 'Paid' ? 'bg-success/10 text-success' : st === 'Overdue' ? 'bg-danger/10 text-danger' : 'bg-primary-soft text-primary-dark'}`}>{st}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </MockWindow>
            </motion.div>
            <motion.div {...fadeUp} className="order-1 lg:order-2">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Tensora Accounting · Studio Module</p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-ink">Run the business side, right next to the AI side</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
                Unlimited companies, double-entry ledgers, vouchers, GST filings, inventory, customers, suppliers, banking, payroll and live financial reports — fully integrated into Studio.
              </p>
              <ul className="mt-6 grid grid-cols-2 gap-2.5">
                {[
                  ['Companies', Calculator], ['Ledgers', BookOpen], ['Vouchers', FileText], ['GST Returns', Landmark],
                  ['Inventory', Cpu], ['Reports', BarChart3],
                ].map(([f, I]) => {
                  const Icon = I as typeof Calculator;
                  return (
                    <li key={f as string} className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-[13px] font-medium text-ink-soft">
                      <Icon size={14} className="text-primary" /> {f as string}
                    </li>
                  );
                })}
              </ul>
              <Link to="/accounting" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark">
                Explore Accounting <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ MODEL HUB + DATASET HUB ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="Hubs" title="The TXB model family & its data" sub="Publish, discover and deploy — the Model Hub and Dataset Hub give your AI assets first-class treatment." />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <motion.div {...fadeUp}>
            <MockWindow title="Model Hub">
              <div className="space-y-2.5 p-5">
                {[
                  { n: 'TXB-1', t: 'NLP · flagship', p: '70B', d: '48.2k' },
                  { n: 'TXB Chat', t: 'NLP · dialogue', p: '34B', d: '36.5k' },
                  { n: 'TXB Vision', t: 'Vision · multimodal', p: '12B', d: '21.9k' },
                ].map((m) => (
                  <div key={m.n} className="flex items-center gap-3 rounded-xl border border-line bg-cream/40 px-4 py-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary"><Boxes size={16} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-[12px] font-semibold text-ink">{m.n}</p>
                      <p className="text-[11px] text-muted">{m.t} · {m.p} params</p>
                    </div>
                    <span className="text-[11px] font-semibold text-muted">⤓ {m.d}</span>
                  </div>
                ))}
                <Link to="/models" className="block pt-1 text-center text-[13px] font-semibold text-primary hover:underline">Browse all models →</Link>
              </div>
            </MockWindow>
          </motion.div>
          <motion.div {...fadeUp} transition={{ duration: 0.55, delay: 0.1 }}>
            <MockWindow title="Dataset Hub">
              <div className="space-y-2.5 p-5">
                {[
                  { n: 'txb-training-dataset', f: 'Parquet', r: '48M rows', s: '2.1 TB' },
                  { n: 'ai-conversations', f: 'JSONL', r: '12.4M rows', s: '94 GB' },
                  { n: 'public-examples', f: 'JSON', r: '54k rows', s: '310 MB' },
                ].map((d) => (
                  <div key={d.n} className="flex items-center gap-3 rounded-xl border border-line bg-cream/40 px-4 py-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary"><Database size={16} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-[12px] font-semibold text-ink">{d.n}</p>
                      <p className="text-[11px] text-muted">{d.f} · {d.r}</p>
                    </div>
                    <span className="text-[11px] font-semibold text-muted">{d.s}</span>
                  </div>
                ))}
                <Link to="/datasets" className="block pt-1 text-center text-[13px] font-semibold text-primary hover:underline">Browse all datasets →</Link>
              </div>
            </MockWindow>
          </motion.div>
        </div>
      </section>

      {/* ============ COMMUNITY ============ */}
      <section className="border-y border-line bg-surface/60">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <SectionHeading eyebrow="Community" title="Built with 12,000+ makers" sub="Engineers, data scientists and finance teams shape the roadmap together. Join discussions, share templates and get answers fast." />
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {[
              { q: 'We fine-tuned TXB Small on our support conversations and shipped it to a GPU endpoint the same week. The whole loop lives in one place.', a: 'Shruti Deshmukh', r: 'Senior ML Engineer' },
              { q: 'Our finance team closes books in the Accounting module while engineering ships from Deploy — same login, same design, zero context switching.', a: 'Divya Raghavan', r: 'Finance Controller' },
              { q: 'The CLI plus the TypeScript SDK made our CI pipeline trivial. `txb deploy` and we are live in Mumbai and Virginia.', a: 'Rohan Iyer', r: 'DevOps Engineer' },
            ].map((t, i) => (
              <motion.figure key={t.a} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.08 }} className="flex flex-col rounded-2xl border border-line bg-surface p-6">
                <blockquote className="flex-1 text-sm leading-relaxed text-ink-soft">“{t.q}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary-dark">{t.a.split(' ').map((w) => w[0]).join('')}</span>
                  <div>
                    <p className="text-[13px] font-semibold text-ink">{t.a}</p>
                    <p className="text-[11px] text-muted">{t.r}</p>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
          <motion.div {...fadeUp} className="mt-10 text-center">
            <Link to="/community" className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-6 py-3 text-sm font-semibold text-ink transition hover:border-primary/40">
              <UsersRound size={15} className="text-primary" /> Join the Community
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="Pricing" title="Simple plans that scale with you" sub="Start free. Upgrade when your models, traffic or team grow." />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {[
            { name: 'Starter', price: '₹0', per: 'forever', hl: false, cta: 'Start Building', feats: ['2 projects', 'TXB Small access', '100k API requests / mo', '1 deployment', 'Community support'] },
            { name: 'Professional', price: '₹2,499', per: 'per month', hl: true, cta: 'Start 14-day Trial', feats: ['Unlimited projects', 'Full TXB model family', '5M API requests / mo', '10 deployments · GPU endpoints', 'Accounting module included', 'Priority support'] },
            { name: 'Enterprise', price: 'Custom', per: 'annual billing', hl: false, cta: 'Contact Sales', feats: ['Everything in Pro', 'Dedicated GPU capacity', 'SSO & audit logs', 'Custom modules', 'SLA & onboarding'] },
          ].map((p, i) => (
            <motion.div key={p.name} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.08 }} className={`relative flex flex-col rounded-2xl border p-7 ${p.hl ? 'border-primary bg-surface shadow-xl shadow-primary/10' : 'border-line bg-surface'}`}>
              {p.hl && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Most Popular</span>}
              <h3 className="font-display text-lg font-semibold text-ink">{p.name}</h3>
              <p className="mt-3"><span className="font-display text-4xl font-semibold text-ink">{p.price}</span> <span className="text-xs text-muted">/ {p.per}</span></p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {p.feats.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-ink-soft"><Check size={14} className="shrink-0 text-success" /> {f}</li>
                ))}
              </ul>
              <Link to={p.name === 'Enterprise' ? '/community' : '/signup'} className={`mt-7 rounded-xl px-5 py-2.5 text-center text-sm font-semibold transition ${p.hl ? 'bg-primary text-white hover:bg-primary-dark' : 'border border-line text-ink hover:border-primary/40'}`}>
                {p.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ DOCUMENTATION ============ */}
      <section className="border-t border-line bg-surface/60">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <motion.div {...fadeUp}>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Documentation</p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-ink">Learn once, use everywhere</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
                Guides for every module, an API reference for every route, SDKs for Python and TypeScript, and a CLI for your pipelines — documented end to end.
              </p>
              <Link to="/docs" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark">
                <BookOpen size={15} /> Read the Docs
              </Link>
            </motion.div>
            <motion.div {...fadeUp} transition={{ duration: 0.55, delay: 0.1 }} className="grid gap-3 sm:grid-cols-2">
              {[
                { i: Zap, t: 'Getting Started', d: '5 minutes to your first project' },
                { i: GitBranch, t: 'API Reference', d: 'REST routes for every module' },
                { i: Braces, t: 'SDKs', d: 'Python & TypeScript clients' },
                { i: Cloud, t: 'CLI', d: 'txb deploy from any pipeline' },
              ].map(({ i: I, t, d }) => (
                <Link key={t} to="/docs" className="group rounded-2xl border border-line bg-surface p-5 transition hover:border-primary/30 hover:shadow-md">
                  <I size={18} className="text-primary" />
                  <p className="mt-3 text-sm font-semibold text-ink group-hover:text-primary">{t}</p>
                  <p className="mt-1 text-xs text-muted">{d}</p>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <motion.div {...fadeUp} className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center sm:px-12">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          </div>
          <h2 className="relative font-display text-3xl font-semibold text-white sm:text-4xl">Build. Train. Deploy.</h2>
          <p className="relative mx-auto mt-4 max-w-lg text-[15px] text-white/85">Create your account and get the full TensoraMax Studio — models, datasets, deployments and your books — in one workspace.</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link to={user ? '/dashboard' : '/signup'} className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary transition hover:bg-cream">Start Building</Link>
            <Link to="/ai-studio" className="rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Try AI Studio</Link>
          </div>
        </motion.div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-line bg-surface/60">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-cream"><Sigma size={18} /></div>
                <span className="font-display text-lg font-semibold text-ink">TensoraMax Studio</span>
              </div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">Build. Train. Deploy.</p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">A unified AI platform for building, training, deploying and managing AI applications, models, datasets and developer workflows.</p>
            </div>
            {[
              { h: 'Platform', links: [['Dashboard', '/dashboard'], ['Workspace', '/workspace'], ['AI Studio', '/ai-studio'], ['Models', '/models'], ['Datasets', '/datasets'], ['Deploy', '/deploy']] },
              { h: 'Resources', links: [['Documentation', '/docs'], ['Marketplace', '/marketplace'], ['Community', '/community'], ['Pricing', '/pricing'], ['Accounting', '/accounting']] },
              { h: 'Company', links: [['About', '/about'], ['Blog', '/blog'], ['GitHub', '/docs'], ['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact']] },
            ].map((col) => (
              <nav key={col.h} aria-label={col.h}>
                <p className="text-xs font-bold uppercase tracking-wide text-ink">{col.h}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map(([l, to]) => (
                    <li key={l}><Link to={to} className="text-[13px] text-muted transition hover:text-primary">{l}</Link></li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 sm:flex-row">
            <p className="text-xs text-muted">© {new Date().getFullYear()} TensoraMax Studio. All rights reserved.</p>
            <p className="flex items-center gap-1.5 text-xs text-muted"><Gauge size={12} /> 99.9% uptime · Status: all systems operational</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
