# Kateshwar Super Market

Mobile-first local grocery ordering and shop management application.

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase PostgreSQL, Auth and Storage
- Zod validation
- Lucide icons
- Vercel deployment

## Getting started
1. Install Node.js LTS.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in your Supabase project values.
4. Start the app: `npm run dev`
5. Open http://localhost:3000

## Environment
Never commit `.env.local`. Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code.

## Project layout
- `src/app/(customer)` - public customer experience
- `src/app/admin` - owner/admin experience
- `src/app/api` - server route handlers
- `src/components` - reusable UI
- `src/lib` - Supabase clients, services, validation and utilities
- `supabase/migrations` - versioned SQL migrations

## Important implementation notes
- Admin API handlers must verify the authenticated admin on every request.
- Enable and test RLS for all exposed tables.
- Calculate order totals on the server/database, not from client-submitted totals.
- Create order, order items and initial status history atomically.
- Use secure, expiring order-access tokens for customer order lookup.
- WhatsApp click-to-chat opens a prefilled draft; a person must tap Send.
