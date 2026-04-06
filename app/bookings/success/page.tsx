import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let amount: string | null = null;
  let studioSlug: string | null = null;

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      amount = session.amount_total
        ? `$${(session.amount_total / 100).toFixed(0)}`
        : null;

      const studioId = session.metadata?.studioId;
      if (studioId) {
        const studio = await prisma.studio.findUnique({
          where: { id: studioId },
        });
        studioSlug = studio?.slug ?? null;
      }
    } catch {
      // session not found — still show confirmation
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white border border-gray-100 rounded-xl p-8 w-full max-w-[400px] text-center">
        <div className="w-11 h-11 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1D9E75"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-[16px] font-medium text-gray-900 mb-1">
          Studio booked!
        </p>
        <p className="text-[13px] text-gray-500 mb-6">
          Your payment was successful.{amount && ` Total charged: ${amount}.`}
          <br />A confirmation has been sent to your email.
        </p>

        {studioSlug && (
          <Link
            href={`/${studioSlug}/spaces`}
            className="w-full py-2 text-[13px] bg-[#1D9E75] text-white rounded-md hover:bg-[#0F6E56] transition text-center"
          >
            Back to spaces
          </Link>
        )}

        <div className="mt-4 bg-[#FAEEDA] border border-[#EF9F27] rounded-md px-3 py-2 text-[12px] text-[#633806] text-left">
          <strong className="font-medium">Reminder:</strong> Bring your booking
          reference on the day.
        </div>
      </div>
    </div>
  );
}
