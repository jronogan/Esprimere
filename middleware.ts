import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth(function middleware(request: NextRequest) {
  // @ts-expect-error next-auth v5: session is attached to request as request.auth
  const session = request.auth;
  const { pathname } = request.nextUrl;

  // Protect /dashboard routes — studio owner only
  if (pathname.startsWith("/dashboard")) {
    if (!session || session.user.role !== "STUDIO_OWNER") {
      return NextResponse.redirect(new URL("/studio/login", request.url));
    }
    return NextResponse.next();
  }

  // Reserved routes — not studio slugs
  const reserved = ["studio", "dashboard", "api", "_next"];
  const slug = pathname.split("/")[1];
  if (!slug || reserved.includes(slug)) return NextResponse.next();

  // Protect student routes under /[studioSlug]
  const studentRoutes = ["/classes", "/spaces", "/profile"];
  const isStudentRoute = studentRoutes.some((r) => pathname.includes(r));

  if (isStudentRoute) {
    if (!session || session.user.slug !== slug) {
      return NextResponse.redirect(new URL(`/${slug}/login`, request.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
