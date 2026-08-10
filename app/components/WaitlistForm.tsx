"use client";

import { FormEvent, useState } from "react";

type FormState = "idle" | "loading" | "success";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    if (!valid) {
      setError("Enter a valid email address.");
      return;
    }

    setError("");
    setState("loading");
    window.setTimeout(() => setState("success"), 850);
  }

  if (state === "success") {
    return (
      <div
        className="waitlist-success"
        role="status"
      >
        <span className="waitlist-success__mark" aria-hidden="true">✓</span>
        <span>
          <strong>You&apos;re on the list.</strong>
          <small>We&apos;ll let you know when the first issue lands.</small>
        </span>
      </div>
    );
  }

  return (
    <form className="waitlist" onSubmit={handleSubmit} noValidate>
      <label className="sr-only" htmlFor="waitlist-email">Email address</label>
      <div className={`waitlist__control${error ? " waitlist__control--error" : ""}`}>
        <input
          id="waitlist-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Enter your email address"
          value={email}
          aria-describedby={error ? "waitlist-error" : undefined}
          aria-invalid={Boolean(error)}
          disabled={state === "loading"}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError("");
          }}
        />
        <button
          type="submit"
          disabled={state === "loading"}
        >
          <span>{state === "loading" ? "Joining…" : "Join the waitlist  →"}</span>
        </button>
      </div>
      {error && (
        <p
          id="waitlist-error"
          className="waitlist__error"
          role="alert"
        >
          {error}
        </p>
      )}
    </form>
  );
}
