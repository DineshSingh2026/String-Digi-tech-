# STRING DIGI TECH — stringdigitech.com

Corporate website for STRING DIGI TECH PTE. LTD. Next.js 16 (App Router), TypeScript, Tailwind CSS v4, React Three Fiber.

## Local development

```bash
npm install
npm run dev        # http://localhost:3004
npm test           # simulator unit tests (Vitest)
npm run build      # production build
```

## Deploying on Vercel

Import the repo in Vercel; the framework preset (Next.js) is detected automatically, no build settings needed.

Environment variables (Project → Settings → Environment Variables), all optional for the site to build:

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Resend API key used by the contact form (`/api/contact`) |
| `CONTACT_TO_EMAIL` | Inbox that receives enquiries |
| `CONTACT_FROM_EMAIL` | Verified Resend sender (defaults to `onboarding@resend.dev`) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Email shown on the Contact page (hidden if empty) |
| `NEXT_PUBLIC_CONTACT_PHONE` | Phone shown on the Contact page (hidden if empty) |

Without `RESEND_API_KEY` and `CONTACT_TO_EMAIL` the contact form shows its error state.

## Content

All copy lives in `content/copy.ts`; legal pages are in `content/legal/*.mdx` (placeholders pending counsel). All charts and numbers use client-side simulated data from `lib/sim`.
