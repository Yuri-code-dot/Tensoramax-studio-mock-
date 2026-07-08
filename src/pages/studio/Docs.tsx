import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Zap, Calculator, GitBranch, Boxes, Rocket, ChevronRight, Search,
  FolderKanban, ShieldCheck, Database, Store, Braces, Terminal, FlaskConical, LayoutDashboard,
} from 'lucide-react';
import { Card, inputCls, Badge } from '../../components/ui';

const sections = [
  {
    id: 'getting-started', icon: Zap, title: 'Getting Started', tag: 'Start here',
    body: [
      ['Create your account', 'Sign in with Google, GitHub or email. You land on the Studio Dashboard with every module ready.'],
      ['Tour the dashboard', 'Platform metrics — API requests, GPU hours, storage — update live as your team works.'],
      ['Create your first project', 'Workspace → New Project. Link it to a module so work stays organized from day one.'],
      ['Invite your team', 'Accounting → Users manages roles: Admin, Accountant and Viewer.'],
    ],
  },
  {
    id: 'studio-guide', icon: LayoutDashboard, title: 'Studio Guide', tag: 'Platform',
    body: [
      ['One unified shell', 'Every module shares navigation, search, notifications and account state — learn it once, use it everywhere.'],
      ['Modules', 'Workspace, AI Studio, Accounting, Models, Datasets, Deploy, Marketplace and Community.'],
      ['Design language', 'Warm cream surfaces, orange accents, Fraunces display type — consistent across all modules.'],
    ],
  },
  {
    id: 'workspace', icon: FolderKanban, title: 'Workspace', tag: 'Module',
    body: [
      ['Projects', 'Cross-module project cards with status workflow: Active → Paused → Archived.'],
      ['Deep links', 'Each project links straight into its module — Accounting, Models, Datasets or Deploy.'],
      ['Activity', 'The dashboard activity feed aggregates events from every module in real time.'],
    ],
  },
  {
    id: 'authentication', icon: ShieldCheck, title: 'Authentication', tag: 'Platform',
    body: [
      ['Providers', 'Google, GitHub and email/password — all powered by Supabase Auth.'],
      ['Sessions', 'Sessions persist across tabs and refresh automatically; the dashboard is a protected route.'],
      ['Password reset', 'Forgot Password sends a secure reset link to the account email.'],
    ],
  },
  {
    id: 'model-hub', icon: Boxes, title: 'Model Hub', tag: 'Module',
    body: [
      ['The TXB family', 'TXB-1 (70B flagship), TXB Chat, TXB Vision, TXB Code, TXB Small and TXB Reasoning.'],
      ['Publishing', 'Models → Publish Model with task, parameter count, version and lifecycle status.'],
      ['Lifecycle', 'Draft → Training → Published. Published models are servable from Deploy.'],
    ],
  },
  {
    id: 'dataset-hub', icon: Database, title: 'Dataset Hub', tag: 'Module',
    body: [
      ['Hosting', 'Upload datasets in CSV, Parquet, JSON, JSONL or Arrow with row counts, size and license.'],
      ['Core datasets', 'txb-training-dataset, documentation-dataset, ai-conversations, workspace-logs and public-examples.'],
      ['Licensing', 'Choose from MIT, Apache-2.0, CC-BY-4.0, CC0 or Proprietary at upload time.'],
    ],
  },
  {
    id: 'deploy', icon: Rocket, title: 'Deploy', tag: 'Module',
    body: [
      ['Targets', 'Serverless, GPU Endpoint, Static Site and Container deployments across four regions.'],
      ['Core services', 'studio-frontend, api-gateway, model-api and workspace-backend run on this platform.'],
      ['Lifecycle', 'Start and stop endpoints with one click; every deployment gets a stable *.tensoramax.app URL.'],
    ],
  },
  {
    id: 'marketplace', icon: Store, title: 'Marketplace', tag: 'Module',
    body: [
      ['Listings', 'Authentication Module, Dashboard Templates, AI Agents and Developer Plugins — install with one click.'],
      ['Modules vs extensions', 'Modules add whole surfaces (like Accounting); extensions enhance existing ones.'],
    ],
  },
  {
    id: 'accounting', icon: Calculator, title: 'Accounting Module', tag: 'Module',
    body: [
      ['Companies', 'Unlimited companies with full edit/delete; switching re-scopes every accounting page.'],
      ['Books', 'Ledgers, vouchers (Payment / Receipt / Journal / Contra / Sales / Purchase), customers, suppliers and inventory.'],
      ['GST & reports', 'GSTR-1/3B records per period, plus live P&L, Balance Sheet, Trial Balance and Day Book.'],
    ],
  },
  {
    id: 'api-reference', icon: GitBranch, title: 'API Reference', tag: 'Developers',
    body: [
      ['REST routes', '/api/studio (resource=projects|models|datasets|deployments|activity|notifications|metrics), plus /api/companies, /api/ledgers, /api/vouchers, /api/invoices, /api/parties, /api/gst-records, /api/inventory.'],
      ['Methods', 'GET lists, POST creates, PUT updates, DELETE removes. All payloads are JSON.'],
      ['Scoping', 'Accounting routes accept ?company_id= to scope results to a company.'],
    ],
  },
  {
    id: 'sdks', icon: Braces, title: 'SDKs', tag: 'Developers',
    body: [
      ['Python', 'pip install tensoramax — Studio client with chat, embeddings, datasets and deploy namespaces.'],
      ['TypeScript', 'npm install @tensoramax/sdk — typed client for browser and Node with streaming support.'],
      ['Auth', 'Create API keys from your account menu; pass as Authorization: Bearer txb_…'],
    ],
  },
  {
    id: 'cli', icon: Terminal, title: 'CLI', tag: 'Developers',
    body: [
      ['Install', 'npm install -g @tensoramax/cli — then `txb login` to authenticate.'],
      ['Common commands', '`txb deploy` ships the current directory · `txb models list` · `txb datasets push <file>`.'],
      ['CI/CD', 'Use `txb deploy --token $TXB_TOKEN` in pipelines for non-interactive deploys.'],
    ],
  },
  {
    id: 'examples', icon: FlaskConical, title: 'Examples', tag: 'Learn',
    body: [
      ['Chat app in 10 minutes', 'Wire TXB Chat to a React frontend using the TypeScript SDK with streaming.'],
      ['Invoice intelligence', 'Combine the Accounting API with TXB Reasoning to flag overdue-payment patterns.'],
      ['Fine-tune TXB Small', 'Use ai-conversations from the Dataset Hub to fine-tune a domain assistant, then deploy it.'],
    ],
  },
];

