"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [sentTo,  setSentTo]  = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: data.email }),
      });

      if (!res.ok) {
        const json = await res.json() as { message?: string };
        toast.error(json.message ?? "Something went wrong. Please try again.");
        return;
      }

      setSentTo(data.email);
      setSent(true);
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-svh bg-zinc-50 dark:bg-transparent flex items-center justify-center px-4 py-4 overflow-y-auto">
      <div className="w-full max-w-sm my-auto">
        <div className="bg-card border rounded-xl shadow-md shadow-zinc-950/5 overflow-hidden">
          <div className="px-6 pt-6 pb-5">

            {/* Brand */}
            <div className="text-center mb-5">
              <Link href="/" aria-label="go home" className="mx-auto inline-block mb-3">
                <span className="text-base font-semibold">PryroWriter</span>
              </Link>

              {sent ? (
                <>
                  <div className="mx-auto mb-3 flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30">
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h1 className="text-lg font-semibold leading-tight">Check your email</h1>
                  <p className="text-xs text-muted-foreground mt-1 px-2">
                    We sent a password reset link to{" "}
                    <span className="font-medium text-foreground">{sentTo}</span>.
                    It expires in 1 hour.
                  </p>
                </>
              ) : (
                <>
                  <div className="mx-auto mb-3 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-lg font-semibold leading-tight">Forgot password?</h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter your email and we&apos;ll send you a reset link.
                  </p>
                </>
              )}
            </div>

            {sent ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground text-center">
                  Didn&apos;t receive it? Check your spam folder, or{" "}
                  <button
                    onClick={() => setSent(false)}
                    className="text-primary underline underline-offset-2"
                  >
                    try again
                  </button>
                  .
                </p>
                <Button asChild className="w-full h-9 text-sm" variant="outline">
                  <Link href="/login">
                    <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                    Back to sign in
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs font-medium">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    {...register("email")}
                    className={`h-9 text-sm ${errors.email ? "border-destructive" : ""}`}
                    autoFocus
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full h-9 text-sm" disabled={loading}>
                  {loading && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                  Send reset link
                </Button>
              </form>
            )}
          </div>

          {/* Footer */}
          {!sent && (
            <div className="px-6 py-3 border-t bg-muted/30">
              <p className="text-center text-xs text-muted-foreground">
                Remember your password?{" "}
                <Button asChild variant="link" className="px-1 h-auto text-xs">
                  <Link href="/login">Sign in</Link>
                </Button>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
