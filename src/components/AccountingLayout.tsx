import { useState, Suspense } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, BookOpen, FileText, TrendingUp, ShoppingCart,
  Package, Landmark, BarChart3, Wallet, Users, Settings, ShieldCheck,
  UserRound, Truck, ChevronDown, Calculator, ArrowLeft, Building2 as B2, Download,
} from 'lucide-react';
import StudioShell from './StudioShell';
import PageTransition from './PageTransition';
import { PageSkeleton } from './Skeletons';
import { CompanyProvider, useCompany } from '../contexts/CompanyContext';

const subNav = [
  { to: '/accounting', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/accounting/companies', label: 'Companies', icon: Building2 },
  { to: '/accounting/ledgers', label: 'Ledgers', icon: BookOpen },
  { to: '/accounting/vouchers', label: 'Vouchers', icon: FileText },
  { to: '/accounting/sales', label: 'Sales', icon: TrendingUp },
  { to: '/accounting/purchases', label: 'Purchases', icon: ShoppingCart },
  { to: '/accounting/customers', label: 'Customers', icon: UserRound },
  { to: '/accounting/suppliers', label: 'Suppliers', icon: Truck },
  { to: '/accounting/inventory', label: 'Inventory', icon: Package },
  { to: '/accounting/gst', label: 'GST', icon: Landmark },
  { to: '/accounting/reports', label: 'Reports', icon: BarChart3 },
  { to: '/accounting/banking', label: 'Banking', icon: Wallet },
  { to: '/accounting/payroll', label: 'Payroll', icon: Users },
  { to: '/accounting/settings', label: 'Settings', icon: Settings },
  { to: '/accounting/users', label: 'Users', icon: ShieldCheck },
];

function CompanySwitcher() {
  const { company, companies, setActive } = useCompany();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-left hover:border-primary/50"
      >
        <B2 size={15} className="text-primary" />
        <span className="max-w-[160px] truncate text-[13px] font-medium text-ink sm:max-w-[220px]">
          {company?.name ?? 'No company'}
        </span>
        <ChevronDown size={14} className="text-muted" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
            {companies.length === 0 && (
              <p className="px-4 py-3 text-[13px] text-muted">No companies yet — create one from the Companies page.</p>
            )}
            {companies.map((c) => (
              <button
                key={c.id}
                onClick={() => { setActive(c.id); setOpen(false); }}
                className={`block w-full px-4 py-3 text-left text-[13px] hover:bg-cream ${c.id === company?.id ? 'bg-primary-soft font-semibold text-ink' : 'text-ink-soft'}`}
              >
                <span className="block truncate">{c.name}</span>
                <span className="text-[11px] text-muted">{c.gstin || 'No GSTIN'}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function AccountingChrome() {
  const location = useLocation();
  const current = subNav.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)));

  return (
    <StudioShell title="Accounting">
      <div className="space-y-5">
        {/* Module header */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white"><Calculator size={18} /></div>
            <div>
              <p className="font-display text-[15px] font-semibold leading-tight text-ink">TensoraMax Accounting</p>
              <p className="text-[11px] text-muted">Studio module · {current?.label ?? 'Overview'}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="/tensoramax-accounting-source.zip"
              download
              className="hidden items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-[12px] font-semibold text-ink-soft transition hover:border-primary/40 sm:flex"
            >
              <Download size={13} className="text-primary" /> Source
            </a>
            <CompanySwitcher />
          </div>
        </div>

        {/* Module sub-navigation */}
        <nav aria-label="Accounting navigation" className="scrollbar-thin -mx-1 overflow-x-auto">
          <div className="flex min-w-max gap-1 rounded-xl border border-line bg-surface p-1.5">
            {subNav.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[12.5px] font-semibold transition ${
                    isActive ? 'bg-primary text-white shadow-sm' : 'text-ink-soft hover:bg-primary-soft hover:text-ink'
                  }`
                }
              >
                <Icon size={14} />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>

        <Suspense fallback={<PageSkeleton />}>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </Suspense>

        <div className="flex items-center gap-2 border-t border-line pt-4 text-xs text-muted">
          <Link to="/dashboard" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
            <ArrowLeft size={12} /> Back to Studio Dashboard
          </Link>
          <span className="ml-auto">TensoraMax Accounting · a TensoraMax Studio module</span>
        </div>
      </div>
    </StudioShell>
  );
}

export default function AccountingLayout() {
  return (
    <CompanyProvider>
      <AccountingChrome />
    </CompanyProvider>
  );
}
