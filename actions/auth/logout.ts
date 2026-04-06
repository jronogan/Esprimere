"use server";

import { signOut } from "@/lib/auth";

export async function logout(studioSlug: string) {
  await signOut({ redirectTo: `/${studioSlug}/login` });
}
