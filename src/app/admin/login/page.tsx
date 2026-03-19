"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Car, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoginLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    setLoginLoading(false);

    if (authError) {
      setError("Invalid email or password");
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (signupPassword !== signupConfirm) {
      setError("Passwords do not match");
      return;
    }

    if (signupPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSignupLoading(true);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin`,
      },
    });

    setSignupLoading(false);

    if (authError) {
      setError(authError.message);
    } else if (data.session) {
      // Auto-confirmed — session exists, go straight to admin
      router.push("/admin");
      router.refresh();
    } else {
      setSuccess("Account created. Check your email to confirm your account.");
      setSignupEmail("");
      setSignupPassword("");
      setSignupConfirm("");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Car className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="mt-4 text-2xl" style={{ fontFamily: "var(--font-heading)" }}>
            TLC Autos DMS
          </CardTitle>
          <CardDescription>Dealer Management System</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <div className="flex flex-col md:flex-row md:gap-0">
            {/* Sign In */}
            <div className="flex-1 px-2 md:px-6">
              <div className="mb-5 flex items-center gap-2">
                <LogIn className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                  Sign In
                </h2>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@tlcautos.com"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loginLoading}>
                  {loginLoading ? "Signing in..." : "Sign In"}
                </Button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!loginEmail) {
                      setError("Enter your email first, then click Forgot Password");
                      return;
                    }
                    setError("");
                    const supabase = createClient();
                    await supabase.auth.resetPasswordForEmail(loginEmail, {
                      redirectTo: `${window.location.origin}/auth/callback?next=/admin/update-password`,
                    });
                    setSuccess("Password reset email sent. Check your inbox.");
                  }}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </button>
              </form>
            </div>

            {/* Vertical Separator */}
            <div className="my-6 border-t border-border/60 md:my-0 md:border-t-0 md:border-l md:border-border/40" />

            {/* Sign Up */}
            <div className="flex-1 px-2 md:px-6">
              <div className="mb-5 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-secondary" />
                <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                  Create Account
                </h2>
              </div>
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="you@tlcautos.com"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-confirm">Confirm Password</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    value={signupConfirm}
                    onChange={(e) => setSignupConfirm(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full border-secondary/30 text-secondary hover:bg-secondary/5 hover:text-secondary"
                  disabled={signupLoading}
                >
                  {signupLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
