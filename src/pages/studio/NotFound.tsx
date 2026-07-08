import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sigma, Home, LayoutDashboard, BookOpen, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-cream px-4 text-center">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(217,119,42,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative">
        <motion.div
          animate={{ rotate: [0, -6, 6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary text-cream shadow-lg shadow-primary/25"
        >
          <Sigma size={30} strokeWidth={2.2} />
        </motion.div>
        <p className="mt-8 font-display text-7xl font-semibold text-ink sm:text-8xl">404</p>
        <h1 className="mt-3 font-display text-2xl font-semibold text-ink">This page doesn't exist</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          The page you're looking for may have been moved, renamed, or never deployed. Let's get you back to the Studio.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark">
            <Home size={15} /> Go Home
          </Link>
          <Link to="/dashboard" className="flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-primary/40">
            <LayoutDashboard size={15} className="text-primary" /> Dashboard
          </Link>
          <Link to="/docs" className="flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-primary/40">
            <BookOpen size={15} className="text-primary" /> Docs
          </Link>
        </div>
        <p className="mt-10 flex items-center justify-center gap-1.5 text-xs text-muted">
          <Compass size={12} /> © {new Date().getFullYear()} TensoraMax Studio · Build. Train. Deploy.
        </p>
      </motion.div>
    </div>
  );
}
