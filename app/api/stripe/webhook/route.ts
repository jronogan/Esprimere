import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { BookingStatus, PaymentType } from "@/app/generated/prisma/client";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig)
    return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // ── Studio booking ────────────────────────────────────────────────────────────
  const studioBooking = await prisma.studioBooking.findUnique({
    where: { stripeSessionId: session.id },
  });

  if (studioBooking) {
    await prisma.studioBooking.update({
      where: { id: studioBooking.id },
      data: { status: BookingStatus.CONFIRMED },
    });

    await prisma.payment.updateMany({
      where: { stripeSessionId: session.id },
      data: { stripePaymentId: session.payment_intent as string },
    });

    return NextResponse.json({ received: true });
  }

  // ── Pass purchase ─────────────────────────────────────────────────────────────
  const payment = await prisma.payment.findUnique({
    where: { stripeSessionId: session.id },
  });

  if (payment && payment.type === PaymentType.PASS_PURCHASE) {
    const passPackage = await prisma.passPackage.findFirst({
      where: { studioId: payment.studioId, price: payment.amount },
    });

    if (!passPackage) {
      return NextResponse.json(
        { error: "Pass package not found" },
        { status: 400 },
      );
    }

    const expiresAt = passPackage.expiryDays
      ? new Date(Date.now() + passPackage.expiryDays * 86400000)
      : null;

    const userPass = await prisma.userPass.create({
      data: {
        userId: payment.userId,
        studioId: payment.studioId,
        passPackageId: passPackage.id,
        creditsRemaining:
          passPackage.type === "CREDITS" ? passPackage.credits : null,
        expiresAt,
      },
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        stripePaymentId: session.payment_intent as string,
        userPassId: userPass.id,
      },
    });
  }

  return NextResponse.json({ received: true });
}
