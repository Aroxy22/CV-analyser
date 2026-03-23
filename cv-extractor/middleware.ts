import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { USER_TOKEN_COOKIE, getRoleFromMetadata } from "@/lib/user-role";

const protectedPaths = ["/dashboard"];
const founderPaths = ["/jobs/post"];
const adminPaths = ["/admin"];

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = req.cookies.get(USER_TOKEN_COOKIE)?.value;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  let user: { user_metadata?: unknown } | null = null;

  if (token) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data } = await supabase.auth.getUser(token);
    user = data.user;
  }

  if (!user && startsWithAny(pathname, [...protectedPaths, ...founderPaths, ...adminPaths])) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = getRoleFromMetadata(user?.user_metadata);

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
