"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/ideas";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submitEmailPassword(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const supabase = createSupabaseBrowserClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        router.push(nextPath);
        router.refresh();
      }
    } else {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });
      if (error) {
        setMessage(error.message);
      } else if (!data.session) {
        setMessage("Check your email to confirm your account before logging in.");
      } else {
        router.push(nextPath);
        router.refresh();
      }
    }

    setSubmitting(false);
  }

  async function loginWithGoogle() {
    setSubmitting(true);
    setMessage(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });

    if (error) {
      setMessage(error.message);
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-sm border border-border/80 bg-card/85 shadow-mockup backdrop-blur">
      <CardHeader className="space-y-4 pb-4 text-center">
        <CardTitle className="font-heading text-3xl">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </CardTitle>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          Sign in to submit ideas, get AI review, and publish your best concepts for builders.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="w-full bg-background"
          onClick={loginWithGoogle}
          disabled={submitting}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="mr-2 h-4 w-4">
            <path
              fill="#EA4335"
              d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.8-6-6.2s2.7-6.2 6-6.2c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 2.9 14.7 2 12 2 6.9 2 2.8 6.2 2.8 11.3s4.1 9.3 9.2 9.3c5.3 0 8.8-3.7 8.8-8.9 0-.6-.1-1-.1-1.5H12z"
            />
            <path
              fill="#34A853"
              d="M3.9 7.1l3.2 2.4C7.8 8 9.7 6.6 12 6.6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 2.9 14.7 2 12 2 8.3 2 5.1 4.1 3.9 7.1z"
            />
            <path
              fill="#FBBC05"
              d="M12 20.6c2.6 0 4.8-.9 6.4-2.4l-3-2.5c-.8.6-1.9 1.1-3.4 1.1-3.9 0-5.3-2.7-5.5-3.9l-3.2 2.5C4.6 18.5 8 20.6 12 20.6z"
            />
            <path
              fill="#4285F4"
              d="M20.8 11.7c0-.6-.1-1-.1-1.5H12v3.9h5.5c-.3 1.3-1.5 2.6-2.9 3.2l3 2.5c1.8-1.7 3.2-4.2 3.2-8.1z"
            />
          </svg>
          Continue with Google
        </Button>
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-dashed border-border" />
          </div>
          <p className="relative mx-auto w-fit bg-card px-3 text-xs text-muted-foreground">
            Or continue with email
          </p>
        </div>
        <form onSubmit={submitEmailPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-10 pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-10 pr-10 pl-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="h-10 w-full" disabled={submitting}>
            {mode === "login" ? "Sign in" : "Sign up"}
          </Button>
        </form>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login"
            ? "Need an account? Sign up"
            : "Already have an account? Sign in"}
        </Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </CardContent>
    </Card>
  );
}

