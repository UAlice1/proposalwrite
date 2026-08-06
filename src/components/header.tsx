"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    plan?: string;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-zinc-900">
          <FileText className="h-6 w-6 text-violet-600" />
          <span className="text-lg">Proposal AI</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/dashboard"
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/dashboard"
                ? "bg-violet-50 text-violet-700"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            )}
          >
            Dashboard
          </Link>
          <Link
            href="/proposals/new"
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/proposals/new"
                ? "bg-violet-50 text-violet-700"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            )}
          >
            New Proposal
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden items-center gap-2 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">
                  {user.name?.charAt(0).toUpperCase() ?? "U"}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-900">{user.name}</span>
                  <span className="text-xs text-zinc-500">{user.plan}</span>
                </div>
              </div>
              <form action="/api/auth/signout" method="POST">
                <Button type="submit" variant="ghost" size="sm">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </form>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">
                <User className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
