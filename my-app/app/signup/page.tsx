"use client";

import { PLAN_COOKIE } from "@/lib/auth/cookie-name";
import { setClientPlan, type ClientPlan } from "@/lib/auth/plan";
import { createClient } from "@/lib/supabase/client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState<ClientPlan>("demo");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
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
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name.trim() },
          },
        });
        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }
        // If email confirm is off, session exists; otherwise ask them to sign in
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          router.replace("/admin");
          router.refresh();
          return;
        }
        setError(null);
        setLoading(false);
        router.push("/login?plan=demo");
        return;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role: "owner",
          plan: "paid",
          cardNumber,
          cardExpiry,
          cardCvc,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed.");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        plan: "paid",
        redirect: false,
      });

      if (result?.error) {
        setError("Account created, but sign-in failed. Please log in.");
        setLoading(false);
        router.push("/login");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
      setLoading(false);
    }
  }

  async function onGoogle() {
    if (plan !== "paid") {
      setError("Google signup is available on Paid only. Use email for Free Demo.");
      return;
    }
    setClientPlan("paid");
    document.cookie = `${PLAN_COOKIE}=paid; path=/; max-age=3600; samesite=lax`;
    await signIn("google", { callbackUrl: "/admin" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-5 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(124,92,252,0.28),transparent)]" />

      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-navy-soft/90 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet text-sm font-bold text-white">
              Y
            </span>
            <span className="text-lg font-semibold text-white">
              Yasin <span className="text-violet-soft">RMS</span>
            </span>
          </Link>
          <h1 className="mt-5 text-2xl font-semibold text-white">Create account</h1>
          <p className="mt-2 text-sm text-gray-muted">
            Choose Free Demo or Paid to create your account.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Full name" value={name} onChange={setName} required />
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            required
            autoComplete="email"
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            required
            autoComplete="new-password"
          />

          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-muted">Role</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="rounded-xl border border-violet bg-violet/20 px-3 py-2.5 text-sm font-semibold text-white"
              >
                Owner
              </button>
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-gray-muted opacity-60"
                title="Coming soon"
              >
                Tenant · Coming soon
              </button>
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-muted">Plan</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <PlanCard
                active={plan === "demo"}
                title="Free Demo"
                subtitle="Try the app · up to 20 tenants"
                onClick={() => setPlan("demo")}
              />
              <PlanCard
                active={plan === "paid"}
                title="Paid"
                subtitle="Full workspace · card required"
                onClick={() => setPlan("paid")}
              />
            </div>
          </div>

          {plan === "paid" && (
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-soft">
                Payment (dummy — any card accepted)
              </p>
              <Field
                label="Card number"
                value={cardNumber}
                onChange={setCardNumber}
                required
                placeholder="4242 4242 4242 4242"
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Expiry"
                  value={cardExpiry}
                  onChange={setCardExpiry}
                  required
                  placeholder="MM/YY"
                />
                <Field
                  label="CVC"
                  value={cardCvc}
                  onChange={setCardCvc}
                  required
                  placeholder="123"
                />
              </div>
            </div>
          )}

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
            {loading ? "Creating account…" : "Create account"}
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
          Already have an account?{" "}
          <Link href="/login" className="text-violet-soft hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-muted">
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none ring-violet/40 placeholder:text-gray-muted focus:ring-2"
      />
    </div>
  );
}

function PlanCard({
  active,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-3 text-start transition ${
        active
          ? "border-violet bg-violet/20 text-white"
          : "border-white/10 bg-white/5 text-gray-muted hover:border-white/20"
      }`}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-[11px] opacity-80">{subtitle}</p>
    </button>
  );
}
