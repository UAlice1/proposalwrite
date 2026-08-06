"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, LogOut, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    plan?: string;
  } | null;
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/proposals", label: "Proposals", icon: FileText },
];

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-600 text-white text-xs font-bold group-hover:bg-violet-700 transition-colors">
            P
          </div>
          <span className="font-semibold text-zinc-900 text-sm">
            Pryro <span className="text-violet-600">Proposals</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-violet-50 text-violet-700"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/proposals/new">
                <Button size="sm" className="hidden sm:inline-flex">
                  <Plus className="h-3.5 w-3.5" />
                  New Proposal
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-violet-700 text-xs font-medium uppercase">
                  {user.name?.[0] ?? user.email?.[0] ?? "U"}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-zinc-400 hover:text-zinc-600 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm" variant="outline">
                <User className="h-3.5 w-3.5" />
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
