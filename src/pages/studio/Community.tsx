import { useState } from 'react';
import { MessageSquare, ThumbsUp, UsersRound, Flame, Send } from 'lucide-react';
import { Card, CardHeader, Badge, Field, inputCls, PrimaryButton } from '../../components/ui';

interface Thread { id: number; title: string; author: string; category: string; replies: number; likes: number; hot?: boolean }

const initialThreads: Thread[] = [
  { id: 1, title: 'Fine-tuning TXB Small on ai-conversations — config that worked for us', author: 'Shruti Deshmukh', category: 'Models', replies: 31, likes: 84, hot: true },
  { id: 2, title: 'Show & tell: invoice intelligence with TXB Reasoning + Accounting API', author: 'Divya Raghavan', category: 'Accounting', replies: 22, likes: 57, hot: true },
  { id: 3, title: 'Best region strategy for model-api latency — Mumbai vs Singapore?', author: 'Rohan Iyer', category: 'Deploy', replies: 14, likes: 39 },
  { id: 4, title: 'Feature request: streaming responses in the AI Studio playground', author: 'Karan Malhotra', category: 'Feedback', replies: 11, likes: 46 },
  { id: 5, title: 'Sharing my txb CLI GitHub Actions workflow for zero-downtime deploys', author: 'Sameer Kulkarni', category: 'Templates', replies: 8, likes: 28 },
  { id: 6, title: 'How we structure ledger groups for a SaaS company in Tensora Accounting', author: 'Tanvi Joshi', category: 'Accounting', replies: 6, likes: 19 },
];

const CATS = ['All', 'Models', 'Accounting', 'Deploy', 'Templates', 'Feedback'];

export default function Community() {
  const [threads, setThreads] = useState(initialThreads);
  const [cat, setCat] = useState('All');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Models');
  const [err, setErr] = useState('');
  const [liked, setLiked] = useState<number[]>([]);

  const filtered = cat === 'All' ? threads : threads.filter((t) => t.category === cat);

  const post = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 8) { setErr('Give your discussion a longer title (8+ characters)'); return; }
    setThreads((prev) => [{ id: Date.now(), title: title.trim(), author: 'You', category, replies: 0, likes: 0 }, ...prev]);
    setTitle('');
    setErr('');
  };

  const like = (id: number) => {
    if (liked.includes(id)) return;
    setLiked((prev) => [...prev, id]);
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, likes: t.likes + 1 } : t)));
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Members</p><p className="mt-1.5 font-display text-xl font-semibold text-ink">12,480</p></Card>
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Discussions</p><p className="mt-1.5 font-display text-xl font-semibold text-ink">{threads.length}</p></Card>
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Templates Shared</p><p className="mt-1.5 font-display text-xl font-semibold text-ink">184</p></Card>
        <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Online Now</p><p className="mt-1.5 font-display text-xl font-semibold text-success">312</p></Card>
      </div>

      <Card>
        <CardHeader title="Start a Discussion" subtitle="Ask the TensoraMax community anything" />
        <form onSubmit={post} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label="Title" error={err}>
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. What batch size works best for fine-tuning TXB Small?" />
            </Field>
          </div>
          <div className="w-full sm:w-44">
            <Field label="Category">
              <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATS.slice(1).map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <PrimaryButton type="submit" className="justify-center"><Send size={14} /> Post</PrimaryButton>
        </form>
      </Card>

      <div className="flex flex-wrap gap-2">
        {CATS.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${cat === c ? 'border-primary bg-primary text-white' : 'border-line bg-surface text-ink-soft hover:border-primary/40'}`}>
            {c}
          </button>
        ))}
      </div>

      <Card>
        <div className="divide-y divide-line/60">
          {filtered.map((t) => (
            <div key={t.id} className="flex items-center gap-4 px-5 py-4 transition hover:bg-cream/60">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary-dark">
                {t.author.split(' ').map((w) => w[0]).slice(0, 2).join('')}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[14px] font-semibold text-ink">
                  <span className="truncate">{t.title}</span>
                  {t.hot && <Flame size={13} className="shrink-0 text-primary" />}
                </p>
                <p className="mt-0.5 text-xs text-muted">{t.author} · <Badge>{t.category}</Badge></p>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-xs font-semibold text-muted">
                <span className="flex items-center gap-1"><MessageSquare size={13} /> {t.replies}</span>
                <button onClick={() => like(t.id)} className={`flex items-center gap-1 transition ${liked.includes(t.id) ? 'text-primary' : 'hover:text-primary'}`}>
                  <ThumbsUp size={13} /> {t.likes}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-4 text-sm text-ink-soft">
        <UsersRound size={15} className="shrink-0 text-primary" />
        The community shapes the Studio roadmap — AI Studio's playground started as the most-upvoted feature request.
      </div>
    </div>
  );
}
