import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STUDIO_OWNER") {
    redirect("/studio/login");
  }
  return <>{children}</>;
}
