import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { RegisterForm } from "./register-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account — Pryro Proposals",
};

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white text-lg font-bold shadow-sm">
          P
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-0.5">
            Pryro
          </p>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Proposals
          </h1>
        </div>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white px-8 py-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-zinc-900">Create account</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Start writing better proposals today
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
