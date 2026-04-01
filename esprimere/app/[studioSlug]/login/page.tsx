import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import UserLoginForm from "./UserLoginForm";

export default async function UserLoginPage({
  params,
}: {
  params: Promise<{ studioSlug: string }>;
}) {
  const { studioSlug } = await params;

  const studio = await prisma.studio.findUnique({
    where: { slug: studioSlug },
  });

  if (!studio) notFound();

  return (
    <UserLoginForm
      studioSlug={studioSlug}
      studioName={studio.name}
    />
  );
}
