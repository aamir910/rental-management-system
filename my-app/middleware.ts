import { authConfig } from "@/lib/auth/auth.config";
import { getSupabaseEnv, isSupabaseEnvValid } from "@/lib/supabase/env";
import { createServerClient } from "@supabase/ssr";
import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const isAdmin = pathname.startsWith("/admin");
  const isLogin = pathname === "/login";
  const isSignup = pathname === "/signup";

  let response = NextResponse.next({ request: req });

  // Refresh Supabase session cookies (Demo path)
  let supabaseUser: { id: string; email?: string | null } | null = null;
  const { url, anonKey } = getSupabaseEnv();
  if (isSupabaseEnvValid(url, anonKey)) {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            req.cookies.set(name, value);
          });
          response = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    supabaseUser = user;
  }

  const authJsUser = req.auth?.user;
  const isLoggedIn = !!(supabaseUser || authJsUser);

  if (isAdmin && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if ((isLogin || isSignup) && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  return response;
});

export const config = {
  matcher: ["/admin/:path*", "/login", "/signup"],
};
