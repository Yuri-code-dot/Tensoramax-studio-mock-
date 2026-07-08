import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, skipMode } = useAuth();
  const location = useLocation();

  if (skipMode) return <>{children}</>;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 bg-cream text-muted">
        <Loader2 size={18} className="animate-spin text-primary" />
        <span className="text-sm">Loading TensoraMax Studio…</span>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
