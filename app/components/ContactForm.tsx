"use client";

import { useState, type FormEvent } from "react";

type FormState = "idle" | "loading" | "success";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      subject: String(data.get("subject") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      company: String(data.get("company") ?? "").trim(),
    };

    if (payload.name.length < 2) return setError("Enter your name.");
    if (!emailPattern.test(payload.email)) return setError("Enter a valid email address.");
    if (payload.subject.length < 2) return setError("Choose or enter a subject.");
    if (payload.message.length < 10) return setError("Please add a little more detail to your message.");

    setState("loading");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(result?.error || "We could not send your message. Please try again.");
      form.reset();
      setState("success");
    } catch (submissionError) {
      setState("idle");
      setError(submissionError instanceof Error && submissionError.name !== "AbortError" ? submissionError.message : "The request took too long. Please try again.");
    } finally {
      window.clearTimeout(timeout);
    }
  }

  if (state === "success") {
    return <div className="contact-success" role="status"><span aria-hidden="true">✓</span><div><strong>Message sent.</strong><p>Thank you. The Today’s Manual team will reply to your email.</p></div></div>;
  }

  return <form className="contact-form" onSubmit={handleSubmit} noValidate>
    <label className="contact-honeypot" aria-hidden="true">Company<input name="company" type="text" tabIndex={-1} autoComplete="off" /></label>
    <div className="contact-form__grid">
      <label><span>Name</span><input name="name" autoComplete="name" maxLength={120} required /></label>
      <label><span>Email</span><input name="email" type="email" inputMode="email" autoComplete="email" maxLength={254} required /></label>
    </div>
    <label><span>Subject</span><select name="subject" defaultValue="" required><option value="" disabled>Select a subject</option><option>General enquiry</option><option>Writing or contribution</option><option>Advertising or commercial enquiry</option><option>Partnership</option><option>Correction or feedback</option><option>Privacy request</option></select></label>
    <label><span>Message</span><textarea name="message" rows={8} minLength={10} maxLength={5000} required placeholder="Tell us how we can help." /></label>
    {error && <p className="contact-form__error" role="alert">{error}</p>}
    <button className="dark-button" type="submit" disabled={state === "loading"}>{state === "loading" ? "Sending…" : "Send message"}</button>
  </form>;
}
