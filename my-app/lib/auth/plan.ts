import { PLAN_COOKIE } from "@/lib/auth/cookie-name";

export type ClientPlan = "demo" | "paid";

export function getClientPlan(): ClientPlan {
  if (typeof document === "undefined") return "demo";
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${PLAN_COOKIE}=(demo|paid)`)
  );
  return match?.[1] === "paid" ? "paid" : "demo";
}

export function setClientPlan(plan: ClientPlan) {
  if (typeof document === "undefined") return;
  document.cookie = `${PLAN_COOKIE}=${plan}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
}

export function isDemoPlan() {
  return getClientPlan() === "demo";
}
