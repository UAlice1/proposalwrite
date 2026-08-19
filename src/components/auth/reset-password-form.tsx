"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

const schema = z
  .object({
    password:        z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path:    ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

type TokenStatus = "checking" | "valid" | "invalid";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [tokenStatus,   setTokenStatus]   = useState<TokenStatus>("checking");
  const [loading,       setLoading]       = useState(false);
  const [done,          setDone]          = useState(false);
  const [showPassword,  setShowPassword]  = useState(false);
  const [showConfirm,   setShowConfirm]   = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Validate token on mount
  useEffect(() => {
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data: { valid?: boolean }) => {
        setTokenStatus(data.valid ? "valid" : "invalid");
      })
      .catch(() => setTokenStatus("invalid"));
  }, [token]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, password: data.password }),
      });

      const json = await res.json() as { success?: boolean; message?: string };

      if (!res.ok) {
        toast.error(json.message ?? "Something went wrong. Please try again.");
        if (res.status === 400) setTokenStatus("invalid");
        return;
      }

      setDone(true);
      toast.success("Password updated successfully!");
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      toast.error("Network error. Please try again.");
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

              {/* Checking state */}
              {tokenStatus === "checking" && (
                <>
                  <div className="mx-auto mb-3 flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                  <h1 className="text-lg font-semibold leading-tight">Verifying link…</h1>
                  <p className="text-xs text-muted-foreground mt-1">Please wait a moment.</p>
                </>
              )}

              {/* Invalid token */}
              {tokenStatus === "invalid" && (
                <>
                  <div className="mx-auto mb-3 flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
                    <XCircle className="w-6 h-6 text-destructive" />
                  </div>
                  <h1 className="text-lg font-semibold leading-tight">Link expired or invalid</h1>
                  <p className="text-xs text-muted-foreground mt-1 px-2">
                    This password reset link is invalid or has expired.
                    Reset links are valid for 1 hour.
                  </p>
                </>
              )}

              {/* Success */}
              {done && (
                <>
                  <div className="mx-auto mb-3 flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30">
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h1 className="text-lg font-semibold leading-tight">Password updated!</h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Redirecting you to sign in…
                  </p>
                </>
              )}

              {/* Valid token — show form */}
              {tokenStatus === "valid" && !done && (
                <>
                  <h1 className="text-lg font-semibold leading-tight">Set a new password</h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose a strong password for your account.
                  </p>
                </>
              )}
            </div>

            {/* Invalid — show request link */}
            {tokenStatus === "invalid" && (
              <div className="space-y-3">
                <Button asChild className="w-full h-9 text-sm">
                  <Link href="/forgot-password">Request new reset link</Link>
                </Button>
                <Button asChild variant="outline" className="w-full h-9 text-sm">
                  <Link href="/login">Back to sign in</Link>
                </Button>
              </div>
            )}

            {/* Form */}
            {tokenStatus === "valid" && !done && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                {/* New password */}
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-xs font-medium">New password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      {...register("password")}
                      className={`h-9 text-sm pr-9 ${errors.password ? "border-destructive" : ""}`}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm password */}
                <div className="space-y-1">
                  <Label htmlFor="confirmPassword" className="text-xs font-medium">Confirm password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat password"
                      {...register("confirmPassword")}
                      className={`h-9 text-sm pr-9 ${errors.confirmPassword ? "border-destructive" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full h-9 text-sm mt-1" disabled={loading}>
                  {loading && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                  Update password
                </Button>
              </form>
            )}
          </div>

          {/* Footer */}
          {tokenStatus !== "checking" && !done && (
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
