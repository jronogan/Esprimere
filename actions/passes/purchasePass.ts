"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { PaymentType } from "@/app/generated/prisma/client";

export async function purchasePass({
  passPackageId,
}: {
  passPackageId: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  const userId = session.user.id;

  const passPackage = await prisma.passPackage.findUnique({
    where: { id: passPackageId },
  });

  if (!passPackage) throw new Error("Pass not found.");

  const stripeSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "sgd",
          unit_amount: Math.round(Number(passPackage.price) * 100),
          product_data: { name: passPackage.name },
        },
      },
    ],
    metadata: {
      studioId: passPackage.studioId,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/passes/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/passes`,
  });

  await prisma.payment.create({
    data: {
      userId,
      studioId: passPackage.studioId,
      type: PaymentType.PASS_PURCHASE,
      amount: passPackage.price,
      stripeSessionId: stripeSession.id,
    },
  });

  return { url: stripeSession.url };
}
