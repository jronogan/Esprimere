# Stripe Integration — Study Notes

## The Core Problem Stripe Solves

You need to take real money from users. Stripe handles the payment form, card processing, fraud detection, and receipts. You never touch raw card numbers — Stripe does, on their hosted page.

---

## The Full Flow (End to End)

```
User clicks "Pay"
  → Server action creates a Stripe Checkout Session
  → Server returns a Stripe-hosted URL
  → Browser redirects to stripe.com (user enters card there)
  → Stripe processes payment
  → Stripe redirects browser to your success_url
  → Stripe ALSO sends a webhook POST to your server
  → Your webhook confirms the booking/pass in your DB
```

Two things happen after payment:
1. **Browser redirect** → shows user a confirmation page (UX only)
2. **Webhook** → updates your database (the source of truth)

You need BOTH. The browser redirect can fail (user closes tab, network drops). The webhook fires server-to-server directly from Stripe — it's reliable.

---

## The Files in This Project

### 1. `lib/stripe.ts`
Initialises the Stripe client using your secret key.
```ts
import Stripe from "stripe";
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
```
Used everywhere you talk to Stripe.

---

### 2. Server Actions — Creating the Checkout Session

**`actions/passes/purchasePass.ts`**
**`actions/bookings/bookStudio.ts`**

Both follow the same pattern:

```
1. Authenticate the user
2. Validate the item (pass package / room exists)
3. Create a Stripe Checkout Session
4. Save a pending record in your DB
5. Return the Stripe URL to the client
```

Key parts of `stripe.checkout.sessions.create()`:

```ts
{
  mode: "payment",              // one-time payment (not subscription)
  line_items: [{                // what the user is buying
    quantity: 1,
    price_data: {
      currency: "sgd",
      unit_amount: 5000,        // in cents — $50.00 = 5000
      product_data: { name: "10-class pass" },
    },
  }],
  metadata: { studioId, ... },  // custom data — MUST include studioId for success page redirect
  success_url: "https://yourapp.com/passes/success?session_id={CHECKOUT_SESSION_ID}",
  cancel_url: "https://yourapp.com/passes",
}
```

`{CHECKOUT_SESSION_ID}` is a Stripe placeholder — Stripe replaces it with the real session ID automatically.

**Why save a pending DB record before payment?**
So the webhook can look it up by `stripeSessionId` when payment completes. Without it, the webhook has no way to know what was being paid for.

**Important: always include `studioId` in metadata.**
Both actions must include `studioId` in the Stripe session metadata. The success pages retrieve this to build the redirect link back to the correct studio. If metadata is missing, the success page has no way to know which studio the user came from.

---

### 3. Client — Redirecting to Stripe

After calling the server action, you get back `{ url }`. You redirect the browser to it:

```ts
const { url } = await purchasePass({ passPackageId: pkg.id });
if (url) window.location.href = url;
```

`url` is `string | null` from the Stripe SDK (Stripe types it this way). The `if (url)` guard handles the null case.

**`window.location.href` vs `router.push()`**
- `router.push()` — navigates within your Next.js app
- `window.location.href` — full browser redirect, used here because you're leaving your app entirely to go to stripe.com

**Important: do not use `router.push()` after `window.location.href`.**
Once `window.location.href` is set, the browser navigates away — any code after it still runs but has no effect. Use `return` immediately after the redirect:

```ts
if (url) { window.location.href = url; return; }
```

---

### 4. `app/api/stripe/webhook/route.ts`

Stripe POSTs here after every payment event. This is your most critical file.

```
1. Read raw body as text (must be raw — not parsed)
2. Verify the signature using STRIPE_WEBHOOK_SECRET
3. Check event type is "checkout.session.completed"
4. Look up what was paid for (studio booking or pass)
5. Confirm it in the DB
```

**Why verify the signature?**
Anyone on the internet can POST to your webhook URL. The signature proves the request genuinely came from Stripe, not a malicious actor trying to fake a successful payment.

```ts
event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
```

If this throws, the signature is invalid → return 400.

