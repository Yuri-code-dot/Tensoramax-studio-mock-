import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sigma, ArrowLeft, Mail, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { Card } from '../../components/ui';

function PageShell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-line bg-cream/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-cream"><Sigma size={18} strokeWidth={2.2} /></div>
            <span className="font-display text-lg font-semibold text-ink">TensoraMax <span className="text-primary">Studio</span></span>
          </Link>
          <Link to="/" className="ml-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline"><ArrowLeft size={13} /> Back to home</Link>
        </div>
      </header>
      <motion.main initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{sub}</p>
        <div className="mt-10">{children}</div>
      </motion.main>
      <footer className="border-t border-line py-8 text-center text-xs text-muted">© {new Date().getFullYear()} TensoraMax Studio · Build. Train. Deploy.</footer>
    </div>
  );
}

export function About() {
  return (
    <PageShell title="About TensoraMax" sub="TensoraMax builds the unified AI platform for modern teams — one workspace for building, training, deploying and managing AI applications, models, datasets and developer workflows.">
      <div className="space-y-5">
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Our mission</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            AI teams shouldn't spend their week stitching tools together. TensoraMax Studio unifies the whole lifecycle — the TXB model family, dataset hosting, managed deployments, a browser playground, and even a full accounting module — behind one login and one design language.
          </p>
        </Card>
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            { v: '2023', l: 'Founded in Bengaluru' },
            { v: '6', l: 'TXB models published' },
            { v: '12,480', l: 'Monthly active users' },
          ].map((s) => (
            <Card key={s.l} className="p-6 text-center">
              <p className="font-display text-3xl font-semibold text-primary">{s.v}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">{s.l}</p>
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-ink">What we build</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>• <strong className="text-ink">TXB model family</strong> — from the 70B flagship TXB-1 to the edge-ready TXB Small.</li>
            <li>• <strong className="text-ink">Studio platform</strong> — Workspace, AI Studio, Model Hub, Dataset Hub, Deploy and Marketplace.</li>
            <li>• <strong className="text-ink">Tensora Accounting</strong> — a complete finance module so the business side lives next to the AI side.</li>
          </ul>
        </Card>
      </div>
    </PageShell>
  );
}

const posts = [
  { date: '02 Jul 2025', title: 'Introducing TXB Chat v2.1: faster, sharper, multilingual', tag: 'Models', excerpt: 'Our dialogue model gets a major upgrade — 40% lower latency on model-api and stronger multilingual instruction following across 14 languages.' },
  { date: '18 Jun 2025', title: 'How we run our own books on Tensora Accounting', tag: 'Product', excerpt: 'From GPU invoices to GST filings — a look at how the TensoraMax finance team closes the month entirely inside Studio.' },
  { date: '05 Jun 2025', title: 'The AI Studio playground is now generally available', tag: 'Product', excerpt: 'Prompt, compare and tune the full TXB family in the browser, with temperature and token controls and one-click deploys.' },
  { date: '21 May 2025', title: 'Scaling model-api to 6M inference requests a month', tag: 'Engineering', excerpt: 'Autoscaling GPU endpoints, request coalescing and the region strategy behind our 99.9% uptime SLA.' },
];

export function Blog() {
  return (
    <PageShell title="Blog" sub="Product updates, engineering deep-dives and stories from the TensoraMax team.">
      <div className="space-y-4">
        {posts.map((p) => (
          <Card key={p.title} className="group cursor-pointer p-6 transition hover:border-primary/40 hover:shadow-md">
            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="flex items-center gap-1"><Calendar size={11} /> {p.date}</span>
              <span className="rounded-full bg-primary-soft px-2.5 py-0.5 font-semibold text-primary-dark">{p.tag}</span>
            </div>
            <h2 className="mt-2 font-display text-lg font-semibold text-ink transition group-hover:text-primary">{p.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{p.excerpt}</p>
            <p className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-primary">Read more <ArrowRight size={13} className="transition group-hover:translate-x-1" /></p>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}

export function Privacy() {
  return (
    <PageShell title="Privacy Policy" sub="How TensoraMax collects, uses and protects your data. Last updated July 2025.">
      <div className="space-y-4">
        {[
          ['Data we collect', 'Account details (name, email), workspace content you create (projects, models metadata, accounting records), and usage telemetry (API requests, feature usage) needed to operate the platform.'],
          ['How we use it', 'To provide and improve Studio, meter usage against your plan, send service notifications, and secure your account. We never sell personal data and never train models on your private workspace content.'],
          ['Storage & security', 'Data is stored encrypted at rest and in transit. Access is role-scoped, audited, and limited to what each Studio module requires.'],
          ['Your rights', 'Export or delete your data at any time from account settings, or contact privacy@tensoramax.com for assistance. Deletion requests are honored within 30 days.'],
        ].map(([h, b], i) => (
          <Card key={h} className="p-6">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[11px] font-bold text-white">{i + 1}</span> {h}
            </h2>
            <p className="mt-2 pl-8 text-sm leading-relaxed text-ink-soft">{b}</p>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}

export function Terms() {
  return (
    <PageShell title="Terms of Service" sub="The agreement between you and TensoraMax when using Studio. Last updated July 2025.">
      <div className="space-y-4">
        {[
          ['Your account', 'You are responsible for activity under your account and for keeping credentials secure. Accounts must be registered with accurate information.'],
          ['Acceptable use', 'Do not use Studio to violate laws, infringe intellectual property, or attempt to disrupt the platform. Model outputs must be reviewed before use in high-stakes settings.'],
          ['Your content', 'You retain ownership of everything you create in Studio — projects, models, datasets and accounting records. You grant us only the rights needed to host and serve it back to you.'],
          ['Billing', 'Paid plans renew monthly or annually. Usage beyond plan limits is billed at published overage rates. You can cancel any time; access continues to the end of the billing period.'],
          ['Availability', 'We target a 99.9% uptime SLA on paid plans. Scheduled maintenance is announced in advance on the status page.'],
        ].map(([h, b], i) => (
          <Card key={h} className="p-6">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[11px] font-bold text-white">{i + 1}</span> {h}
            </h2>
            <p className="mt-2 pl-8 text-sm leading-relaxed text-ink-soft">{b}</p>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}

export function Contact() {
  return (
    <PageShell title="Contact" sub="Questions about Studio, enterprise plans or partnerships? We'd love to hear from you.">
      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="p-6">
          <Mail size={18} className="text-primary" />
          <h2 className="mt-3 font-display text-base font-semibold text-ink">Email us</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-ink-soft">
            <li>General — <span className="font-semibold text-ink">hello@tensoramax.com</span></li>
            <li>Sales — <span className="font-semibold text-ink">sales@tensoramax.com</span></li>
            <li>Support — <span className="font-semibold text-ink">support@tensoramax.com</span></li>
            <li>Privacy — <span className="font-semibold text-ink">privacy@tensoramax.com</span></li>
          </ul>
        </Card>
        <Card className="p-6">
          <MapPin size={18} className="text-primary" />
          <h2 className="mt-3 font-display text-base font-semibold text-ink">Offices</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-ink-soft">
            <li><span className="font-semibold text-ink">Bengaluru (HQ)</span> — Indiqube Orion, Koramangala</li>
            <li><span className="font-semibold text-ink">Mumbai</span> — WeWork Enam Sambhav, BKC</li>
          </ul>
          <p className="mt-4 text-xs text-muted">Prefer async? Start a thread in the <Link to="/community" className="font-semibold text-primary hover:underline">Community</Link> — the team reads everything.</p>
        </Card>
      </div>
    </PageShell>
  );
}
