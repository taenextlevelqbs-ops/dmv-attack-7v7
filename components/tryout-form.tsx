"use client";
import { useRef, useState } from "react";
export default function TryoutForm({
  children,
}: {
  children: React.ReactNode;
}) {
  const [error, setError] = useState(""),
    [submitting, setSubmitting] = useState(false);
  const alert = useRef<HTMLDivElement>(null);
  return (
    <form
      action="/api/tryouts/register"
      method="POST"
      encType="multipart/form-data"
      className="space-y-4 md:space-y-8"
      aria-busy={submitting}
      onSubmit={async (e) => {
        e.preventDefault();
        if (submitting) return;
        const form = e.currentTarget;
        const values = new FormData(form);
        setSubmitting(true);
        setError("");
        try {
          const image = values.get("Athlete Headshot");
          if (image instanceof File && image.size > 4 * 1024 * 1024)
            throw new Error(
              "Headshot must be 4MB or smaller. Please choose a smaller photo.",
            );
          const response = await fetch("/api/tryouts/register", {
            method: "POST",
            body: values,
          });
          if (
            response.ok &&
            response.redirected &&
            new URL(response.url).origin === window.location.origin
          ) {
            window.location.assign(response.url);
            return;
          }
          const result = await response.json().catch(() => null);
          if(response.ok && (result?.url || result?.redirect_url)) {
            const destination=new URL(result.url||result.redirect_url,window.location.origin);
            if(destination.origin!==window.location.origin && !(destination.protocol==="https:" && destination.hostname==="checkout.stripe.com")) throw Error("Invalid payment destination");
            window.location.assign(destination.href);
            return;
          }
          throw new Error(
            result?.error ||
              "Unable to submit registration. Please retry. Your form is still here.",
          );
        } catch (reason) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Unable to submit. Please retry.",
          );
          requestAnimationFrame(() => alert.current?.focus());
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div
        ref={alert}
        tabIndex={-1}
        role={error ? "alert" : undefined}
        className={
          error
            ? "rounded-xl border border-red-400/40 p-4 text-red-200"
            : "hidden"
        }
      >
        {error}
      </div>
      <fieldset
        disabled={submitting}
        className="min-w-0 space-y-4 md:space-y-8"
      >
        {children}
      </fieldset>
      {submitting && (
        <p role="status" className="text-lime-300">
          Saving your registration and headshot. Please wait…
        </p>
      )}
    </form>
  );
}
