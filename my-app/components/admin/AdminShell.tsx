"use client";

import { signOut } from "@/app/admin/actions";
import { PlanBadge } from "@/components/admin/PlanBadge";
import {
  Building2,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/admin/home", label: "Home", icon: Home },
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/tenants", label: "Tenants", icon: Users },
  { href: "/admin/rents", label: "Monthly Rents", icon: Receipt },
  { href: "/admin/expenses", label: "Daily Expenses", icon: Wallet },
];

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    if (href === "/admin/home") return pathname === "/admin/home";
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 start-0 z-40 flex w-64 flex-col border-e border-gray-soft bg-navy text-white transition-transform lg:static lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet text-sm font-bold">
              Y
            </span>
            <div>
              <p className="text-sm font-semibold">Yasin RMS</p>
              <p className="text-[10px] text-gray-muted">Admin Panel</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            {links.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition ${
                    active
                      ? "bg-violet text-white"
                      : "text-gray-muted hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <p className="mb-3 truncate text-xs text-gray-muted">{email}</p>
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
              >
                <LogOut size={16} />
                Logout
              </button>
            </form>
          </div>
        </aside>

        {open && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-gray-soft bg-white/90 px-3 backdrop-blur sm:h-16 sm:px-6">
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-soft lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-2 text-sm text-gray-text">
              <Building2 size={16} className="shrink-0 text-violet" />
              <span className="truncate">
                <span className="sm:hidden">Admin</span>
                <span className="hidden sm:inline">Owner workspace</span>
              </span>
              <PlanBadge />
            </div>

            <Link
              href="/"
              className="shrink-0 text-xs font-medium text-violet hover:underline"
            >
              View site
            </Link>
          </header>

          <main className="min-w-0 flex-1 overflow-x-hidden p-3 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
