"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function routeUser() {
    const response = await fetch("/api/auth/route-user", {
      cache: "no-store",
    });

    if (!response.ok) {
      router.replace("/login");
      return;
    }

    const result = await response.json();

    router.replace(result.destination || "/login");
    router.refresh();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage(
        "Your password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "Your secure link has expired. Request a new password link from the login page."
        );
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setMessage("Password saved. Opening your account...");

      await routeUser();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-20 text-white">
      <div className="mx-auto max-w-md">
        <div className="text-[10px] font-black uppercase tracking-[0.28em] text-lime-400">
          DMV Attack
        </div>

        <h1 className="mt-4 text-4xl font-black uppercase md:text-5xl">
          Set Password
        </h1>

        <p className="mt-4 text-sm leading-7 text-white/50">
          Create the password you&apos;ll use to access your
          DMV Attack account.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-9 rounded-[30px] border border-white/10 bg-white/[0.03] p-6"
        >
          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">
              New Password
            </span>

            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black px-5 py-4 outline-none focus:border-lime-400"
            />
          </label>

          <label className="mt-5 block">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">
              Confirm Password
            </span>

            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black px-5 py-4 outline-none focus:border-lime-400"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-full bg-lime-400 px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-black disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Password"}
          </button>

          {message && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/65">
              {message}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
