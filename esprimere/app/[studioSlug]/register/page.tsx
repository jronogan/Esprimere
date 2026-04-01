import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import UserRegisterForm from "./UserRegisterForm";

export default async function UserRegisterPage({
  params,
}: {
  params: Promise<{ studioSlug: string }>;
}) {
  const { studioSlug } = await params;

  const studio = await prisma.studio.findUnique({
    where: { slug: studioSlug },
  });

  if (!studio) notFound();

  return <UserRegisterForm studioId={studio.id} studioSlug={studioSlug} studioName={studio.name} />;
}
