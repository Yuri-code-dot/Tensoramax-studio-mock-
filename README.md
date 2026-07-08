<div align="center">

# Σ TensoraMax Studio

**Build. Train. Deploy.**

A unified AI platform for building, training, deploying and managing AI applications,
models, datasets and developer workflows — from one workspace.

</div>

---

## ✨ Overview

TensoraMax Studio brings the entire AI product lifecycle — and the business behind it — into a single, warm, professional interface:

| Module | What it does |
|---|---|
| **Dashboard** | Platform metrics (API requests, GPU hours, storage), animated inference charts, activity feed |
| **Workspace** | Cross-module project boards with status workflow and deep-links |
| **AI Studio** | Browser playground for the TXB model family with temperature & token controls |
| **Model Hub** | Publish and version TXB-1, TXB Chat, TXB Vision, TXB Code, TXB Small, TXB Reasoning |
| **Dataset Hub** | Host and license datasets from megabytes to terabytes |
| **Deploy** | Managed serverless, GPU, container and static-site endpoints across 4 regions |
| **Marketplace** | Modules, dashboard templates, AI agents and developer plugins |
| **Tensora Accounting** | Full double-entry books — companies, ledgers, vouchers, GST, inventory, payroll, reports |
| **Community & Docs** | Discussions, templates, and complete platform documentation |

## 🛠 Tech Stack

- **React 19** + **TypeScript** + **Vite 7**
- **Tailwind CSS v4** with custom design tokens (light + dark themes)
- **Framer Motion** for page transitions and micro-interactions
- **React Router 7** with lazy-loaded routes
- **Supabase** — Postgres, Auth (Google / GitHub / email) and REST via Vercel serverless functions
- **Lucide** icons

## 🚀 Getting Started

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check + production build
npm run preview   # preview the production build
```

## 🔐 Environment

Create a `.env` from `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=       # Supabase project URL (serverless functions)
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # public anon key
SUPABASE_SERVICE_ROLE_KEY=      # service role key (server-side only)
VITE_SUPABASE_URL=              # same URL, exposed to the frontend
VITE_SUPABASE_ANON_KEY=         # same anon key, exposed to the frontend
```

## 🗄 Database

Supabase tables used by the platform:

- **Studio:** `studio_projects`, `studio_models`, `studio_datasets`, `studio_deployments`, `studio_activity`, `studio_notifications`, `studio_metrics`
- **Accounting:** `companies`, `ledgers`, `vouchers`, `invoices`, `parties`, `gst_records`, `stock_items`, `bank_accounts`, `bank_transactions`, `employees`, `payroll_runs`, `app_users`

## 📡 API

Every file in `api/` deploys as a Vercel serverless function:

- `GET/POST/PUT/DELETE /api/studio?resource=projects|models|datasets|deployments|activity|notifications|metrics`
- `GET/POST/PUT/DELETE /api/companies · /api/ledgers · /api/vouchers · /api/invoices · /api/parties · /api/gst-records · /api/inventory · /api/banking · /api/payroll · /api/users`
- Accounting routes accept `?company_id=` for company scoping.

## 📦 Deployment

The project is Vercel-ready — `vercel.json` routes the SPA and serverless functions.

```bash
npm run build
vercel deploy --prod
```

## 📁 Structure

```
tensoramax-studio/
├── api/                  # Vercel serverless functions (Supabase REST)
├── public/               # favicon, OG image, downloadable source
└── src/
    ├── components/       # StudioShell, AccountingLayout, ui kit, skeletons
    ├── contexts/         # Auth, Theme, Company providers
    ├── lib/              # api client, supabase client, types, formatters
    └── pages/
        ├── studio/       # Landing, Dashboard, AI Studio, hubs, docs, auth…
        └── …             # Accounting module pages
```

---

<div align="center">© TensoraMax Studio · Made with Σ</div>
