# Esprimere

A multi-tenant dance studio booking platform. Studios can manage classes, instructors, rooms, and availability. Students can browse classes, purchase passes, and book studio spaces — all with Stripe payments.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (Neon serverless) |
| ORM | Prisma v7 |
| Auth | NextAuth v5 (Auth.js) |
| Payments | Stripe Checkout |

---

## Project Structure

```
app/
  (studio)/dashboard/     # Studio owner dashboard (protected)
  [studioSlug]/
    login/                # Student login page
    classes/              # Browse & book classes
    spaces/               # Browse & book studio spaces
    profile/              # Student profile, passes, bookings
  api/
    auth/                 # NextAuth route handler
    stripe/webhook/       # Stripe webhook handler
  bookings/success/       # Post-payment confirmation (studio rental)
  passes/success/         # Post-payment confirmation (pass purchase)

actions/                  # Server actions
  auth/                   # logout
  bookings/               # bookClass, bookStudio
  passes/                 # purchasePass
  studio/                 # CRUD for classes, rooms, instructors, availability

components/               # Shared UI components
lib/                      # prisma, auth, stripe clients + utility functions
prisma/
  schema.prisma
  seed.ts
```

---

## User Roles

**Studio Owner**
- Logs in at `/studio/login`
- Manages rooms, instructors, class schedule, pass packages, availability
- Views dashboard: today's classes, bookings, rentals, revenue
- Can replace instructors or cancel classes for a specific date

**Student**
- Logs in at `/{studioSlug}/login`
- Browses classes (filtered by genre, day, time, level)
- Purchases passes via Stripe
- Books classes using their pass
- Books studio spaces via Stripe
- Views their passes and bookings in their profile

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://...          # Neon pooler URL
DIRECT_URL=postgresql://...            # Neon direct URL (for migrations)

AUTH_SECRET=...                        # Random secret for NextAuth

STRIPE_SECRET_KEY=sk_test_...          # Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_...        # From Stripe CLI (local) or Dashboard (production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up the database

```bash
./node_modules/.bin/prisma db push
./node_modules/.bin/tsx prisma/seed.ts
```

### 4. Run the development server

```bash
npm run dev
```

### 5. Run the Stripe webhook listener (local testing)

In a separate terminal:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the `whsec_...` secret printed and set it as `STRIPE_WEBHOOK_SECRET` in `.env`, then restart the dev server.

---

## Stripe Test Card

| Field | Value |
|---|---|
| Card number | `4242 4242 4242 4242` |
| Expiry | Any future date |
| CVC | Any 3 digits |

---

## Payment Flow

```
User clicks Pay
  → Server action creates Stripe Checkout Session
  → Browser redirects to Stripe's hosted checkout page
  → User completes payment on Stripe
  → Stripe redirects browser to success page
  → Stripe sends webhook POST to /api/stripe/webhook
  → Webhook confirms booking / creates UserPass in DB
```

The webhook is the source of truth — not the success page redirect.

---

## Seed Accounts

After running the seed, the following accounts are available:

| Role | Email | Password |
|---|---|---|
| Studio Owner | owner@esprimere.com | password123 |
| Student | jamie@example.com | password123 |

Studio slug: `esprimere-dance`
