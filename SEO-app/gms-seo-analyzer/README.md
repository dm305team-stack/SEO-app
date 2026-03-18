# Growth Marketing Studios — SEO Analyzer

A production-ready, full-stack web application for comprehensive SEO analysis powered by **DataForSEO API** and **OpenAI GPT-4o**.

## Features

- 🔍 **12 DataForSEO Modules** — SERP, Keywords, Domain Analytics, Labs, Backlinks, On-Page, Content, Merchant, App Data, Business Data, Appendix, AI Optimization
- 🤖 **AI-Powered Reports** — GPT-4o generates actionable SEO recommendations
- 📄 **PDF Export** — Download Executive Summary or Full Technical Audit reports
- 📊 **Comparative Analysis** — Compare 2–5 domains side-by-side with radar charts
- ⚡ **Performance** — Parallel API calls, 24h caching, optimized loading states

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **PDF:** @react-pdf/renderer
- **APIs:** DataForSEO, OpenAI

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your API credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `DATAFORSEO_LOGIN` — DataForSEO API login
- `DATAFORSEO_PASSWORD` — DataForSEO API password
- `OPENAI_API_KEY` — OpenAI API key
- `NEXT_PUBLIC_APP_URL` — Your app URL (e.g., `http://localhost:3000`)

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

## Deployment (Hostinger VPS)

1. SSH into your VPS
2. Clone the repository
3. Run `npm install`
4. Create `.env.local` with your API keys
5. Run `npm run build`
6. Start with PM2:

```bash
npm install -g pm2
pm2 start pm2.config.js
pm2 save
pm2 startup
```

## Project Structure

```
app/
  layout.tsx          # Root layout
  page.tsx            # Home page
  analyze/page.tsx    # Single domain analysis
  compare/page.tsx    # Multi-domain comparison
  api/                # API routes for DataForSEO & AI
components/
  layout/             # Header, Footer, Sidebar
  sections/           # 12 DataForSEO section components
  ai/                 # AI report section
  compare/            # RadarChart, CompareTable
  pdf/                # Executive Summary & Full Audit PDFs
  forms/              # Domain input form
  ui/                 # Shared UI components
lib/                  # API clients, cache, utilities
types/                # TypeScript interfaces
```

## License

© Growth Marketing Studios. All rights reserved.
