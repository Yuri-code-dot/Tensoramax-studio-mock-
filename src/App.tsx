import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import StudioShell from './components/StudioShell';
import PageTransition from './components/PageTransition';
import { PageSkeleton } from './components/Skeletons';
import { Loader2 } from 'lucide-react';

// Eager: the two entry surfaces
import Landing from './pages/studio/Landing';
import Auth from './pages/studio/Auth';

// Lazy: everything behind navigation
const StudioDashboard = lazy(() => import('./pages/studio/StudioDashboard'));
const Workspace = lazy(() => import('./pages/studio/Workspace'));
const AIStudio = lazy(() => import('./pages/studio/AIStudio'));
const Models = lazy(() => import('./pages/studio/Models'));
const Datasets = lazy(() => import('./pages/studio/Datasets'));
const Deploy = lazy(() => import('./pages/studio/Deploy'));
const Marketplace = lazy(() => import('./pages/studio/Marketplace'));
const Community = lazy(() => import('./pages/studio/Community'));
const Docs = lazy(() => import('./pages/studio/Docs'));
const Profile = lazy(() => import('./pages/studio/Profile'));
const NotFound = lazy(() => import('./pages/studio/NotFound'));
const AccountingLayout = lazy(() => import('./components/AccountingLayout'));

// Accounting module pages (business logic untouched)
const AccountingOverview = lazy(() => import('./pages/Dashboard'));
const Companies = lazy(() => import('./pages/Companies'));
const Ledgers = lazy(() => import('./pages/Ledgers'));
const Vouchers = lazy(() => import('./pages/Vouchers'));
const Invoices = lazy(() => import('./pages/Invoices'));
const Parties = lazy(() => import('./pages/Parties'));
const Inventory = lazy(() => import('./pages/Inventory'));
const GST = lazy(() => import('./pages/GST'));
const Reports = lazy(() => import('./pages/Reports'));
const Banking = lazy(() => import('./pages/Banking'));
const Payroll = lazy(() => import('./pages/Payroll'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const UsersPage = lazy(() => import('./pages/Users'));

// Company pages
const CompanyPages = {
  About: lazy(() => import('./pages/studio/CompanyPages').then((m) => ({ default: m.About }))),
  Blog: lazy(() => import('./pages/studio/CompanyPages').then((m) => ({ default: m.Blog }))),
  Privacy: lazy(() => import('./pages/studio/CompanyPages').then((m) => ({ default: m.Privacy }))),
  Terms: lazy(() => import('./pages/studio/CompanyPages').then((m) => ({ default: m.Terms }))),
  Contact: lazy(() => import('./pages/studio/CompanyPages').then((m) => ({ default: m.Contact }))),
};

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center gap-2 bg-cream text-muted" role="status">
      <Loader2 size={18} className="animate-spin text-primary" />
      <span className="text-sm">Loading TensoraMax Studio…</span>
    </div>
  );
}

function Studio({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <StudioShell title={title}>
      <Suspense fallback={<PageSkeleton />}>
        <PageTransition>{children}</PageTransition>
      </Suspense>
    </StudioShell>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname.split('/')[1] || 'home'}>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Landing />} />
        <Route path="/login" element={<Auth mode="signin" />} />
        <Route path="/signup" element={<Auth mode="signup" />} />
        <Route path="/forgot-password" element={<Auth mode="forgot" />} />
        <Route path="/about" element={<CompanyPages.About />} />
        <Route path="/blog" element={<CompanyPages.Blog />} />
        <Route path="/privacy" element={<CompanyPages.Privacy />} />
        <Route path="/terms" element={<CompanyPages.Terms />} />
        <Route path="/contact" element={<CompanyPages.Contact />} />

        {/* Studio */}
        <Route path="/dashboard" element={<ProtectedRoute><Studio title="Dashboard"><StudioDashboard /></Studio></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Studio title="Profile"><Profile /></Studio></ProtectedRoute>} />
        <Route path="/workspace" element={<Studio title="Workspace"><Workspace /></Studio>} />
        <Route path="/ai-studio" element={<Studio title="AI Studio"><AIStudio /></Studio>} />
        <Route path="/models" element={<Studio title="Model Hub"><Models /></Studio>} />
        <Route path="/datasets" element={<Studio title="Dataset Hub"><Datasets /></Studio>} />
        <Route path="/deploy" element={<Studio title="Deploy"><Deploy /></Studio>} />
        <Route path="/marketplace" element={<Studio title="Marketplace"><Marketplace /></Studio>} />
        <Route path="/community" element={<Studio title="Community"><Community /></Studio>} />
        <Route path="/docs" element={<Studio title="Documentation"><Docs /></Studio>} />

        {/* Accounting module */}
        <Route path="/accounting" element={<AccountingLayout />}>
          <Route index element={<AccountingOverview />} />
          <Route path="companies" element={<Companies />} />
          <Route path="ledgers" element={<Ledgers />} />
          <Route path="vouchers" element={<Vouchers />} />
          <Route path="sales" element={<Invoices kind="Sales" />} />
          <Route path="purchases" element={<Invoices kind="Purchase" />} />
          <Route path="customers" element={<Parties kind="Customer" />} />
          <Route path="suppliers" element={<Parties kind="Supplier" />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="gst" element={<GST />} />
          <Route path="reports" element={<Reports />} />
          <Route path="banking" element={<Banking />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>

        {/* Legacy accounting URLs → module paths */}
        {['companies', 'ledgers', 'vouchers', 'sales', 'purchases', 'customers', 'suppliers', 'inventory', 'gst', 'reports', 'banking', 'payroll', 'settings', 'users'].map((p) => (
          <Route key={p} path={`/${p}`} element={<Navigate to={`/accounting/${p}`} replace />} />
        ))}

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<FullPageLoader />}>
              <AnimatedRoutes />
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
