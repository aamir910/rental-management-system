"use client";

import { PLAN_COOKIE } from "@/lib/auth/cookie-name";
import { setClientPlan, type ClientPlan } from "@/lib/auth/plan";
import { createClient } from "@/lib/supabase/client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const initialPlan =
    searchParams.get("plan") === "paid" ? "paid" : "demo";
  const [plan, setPlan] = useState<ClientPlan>(initialPlan);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setClientPlan(plan);
  }, [plan]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setClientPlan(plan);

    try {
      if (plan === "demo") {
        const supabase = createClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }
        router.replace(next);
        router.refresh();
        return;
      }

      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        plan: "paid",
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password for Paid account.");
        setLoading(false);
        return;
      }

      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
      setLoading(false);
    }
  }

  async function onGoogle() {
    setClientPlan(plan);
    document.cookie = `${PLAN_COOKIE}=${plan}; path=/; max-age=3600; samesite=lax`;
    if (plan === "demo") {
      setError("Google sign-in is available on Paid. Use email/password for Free Demo.");
      return;
    }
    await signIn("google", { callbackUrl: next });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-5 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(124,92,252,0.28),transparent)]" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-navy-soft/90 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet text-sm font-bold text-white">
              Y
            </span>
            <span className="text-lg font-semibold text-white">
              Yasin <span className="text-violet-soft">RMS</span>
            </span>
          </Link>
          <h1 className="mt-5 text-2xl font-semibold text-white">Sign in</h1>
          <p className="mt-2 text-sm text-gray-muted">
            Choose Free Demo or Paid, then sign in.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-muted">Plan</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPlan("demo")}
                className={`rounded-xl border px-3 py-3 text-start transition ${
                  plan === "demo"
                    ? "border-violet bg-violet/20 text-white"
                    : "border-white/10 bg-white/5 text-gray-muted hover:border-white/20"
                }`}
              >
                <p className="text-sm font-semibold">Free Demo</p>
                <p className="mt-1 text-[11px] opacity-80">
                  Try the app · up to 20 tenants
                </p>
              </button>
              <button
                type="button"
                onClick={() => setPlan("paid")}
                className={`rounded-xl border px-3 py-3 text-start transition ${
                  plan === "paid"
                    ? "border-violet bg-violet/20 text-white"
                    : "border-white/10 bg-white/5 text-gray-muted hover:border-white/20"
                }`}
              >
                <p className="text-sm font-semibold">Paid</p>
                <p className="mt-1 text-[11px] opacity-80">
                  Full workspace · unlimited
                </p>
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-muted">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none ring-violet/40 placeholder:text-gray-muted focus:ring-2"
              placeholder="owner@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-muted">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none ring-violet/40 placeholder:text-gray-muted focus:ring-2"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red/30 bg-red/10 px-3 py-2 text-sm text-red">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet py-2.5 text-sm font-semibold text-white transition hover:bg-violet-soft disabled:opacity-60"
          >
            {loading
              ? "Signing in…"
              : plan === "demo"
                ? "Sign in to Free Demo"
                : "Sign in to Paid"}
          </button>
        </form>

        {plan === "paid" && (
          <>
            <div className="my-5 flex items-center gap-3 text-xs text-gray-muted">
              <div className="h-px flex-1 bg-white/10" />
              or
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <button
              type="button"
              onClick={onGoogle}
              className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Continue with Google
            </button>
          </>
        )}

        <p className="mt-6 text-center text-xs text-gray-muted">
          No account?{" "}
          <Link href="/signup" className="text-violet-soft hover:underline">
            Sign up
          </Link>
          {" · "}
          <Link href="/" className="text-violet-soft hover:underline">
            Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-navy text-white">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
