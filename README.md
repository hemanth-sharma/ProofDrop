# ProofDrop

Proof of delivery in seconds. Drivers snap a photo and get a signature via SMS link; customers get proof instantly—no app download.

## Stack

- **Frontend & API**: Next.js 14 (App Router)
- **Auth, DB, Storage**: Supabase (Google + email/password, PostgreSQL, Storage)
- **SMS**: Twilio
- **UI**: Tailwind CSS, Shadcn-style components, react-signature-canvas

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the migration: `supabase/migrations/001_initial_schema.sql`.
3. In **Authentication → Providers**, enable Email and Google.
4. In **Storage**, create a bucket named `delivery-photos` and set it to **Public**.
5. In **Project Settings → API**: copy **Project URL**, **anon public** key, and **service_role** key.

### 2. Twilio

1. Sign up at [twilio.com](https://twilio.com) and get Account SID, Auth Token, and a phone number.
2. Add the env vars (see below).

### 3. Environment

Copy `.env.example` to `.env.local` and set:

```bash
# Supabase (Project URL + anon key + service_role key)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App URL (used in SMS links; use your production URL when deployed)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

### 4. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, create a delivery, and use the driver link (or send the SMS) to test the flow.

## Flows

1. **Business owner**: Sign up (Google or email) → Dashboard → “Send delivery link” → Enter customer name, phone, optional email/notes → Driver receives SMS with link.
2. **Driver**: Opens SMS link → Sees customer name and notes → Takes photo (optional) → Signs → “Confirm delivery”.
3. **Customer**: Receives SMS with proof link → Opens page to see photo, signature, and timestamp.

## Project layout

- `app/` – Next.js App Router (auth, dashboard, driver capture, proof view, API routes)
- `components/` – UI and SignaturePad
- `lib/` – Supabase clients, SMS, utils
- `supabase/migrations/` – SQL schema and RLS

## Deploy

- **Frontend**: Vercel (connect repo, set env vars, deploy).
- **Backend**: Same Next.js app on Vercel (API routes run there).
- Set `NEXT_PUBLIC_APP_URL` to your Vercel URL so SMS links point to production.


## Pending Tasks and functionalities
- **Twilio**: Add twilio for calls and messages.
- **AWS File Storage**: Use AWS for storing proof documents.
- **Payment Integration**: Integrate Stripe payment methods.
- **Improve UI**: Fix mobile view, add tables and data analytics.
- **Authentication**: Account Login/Logout is already added just activate it when in prod.
- **SEO, Security & Marketing**: Test SEO and security. Use GOogle Ads.
- **Distribution**: Find first customer.
