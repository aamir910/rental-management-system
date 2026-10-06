"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";
  const envError = searchParams.get("error") === "missing_env";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    envError
      ? "Supabase env keys are missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
      : null
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-5">
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
          <h1 className="mt-5 text-2xl font-semibold text-white">Admin Login</h1>
          <p className="mt-2 text-sm text-gray-muted">
            Sign in to manage tenants and monthly rent.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
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
              placeholder="admin@example.com"
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
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-muted">
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
