import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const destinationEmail = "todaysmanual@gmail.com";
const fallbackSender = "Today's Manual <onboarding@resend.dev>";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type WaitlistRequest = {
  email?: unknown;
  company?: unknown;
};

export async function POST(request: Request) {
  let body: WaitlistRequest;

  try {
    body = (await request.json()) as WaitlistRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 },
    );
  }

  // Quietly accept honeypot submissions so automated bots do not retry.
  if (typeof body.company === "string" && body.company.trim()) {
    return NextResponse.json({ ok: true });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || email.length > 254 || !emailPattern.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Waitlist email delivery is not configured." },
      { status: 503 },
    );
  }

  const resend = new Resend(apiKey);
  const from = process.env.WAITLIST_FROM_EMAIL?.trim() || fallbackSender;

  try {
    const { error } = await resend.emails.send(
      {
        from,
        to: destinationEmail,
        replyTo: email,
        subject: "New Today's Manual waitlist signup",
        text: [
          "A new reader joined the Today's Manual waitlist.",
          "",
          `Email: ${email}`,
          `Submitted: ${new Date().toISOString()}`,
        ].join("\n"),
      },
      {
        headers: {
          "Idempotency-Key": `todaysmanual-waitlist-${email}`,
        },
      },
    );

    if (error) {
      console.error("Resend rejected a waitlist notification", error);
      return NextResponse.json(
        { error: "We could not add you right now. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Waitlist notification failed", error);
    return NextResponse.json(
      { error: "We could not add you right now. Please try again." },
      { status: 502 },
    );
  }
}
