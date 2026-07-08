import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sigma, Loader2, Github, ArrowLeft, Zap } from 'lucide-react';
import supabase from '../../lib/supabase';
import { signInWithGoogle } from '../../lib/googleAuth';
import { useAuth } from '../../contexts/AuthContext';
import { Field, inputCls } from '../../components/ui';

type Mode = 'signin' | 'signup' | 'forgot';

const titles: Record<Mode, { h: string; sub: string }> = {
  signin: { h: 'Sign In to TensoraMax Studio', sub: 'Build. Train. Deploy. — pick up where you left off' },
  signup: { h: 'Create your account', sub: 'One workspace for models, datasets, deployments and your books' },
  forgot: { h: 'Reset your password', sub: 'We will email you a secure reset link' },
};

export default function Auth({ mode: initialMode }: { mode: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setSkipMode } = useAuth();
  const from = (location.state as { from?: string })?.from || '/dashboard';

  const skipToDemo = () => {
    setSkipMode(true);
    navigate('/dashboard');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Enter a valid email address'); return; }
    if (mode !== 'forgot' && password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setBusy(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate(from, { replace: true });
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) navigate(from, { replace: true });
        else setInfo('Account created. Check your inbox to confirm your email, then sign in.');
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/login' });
        if (error) throw error;
        setInfo('Password reset email sent. Check your inbox.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const github = async () => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin + '/dashboard' },
    });
    if (error) setError('GitHub sign-in is not enabled for this workspace yet. Use email or Google.');
  };

  const t = titles[mode];

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Link to="/" className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-cream shadow-lg shadow-primary/25" aria-label="TensoraMax Studio home">
            <Sigma size={24} strokeWidth={2.2} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">{t.h}</h1>
            <p className="mt-1 text-sm text-muted">{t.sub}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 shadow-[0_8px_30px_rgba(38,34,25,0.06)] sm:p-8">
          {mode !== 'forgot' && (
            <>
              <div className="grid gap-3">
                <button
                  onClick={() => signInWithGoogle('TensoraMax Studio')}
                  className="flex items-center justify-center gap-2.5 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm font-semibold text-ink transition hover:border-primary/40"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
                  Continue with Google
                </button>
                <button
                  onClick={github}
                  className="flex items-center justify-center gap-2.5 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm font-semibold text-ink transition hover:border-primary/40"
                >
                  <Github size={16} /> Continue with GitHub
                </button>
                <button
                  onClick={skipToDemo}
                  className="flex items-center justify-center gap-2.5 rounded-lg border border-primary bg-primary-soft px-3 py-2.5 text-sm font-semibold text-primary-dark transition hover:bg-primary hover:text-white"
                >
                  <Zap size={16} /> Skip to Demo
                </button>
              </div>
              <div className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wide text-muted">
                <span className="h-px flex-1 bg-line" /> or continue with email <span className="h-px flex-1 bg-line" />
              </div>
            </>
          )}

          <form onSubmit={submit} className="space-y-4" noValidate>
            <Field label="Email">
              <input type="email" autoComplete="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
            </Field>
            {mode !== 'forgot' && (
              <Field label="Password">
                <input type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </Field>
            )}
            {mode === 'signin' && (
              <div className="text-right">
                <button type="button" onClick={() => { setMode('forgot'); setError(''); setInfo(''); }} className="text-xs font-semibold text-primary hover:underline">Forgot password?</button>
              </div>
            )}
            {error && <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger">{error}</p>}
            {info && <p role="status" className="rounded-lg bg-success/10 px-3 py-2 text-xs font-medium text-success">{info}</p>}
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-50"
            >
              {busy && <Loader2 size={15} className="animate-spin" />}
              {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center text-[13px] text-muted">
            {mode === 'signin' && (
              <>New to TensoraMax? <button onClick={() => { setMode('signup'); setError(''); setInfo(''); }} className="font-semibold text-primary hover:underline">Create an account</button></>
            )}
            {mode === 'signup' && (
              <>Already registered? <button onClick={() => { setMode('signin'); setError(''); setInfo(''); }} className="font-semibold text-primary hover:underline">Sign in</button></>
            )}
            {mode === 'forgot' && (
              <button onClick={() => { setMode('signin'); setError(''); setInfo(''); }} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"><ArrowLeft size={13} /> Back to sign in</button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          By continuing you agree to the TensoraMax <Link to="/terms" className="font-semibold text-primary hover:underline">Terms</Link> and <Link to="/privacy" className="font-semibold text-primary hover:underline">Privacy Policy</Link>.
        </p>
      </motion.div>
    </div>
  );
}
