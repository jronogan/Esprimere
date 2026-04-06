# Stripe Integration — Study Notes

## The Core Problem Stripe Solves

You need to take real money from users. Stripe handles the payment form, card processing, fraud detection, and receipts. You never touch raw card numbers — Stripe does, on their hosted page.

---

## The Full Flow (End to End)

```
User clicks "Pay"
  → Your server creates a Stripe Checkout Session
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

## The 4 Files in This Project

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
  metadata: { ... },            // custom data you attach — retrieved in webhook
  success_url: "https://yourapp.com/passes/success?session_id={CHECKOUT_SESSION_ID}",
  cancel_url: "https://yourapp.com/passes",
}
```

`{CHECKOUT_SESSION_ID}` is a Stripe placeholder — Stripe replaces it with the real session ID automatically.

**Why save a pending DB record before payment?**
So the webhook can look it up by `stripeSessionId` when payment completes. Without it, the webhook has no way to know what was being paid for.

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

Simple server components. Stripe redirects here after payment with `?session_id=xxx` in the URL.

```ts
const session = await stripe.checkout.sessions.retrieve(session_id);
// use session.amount_total, session.line_items etc. to show details
```

These pages are **display only** — they do not update the DB. The webhook handles that.

---

## Environment Variables Required

```env
STRIPE_SECRET_KEY=sk_test_...        # from Stripe dashboard → API keys
STRIPE_WEBHOOK_SECRET=whsec_...      # from Stripe dashboard → Webhooks
NEXT_PUBLIC_APP_URL=http://localhost:3000  # your app's base URL
```

---

## Testing Locally

Stripe can't reach `localhost` to send webhooks. Use the **Stripe CLI**:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This gives you a local `STRIPE_WEBHOOK_SECRET` to put in `.env`.

Use Stripe's test card: `4242 4242 4242 4242`, any future expiry, any CVC.

---

## Summary — Who Does What

| Responsibility | Where |
|---|---|
| Create Checkout Session | Server action (`purchasePass`, `bookStudio`) |
| Redirect browser to Stripe | Client component (`BuyPassCard`, `StudioRentalClient`) |
| Confirm payment in DB | Webhook (`app/api/stripe/webhook/route.ts`) |
| Show confirmation to user | Success pages (`/passes/success`, `/bookings/success`) |