**In Next.js App Router, `req.text()` already reads the raw body — no extra config needed.**
In the old Pages Router you had to disable body parsing with `export const config = { api: { bodyParser: false } }`. In App Router this is handled automatically.

**Two paths in the webhook:**

*Studio booking path:*
```
Find StudioBooking by stripeSessionId
→ Update status to CONFIRMED
→ Save stripePaymentId on the Payment record
```

*Pass purchase path:*
```
Find Payment by stripeSessionId
→ Find the PassPackage (to get credits/expiry)
→ Create UserPass with credits and expiry date
→ Link UserPass back to the Payment record
```

---

### 5. Success Pages

`app/bookings/success/page.tsx`
`app/passes/success/page.tsx`

Server components (no `"use client"`). Stripe redirects here after payment with `?session_id=xxx` in the URL.

```ts
const session = await stripe.checkout.sessions.retrieve(session_id);
// use session.amount_total, session.line_items, session.metadata etc.
```

These pages are **display only** — they do not update the DB. The webhook handles that.

**Important: success pages must be server components.**
They use `prisma` and `stripe` which are Node.js-only. Adding `"use client"` causes a build error:
```
Module not found: Can't resolve 'dns'
```
because Prisma's `pg` driver uses Node.js modules that don't exist in the browser.

**Getting the studioSlug for the redirect button:**
The success page has no access to `[studioSlug]` from the URL (it's a top-level route like `/passes/success`). To build the "Back to classes" link, retrieve `studioId` from `session.metadata`, then query the DB for the studio's slug:

```ts
const studioId = session.metadata?.studioId;
const studio = await prisma.studio.findUnique({ where: { id: studioId } });
const studioSlug = studio?.slug ?? null;
```

Then use a conditional link — avoid fallback links to `/` if your app has no root page:
```tsx
{studioSlug && <Link href={`/${studioSlug}/classes`}>Browse classes</Link>}
```

---

## Environment Variables Required

```env
STRIPE_SECRET_KEY=sk_test_...        # from Stripe dashboard → API keys
STRIPE_WEBHOOK_SECRET=whsec_...      # from Stripe CLI (local) or Stripe dashboard (production)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # your app's base URL
```

---

## Testing Locally

Stripe can't reach `localhost` to send webhooks. Use the **Stripe CLI**:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This prints a `whsec_...` secret — put it in `.env` as `STRIPE_WEBHOOK_SECRET`, then **restart the dev server** for it to take effect.

**Both terminals must be open simultaneously:**
- Terminal 1: `npm run dev`
- Terminal 2: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

To confirm the webhook is working, check the Next.js terminal for:
```
POST /api/stripe/webhook 200
```
If this line never appears after a payment, the webhook isn't reaching your server — check the port number matches.

**Test cards:**

| Card number | Behaviour |
|---|---|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | Requires 3D Secure authentication |

Use any future expiry date and any 3-digit CVC.

---

## Common Mistakes & Fixes

| Mistake | Fix |
|---|---|
| `"use client"` on success page | Remove it — success pages must be server components |
| `studioId` missing from Stripe metadata | Add `metadata: { studioId }` to `stripe.checkout.sessions.create()` in every action |
| Pass filter using wrong `studioId` | Profile page `passPackage` query must filter by `studioId: studio.id` |
| Webhook never fires locally | Run `stripe listen` in a separate terminal and check port matches |
| `window.location.href` TypeScript error | `url` is `string \| null` — guard with `if (url)` before assigning |
| `router.push()` after redirect | Use `return` immediately after `window.location.href = url` |
| Stripe CLI `whsec_` not picked up | Restart dev server after updating `.env` |

---

## Summary — Who Does What

| Responsibility | Where |
|---|---|
| Create Checkout Session | Server action (`purchasePass`, `bookStudio`) |
| Redirect browser to Stripe | Client component (`BuyPassCard`, `StudioRentalClient`) |
| Confirm payment in DB | Webhook (`app/api/stripe/webhook/route.ts`) |
| Show confirmation to user | Success pages (`/passes/success`, `/bookings/success`) |
