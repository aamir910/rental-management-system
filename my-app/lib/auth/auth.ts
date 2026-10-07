import { authConfig } from "@/lib/auth/auth.config";
import { PLAN_COOKIE } from "@/lib/auth/cookie-name";
import type { UserPlan } from "@/lib/auth/types";
import "@/lib/auth/types";
import {
  createUser,
  findUserByEmail,
  findUserByGoogleId,
  findUserById,
  linkGoogleId,
  updateUserPlan,
} from "@/lib/auth/users";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { cookies } from "next/headers";

function parsePlan(value: unknown): UserPlan {
  return String(value) === "paid" ? "paid" : "demo";
}

async function readPlanCookie(): Promise<UserPlan> {
  try {
    const jar = await cookies();
    const value = jar.get(PLAN_COOKIE)?.value;
    if (value === "paid" || value === "demo") return value;
  } catch {
    // ignore
  }
  return "demo";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        plan: { label: "Plan", type: "text" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "")
          .toLowerCase()
          .trim();
        const password = String(credentials?.password || "");
        const selectedPlan = parsePlan(credentials?.plan);
        if (!email || !password) return null;

        const user = await findUserByEmail(email);
        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // Persist chosen workspace so API adapters route correctly
        if (user.plan !== selectedPlan) {
          await updateUserPlan(user._id, selectedPlan);
        }

        return {
          id: user._id,
          email: user.email,
          name: user.name,
          plan: selectedPlan,
          role: user.role,
        };
      },
    }),
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;

      const email = user.email?.toLowerCase().trim();
      if (!email) return false;

      const googleId = account.providerAccountId;
      const selectedPlan = await readPlanCookie();
      let existing =
        (await findUserByGoogleId(googleId)) || (await findUserByEmail(email));

      if (!existing) {
        existing = await createUser({
          email,
          name: user.name || email.split("@")[0],
          plan: selectedPlan,
          googleId,
          role: "owner",
        });
      } else {
        if (!existing.googleId) {
          await linkGoogleId(existing._id, googleId);
        }
        if (existing.plan !== selectedPlan) {
          await updateUserPlan(existing._id, selectedPlan);
        }
      }

      user.id = existing._id;
      user.plan = selectedPlan;
      user.role = existing.role;
      user.name = existing.name;
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.plan = user.plan ?? "demo";
        token.role = user.role ?? "owner";
        token.email = user.email;
        token.name = user.name;
        return token;
      }

      if (token.id && (trigger === "update" || !token.plan)) {
        const dbUser = await findUserById(String(token.id));
        if (dbUser) {
          token.plan = dbUser.plan;
          token.role = dbUser.role;
          token.email = dbUser.email;
          token.name = dbUser.name;
        }
      }
      return token;
    },
  },
  secret: process.env.AUTH_SECRET,
});
