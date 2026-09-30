"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");

  async function routeUser() {
    const response = await fetch("/api/auth/route-user", {
      cache: "no-store",
    });

    if (!response.ok) return false;

    const result = await response.json();

    if (!result.destination) return false;

    router.replace(result.destination);
    router.refresh();

    return true;
  }

  useEffect(() => {
    async function checkSession() {
      try {
        const supabase = createClient();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          const routed = await routeUser();

          if (routed) return;
        }
      } finally {
        setChecking(false);
      }
    }

    checkSession();
  }, []);

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();

      const { error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) throw error;

      const routed = await routeUser();

      if (!routed) {
        throw new Error(
          "Login successful, but your DMV Attack profile could not be found."
        );
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setMessage(
        "Enter your email address first, then select Forgot Password."
      );
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const supabase = createClient();

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo: `${window.location.origin}/auth/callback?next=/set-password`,
          }
        );

      if (error) throw error;

      setMessage(
        "Check your email for the DMV Attack password reset link."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to send password reset."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-white/30">
          Checking Account...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white md:py-24">
      <div className="mx-auto max-w-md">
        <Link
          href="/"
          className="text-[10px] font-black uppercase tracking-[0.28em] text-lime-400"
        >
          DMV Attack
        </Link>

        <h1 className="mt-4 text-4xl font-black uppercase md:text-5xl">
          Account Login
        </h1>

        <p className="mt-4 text-sm leading-7 text-white/50">
          Staff and families can securely access
          their DMV Attack account here.
        </p>

        <form
          onSubmit={handleLogin}
          className="mt-9 rounded-[30px] border border-white/10 bg-white/[0.03] p-6"
        >
          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">
              Email Address
            </span>

            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none placeholder:text-white/25 focus:border-lime-400"
            />
          </label>

          <label className="mt-5 block">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">
              Password
            </span>

            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Your password"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none placeholder:text-white/25 focus:border-lime-400"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-full bg-lime-400 px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-lime-300 disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleForgotPassword}
            className="mt-4 w-full text-center text-xs font-bold text-white/45 hover:text-lime-400"
          >
            Forgot Password?
          </button>

          {message && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/65">
              {message}
            </div>
          )}
        </form>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center">
          <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/30">
            DMV Attack Families
          </div>

          <p className="mt-2 text-xs leading-6 text-white/45">
            One family account can be connected to
            multiple DMV Attack athletes.
          </p>
        </div>
      </div>
    </main>
  );
}
