import type { NextAuthConfig } from "next-auth";

/** Edge-safe Auth.js config (no Node/Mongo imports). */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isAdmin = pathname.startsWith("/admin");
      const isLogin = pathname === "/login";
      const isSignup = pathname === "/signup";

      if (isAdmin) return isLoggedIn;
      if ((isLogin || isSignup) && isLoggedIn) {
        return Response.redirect(new URL("/admin", request.nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.plan = user.plan ?? "demo";
        token.role = user.role ?? "owner";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id || "");
        session.user.plan = token.plan === "paid" ? "paid" : "demo";
        session.user.role = token.role === "tenant" ? "tenant" : "owner";
        session.user.email = String(token.email || session.user.email || "");
        session.user.name = token.name ?? session.user.name;
      }
      return session;
    },
  },
  trustHost: true,
};
