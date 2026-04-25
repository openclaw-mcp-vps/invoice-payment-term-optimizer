# Build Task: invoice-payment-term-optimizer

Build a complete, production-ready Next.js 15 App Router application.

PROJECT: invoice-payment-term-optimizer
HEADLINE: Optimize payment terms based on client behavior
WHAT: Analyzes client payment history to suggest optimal payment terms and discount strategies that maximize cash flow
WHY: Businesses offer standard payment terms to all clients, missing opportunities to improve cash flow with data-driven terms
WHO PAYS: Freelancers, agencies, B2B service providers
NICHE: invoice-billing
PRICE: $$12/mo

ARCHITECTURE SPEC:
A Next.js SaaS app that analyzes client payment patterns from uploaded invoice data to recommend optimal payment terms and early payment discounts. Uses a simple dashboard to display payment analytics and generates actionable recommendations for improving cash flow.

PLANNED FILES:
- app/page.tsx
- app/dashboard/page.tsx
- app/dashboard/upload/page.tsx
- app/dashboard/analytics/page.tsx
- app/dashboard/recommendations/page.tsx
- app/api/invoices/route.ts
- app/api/analyze/route.ts
- app/api/webhooks/lemonsqueezy/route.ts
- lib/invoice-analyzer.ts
- lib/payment-optimizer.ts
- lib/lemonsqueezy.ts
- components/upload-zone.tsx
- components/analytics-dashboard.tsx
- components/recommendations-card.tsx
- components/pricing-section.tsx

DEPENDENCIES: next, react, typescript, tailwindcss, @tailwindcss/forms, lucide-react, recharts, csv-parser, papaparse, @types/papaparse, date-fns, clsx, tailwind-merge, @lemonsqueezy/lemonsqueezy.js, prisma, @prisma/client, next-auth, @auth/prisma-adapter

REQUIREMENTS:
- Next.js 15 with App Router (app/ directory)
- TypeScript
- Tailwind CSS v4
- shadcn/ui components (npx shadcn@latest init, then add needed components)
- Dark theme ONLY — background #0d1117, no light mode
- Stripe Payment Link for payments (hosted checkout — use the URL directly as the Buy button href)
- Landing page that converts: hero, problem, solution, pricing, FAQ
- The actual tool/feature behind a paywall (cookie-based access after purchase)
- Mobile responsive
- SEO meta tags, Open Graph tags
- /api/health endpoint that returns {"status":"ok"}
- NO HEAVY ORMs: Do NOT use Prisma, Drizzle, TypeORM, Sequelize, or Mongoose. If the tool needs persistence, use direct SQL via `pg` (Postgres) or `better-sqlite3` (local), or just filesystem JSON. Reason: these ORMs require schema files and codegen steps that fail on Vercel when misconfigured.
- INTERNAL FILE DISCIPLINE: Every internal import (paths starting with `@/`, `./`, or `../`) MUST refer to a file you actually create in this build. If you write `import { Card } from "@/components/ui/card"`, then `components/ui/card.tsx` MUST exist with a real `export const Card` (or `export default Card`). Before finishing, scan all internal imports and verify every target file exists. Do NOT use shadcn/ui patterns unless you create every component from scratch — easier path: write all UI inline in the page that uses it.
- DEPENDENCY DISCIPLINE: Every package imported in any .ts, .tsx, .js, or .jsx file MUST be
  listed in package.json dependencies (or devDependencies for build-only). Before finishing,
  scan all source files for `import` statements and verify every external package (anything
  not starting with `.` or `@/`) appears in package.json. Common shadcn/ui peers that MUST
  be added if used:
  - lucide-react, clsx, tailwind-merge, class-variance-authority
  - react-hook-form, zod, @hookform/resolvers
  - @radix-ui/* (for any shadcn component)
- After running `npm run build`, if you see "Module not found: Can't resolve 'X'", add 'X'
  to package.json dependencies and re-run npm install + npm run build until it passes.

ENVIRONMENT VARIABLES (create .env.example):
- NEXT_PUBLIC_STRIPE_PAYMENT_LINK  (full URL, e.g. https://buy.stripe.com/test_XXX)
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  (pk_test_... or pk_live_...)
- STRIPE_WEBHOOK_SECRET  (set when webhook is wired)

BUY BUTTON RULE: the Buy button's href MUST be `process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK`
used as-is — do NOT construct URLs from a product ID, do NOT prepend any base URL,
do NOT wrap it in an embed iframe. The link opens Stripe's hosted checkout directly.

After creating all files:
1. Run: npm install
2. Run: npm run build
3. Fix any build errors
4. Verify the build succeeds with exit code 0

Do NOT use placeholder text. Write real, helpful content for the landing page
and the tool itself. The tool should actually work and provide value.
