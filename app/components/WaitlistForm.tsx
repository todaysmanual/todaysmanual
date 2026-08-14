"use client";

import { FormEvent, useState } from "react";
import { Icon } from "./Icon";
import type { SiteConfig } from "@/lib/cms/types";

type FormState = "idle" | "loading" | "success";

export function WaitlistForm({ copy }: { copy: SiteConfig["newsletter"] }) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

    if (!valid) {
      setError("Enter a valid email address.");
      return;
    }

    setError("");
    setState("loading");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, company }),
        signal: controller.signal,
      });

      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(result?.error || "We could not add you right now. Please try again.");
      }

      setState("success");
    } catch (submissionError) {
      setState("idle");
      setError(
        submissionError instanceof Error && submissionError.name !== "AbortError"
          ? submissionError.message
          : "The request took too long. Please try again.",
      );
    } finally {
      window.clearTimeout(timeout);
    }
  }

  if (state === "success") {
    return (
      <div
        className="waitlist-success"
        role="status"
      >
        <span className="waitlist-success__mark" aria-hidden="true"><Icon name="mail" size={19} /></span>
        <span>
          <strong>{copy.successTitle}</strong>
          <small>{copy.successDescription}</small>
        </span>
      </div>
    );
  }

  return (
    <form className="waitlist" onSubmit={handleSubmit} noValidate>
      <label className="waitlist__honeypot" aria-hidden="true">
        Company
        <input
          name="company"
          type="text"
          value={company}
          tabIndex={-1}
          autoComplete="off"
          onChange={(event) => setCompany(event.target.value)}
        />
      </label>
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
          <span>{state === "loading" ? "Joining…" : copy.buttonLabel}</span>
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
