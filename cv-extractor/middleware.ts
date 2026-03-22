import { NextRequest, NextResponse } from "next/server";
import { USER_ROLE_COOKIE } from "@/lib/user-role";

const protectedPaths = ["/dashboard"];
const founderPaths = ["/jobs/post"];
const adminPaths = ["/admin"];

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname.startsWith(prefix));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = req.cookies.get(USER_ROLE_COOKIE)?.value || "candidate";

  if (startsWithAny(pathname, protectedPaths)) {
    // Soft gate: requires role cookie set after auth.
    if (!req.cookies.get(USER_ROLE_COOKIE)) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (startsWithAny(pathname, founderPaths) && role !== "founder" && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (startsWithAny(pathname, adminPaths) && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/jobs/post", "/admin/:path*"],
};
