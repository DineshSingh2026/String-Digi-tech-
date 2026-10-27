import { Resend } from "resend";
import { contactSchema } from "@/lib/contactSchema";

const WINDOW_MS = 60 * 60 * 1000;
const LIMIT = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return false;
}

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });
  const data = parsed.data;

  // Honeypot filled: pretend success, do nothing.
  if (data.website && data.website.length > 0) return Response.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) return Response.json({ error: "not_configured" }, { status: 503 });

  const from = process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";
  const text = [
    `Name: ${data.name}`,
    `Company: ${data.company}`,
    `Email: ${data.email}`,
    `Country: ${data.country}`,
    `Interest: ${data.interest}`,
    `Consent: yes`,
    "",
    data.message,
  ].join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: data.email,
      subject: `Website enquiry: ${data.interest} (${data.company})`,
      text,
    });
    if (error) return Response.json({ error: "send_failed" }, { status: 502 });
  } catch {
    return Response.json({ error: "send_failed" }, { status: 502 });
  }
  return Response.json({ ok: true });
}
