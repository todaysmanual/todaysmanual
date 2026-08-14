import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const destinationEmail = "todaysmanual@gmail.com";
const fallbackSender = "Today's Manual <onboarding@resend.dev>";

type ContactRequest = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  company?: unknown;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let body: ContactRequest;
  try {
    body = (await request.json()) as ContactRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (text(body.company)) return NextResponse.json({ ok: true });

  const name = text(body.name);
  const email = text(body.email).toLowerCase();
  const subject = text(body.subject);
  const message = text(body.message);

  if (name.length < 2 || name.length > 120) return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  if (!emailPattern.test(email) || email.length > 254) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (subject.length < 2 || subject.length > 160) return NextResponse.json({ error: "Choose or enter a subject." }, { status: 400 });
  if (message.length < 10 || message.length > 5000) return NextResponse.json({ error: "Your message must be between 10 and 5,000 characters." }, { status: 400 });

  const supabase = createPublicSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "The contact form is not configured." }, { status: 503 });

  const { error } = await supabase.from("contact_messages").insert({ name, email, subject, message });
  if (error) {
    console.error("Supabase rejected a contact message", error.message);
    return NextResponse.json({ error: "We could not send your message. Please try again." }, { status: 502 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const from = process.env.WAITLIST_FROM_EMAIL?.trim() || fallbackSender;
      const { error: emailError } = await resend.emails.send({
        from,
        to: destinationEmail,
        replyTo: email,
        subject: `Today’s Manual contact: ${subject}`,
        text: [`Name: ${name}`, `Email: ${email}`, `Subject: ${subject}`, "", message].join("\n"),
      });
      if (emailError) console.error("Resend rejected a contact notification", emailError);
    } catch (notificationError) {
      console.error("Contact notification failed", notificationError);
    }
  }

  return NextResponse.json({ ok: true });
}
