import { PLAN_COOKIE } from "@/lib/auth/cookie-name";
import type { DummyBilling, UserPlan } from "@/lib/auth/types";
import { createUser, findUserByEmail } from "@/lib/auth/users";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function detectBrand(number: string): string {
  const n = number.replace(/\s+/g, "");
  if (n.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "Amex";
  return "Card";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "")
      .toLowerCase()
      .trim();
    const password = String(body.password || "");
    const role = String(body.role || "owner");
    const plan = (String(body.plan || "paid") === "paid" ? "paid" : "demo") as UserPlan;
    const cardNumber = String(body.cardNumber || "").replace(/\s+/g, "");
    const cardExpiry = String(body.cardExpiry || "").trim();
    const cardCvc = String(body.cardCvc || "").trim();

    // Demo accounts are created via Supabase Auth on the client — not here
    if (plan !== "paid") {
      return NextResponse.json(
        { error: "Use Free Demo signup on the form. This API is for Paid accounts only." },
        { status: 400 }
      );
    }

    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: "MONGODB_URI is not configured." },
        { status: 500 }
      );
    }

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (role !== "owner") {
      return NextResponse.json(
        { error: "Only Owner role is available. Tenant is coming soon." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    let billing: DummyBilling | null = null;
    if (cardNumber.length < 12 || !cardExpiry || cardCvc.length < 3) {
      return NextResponse.json(
        { error: "Card number, expiry, and CVC are required for Paid plan." },
        { status: 400 }
      );
    }
    billing = {
      dummy: true,
      last4: cardNumber.slice(-4),
      brand: detectBrand(cardNumber),
      acceptedAt: new Date().toISOString(),
    };

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      email,
      name,
      passwordHash,
      role: "owner",
      plan,
      billing,
    });

    const jar = await cookies();
    jar.set(PLAN_COOKIE, plan, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        role: user.role,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Registration failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
