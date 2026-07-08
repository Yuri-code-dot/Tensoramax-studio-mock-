import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Boxes, SlidersHorizontal, Copy, Check, Loader2, RotateCcw } from 'lucide-react';
import { apiGet } from '../../lib/api';
import type { StudioModel } from '../../lib/studioTypes';
import { Card, CardHeader, Badge, inputCls, Field } from '../../components/ui';

interface Turn { role: 'user' | 'assistant'; text: string }

const cannedResponses: Record<string, string> = {
  default: "Here's a structured approach:\n\n1. Define the objective and success metrics.\n2. Pull the relevant dataset from the Dataset Hub (ai-conversations works well for dialogue tasks).\n3. Fine-tune TXB Small for fast iteration, then scale to TXB-1 for production quality.\n4. Deploy via the Deploy module to a GPU endpoint in your nearest region.\n\nWant me to draft the fine-tuning configuration?",
  code: "```python\nfrom tensoramax import Studio\n\nclient = Studio(api_key=\"txb_...\")\n\nresponse = client.chat.create(\n    model=\"txb-chat\",\n    messages=[{\"role\": \"user\", \"content\": \"Summarize this ledger\"}],\n    temperature=0.7,\n)\nprint(response.output_text)\n```\n\nInstall the SDK with `pip install tensoramax` — full reference is in Documentation → SDKs.",
  accounting: "The Accounting module exposes everything over REST. To pull outstanding receivables:\n\n`GET /api/invoices?company_id=4&inv_type=Sales`\n\nFilter client-side for status ≠ Paid. You can also wire TXB Reasoning to flag overdue patterns — several teams run it as a weekly digest into their workspace activity feed.",
};

function pickResponse(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('code') || p.includes('sdk') || p.includes('python') || p.includes('api')) return cannedResponses.code;
  if (p.includes('account') || p.includes('invoice') || p.includes('ledger') || p.includes('gst')) return cannedResponses.accounting;
  return cannedResponses.default;
}

export default function AIStudio() {
  const [models, setModels] = useState<StudioModel[]>([]);
  const [model, setModel] = useState('TXB Chat');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [prompt, setPrompt] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiGet<StudioModel[]>('/studio?resource=models').then(setModels).catch(() => {});
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, generating]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = prompt.trim();
    if (!text || generating) return;
    setTurns((t) => [...t, { role: 'user', text }]);
    setPrompt('');
    setGenerating(true);
    const reply = pickResponse(text);
    setTimeout(() => {
      setTurns((t) => [...t, { role: 'assistant', text: reply }]);
      setGenerating(false);
    }, 900);
  };

  const copy = async (idx: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(idx);
      setTimeout(() => setCopied(null), 1500);
    } catch { /* clipboard unavailable */ }
  };

  const published = models.filter((m) => m.status === 'Published');

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* Playground */}
      <Card className="flex min-h-[560px] flex-col">
        <CardHeader
          title="Playground"
          subtitle={`${model} · temperature ${temperature.toFixed(1)}`}
          action={
            turns.length > 0 ? (
              <button onClick={() => setTurns([])} className="flex items-center gap-1.5 text-xs font-semibold text-muted transition hover:text-danger">
                <RotateCcw size={12} /> Clear
              </button>
            ) : undefined
          }
        />
        <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-5">
          {turns.length === 0 && !generating && (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary"><Sparkles size={22} /></div>
              <p className="font-display text-lg font-semibold text-ink">Prompt the TXB model family</p>
              <p className="max-w-sm text-sm text-muted">Try asking about fine-tuning workflows, the Python SDK, or querying the Accounting module API.</p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {['Draft a fine-tuning plan', 'Show me SDK code', 'Query overdue invoices'].map((s) => (
                  <button key={s} onClick={() => setPrompt(s)} className="rounded-full border border-line bg-cream px-3.5 py-1.5 text-xs font-semibold text-ink-soft transition hover:border-primary/40 hover:text-ink">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {turns.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`group relative max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed ${t.role === 'user' ? 'bg-primary text-white' : 'border border-line bg-cream/60 text-ink'}`}>
                {t.text}
                {t.role === 'assistant' && (
                  <button onClick={() => copy(i, t.text)} className="absolute -right-2 -top-2 hidden rounded-lg border border-line bg-surface p-1.5 text-muted shadow-sm transition hover:text-ink group-hover:block" aria-label="Copy response">
                    {copied === i ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          {generating && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Loader2 size={14} className="animate-spin text-primary" /> {model} is generating…
            </div>
          )}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} className="flex gap-2 border-t border-line p-4">
          <input
            className={`${inputCls} flex-1`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Message ${model}…`}
            aria-label="Prompt"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || generating}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-50"
          >
            <Send size={14} /> Send
          </button>
        </form>
      </Card>

      {/* Config panel */}
      <div className="space-y-4">
        <Card>
          <CardHeader title="Model" subtitle="TXB family" />
          <div className="space-y-2 p-4">
            {(published.length ? published : [{ id: 0, name: 'TXB Chat', params: '34B', task: 'NLP' } as StudioModel]).map((m) => (
              <button
                key={m.id}
                onClick={() => setModel(m.name)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition ${model === m.name ? 'border-primary bg-primary-soft' : 'border-line bg-surface hover:border-primary/40'}`}
              >
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white"><Boxes size={14} /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-ink">{m.name}</p>
                  <p className="text-[11px] text-muted">{m.params} · {m.task}</p>
                </div>
                {model === m.name && <Check size={14} className="text-primary" />}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Parameters" subtitle="Generation settings" action={<SlidersHorizontal size={14} className="text-muted" />} />
          <div className="space-y-4 p-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">Temperature</span>
                <Badge>{temperature.toFixed(1)}</Badge>
              </div>
              <input
                type="range" min="0" max="2" step="0.1" value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-[#D9772A]"
                aria-label="Temperature"
              />
            </div>
            <Field label="Max Tokens">
              <select className={inputCls} value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value))}>
                {[256, 512, 1024, 2048, 4096].map((t) => <option key={t} value={t}>{t.toLocaleString()}</option>)}
              </select>
            </Field>
            <div className="rounded-xl bg-cream px-4 py-3 text-[12px] leading-relaxed text-muted">
              Requests run against <span className="font-semibold text-ink">model-api</span> (ap-south-1). Usage is metered as Inference Requests on your dashboard.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