export default function Docs() {
  const [active, setActive] = useState('getting-started');
  const [search, setSearch] = useState('');
  const current = sections.find((s) => s.id === active)!;
  const filtered = search
    ? sections.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()) || s.body.some(([h, b]) => (h + b).toLowerCase().includes(search.toLowerCase())))
    : sections;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className={`${inputCls} pl-9`} placeholder="Search docs…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Card className="overflow-hidden">
          <nav aria-label="Documentation">
            {filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`flex w-full items-center gap-2.5 border-b border-line/60 px-4 py-3 text-left text-[13px] font-medium transition last:border-0 ${active === s.id ? 'bg-primary-soft text-ink' : 'text-ink-soft hover:bg-cream'}`}
              >
                <s.icon size={15} className="shrink-0 text-primary" />
                <span className="flex-1">{s.title}</span>
                <ChevronRight size={13} className="text-muted" />
              </button>
            ))}
            {filtered.length === 0 && <p className="px-4 py-6 text-center text-sm text-muted">No results.</p>}
          </nav>
        </Card>
        <Card className="p-4">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-ink"><BookOpen size={14} className="text-primary" /> Try it live</p>
          <p className="mt-1 text-xs text-muted">The AI Studio playground is the fastest way to explore the TXB models.</p>
          <Link to="/ai-studio" className="mt-2 inline-block text-xs font-semibold text-primary hover:underline">Open AI Studio →</Link>
        </Card>
      </div>

      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary"><current.icon size={20} /></div>
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">{current.title}</h2>
            <Badge tone="primary">{current.tag}</Badge>
          </div>
        </div>
        <div className="mt-6 space-y-5">
          {current.body.map(([h, b], i) => (
            <div key={h} className="rounded-xl border border-line bg-cream/40 p-5">
              <p className="flex items-center gap-2 text-[14px] font-semibold text-ink">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[11px] font-bold text-white">{i + 1}</span>
                {h}
              </p>
              <p className="mt-2 pl-8 text-[13.5px] leading-relaxed text-ink-soft">{b}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
