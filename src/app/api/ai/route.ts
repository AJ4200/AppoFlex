import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { complete, isGroqConfigured } from "@/lib/groq";

const bodySchema = z.object({
  kind: z.enum(["service-description", "message", "booking-intent"]),
  fields: z.record(z.string(), z.string()).default({}),
  context: z.record(z.string(), z.string()).optional(),
});

// Small in-memory limiter, good enough to stop accidental hammering
const hits = new Map<string, number[]>();
function limited(userId: string) {
  const now = Date.now();
  const recent = (hits.get(userId) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(userId, recent);
  return recent.length > 12;
}

const clip = (value: string | undefined, max = 500) => (value ?? "").slice(0, max);

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (limited(user.id)) {
    return NextResponse.json({ error: "Slow down a little and try again shortly." }, { status: 429 });
  }
  if (!isGroqConfigured()) {
    return NextResponse.json({ error: "AI features are not configured yet." }, { status: 503 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { kind, fields, context } = parsed.data;

  try {
    if (kind === "service-description") {
      const text = await complete({
        system:
          "You write short, friendly service descriptions for appointment booking pages. Use at most 2 sentences and under 280 characters. No emojis, no quotes, no markdown.",
        user: `Business type: ${clip(context?.businessType, 60) || "service business"}\nService name: ${clip(fields.name, 80)}\nDuration: ${clip(fields.durationMinutes, 5)} minutes`,
        maxTokens: 120,
      });
      return NextResponse.json({ text: text.replace(/^["']|["']$/g, "") });
    }

    if (kind === "message") {
      const text = await complete({
        system:
          "You help people write short, polite messages about an appointment. Reply with only the message text, 1 to 3 sentences, no greeting line, no markdown, no emojis. Write in the first person.",
        user: `Sender role: ${user.role}\nAppointment: ${clip(context?.summary, 300)}\nWhat the sender wants to say: ${clip(fields.body, 300) || clip(context?.intent, 200) || "a friendly check-in"}`,
        maxTokens: 160,
      });
      return NextResponse.json({ text });
    }

    // booking-intent: turn a free-text request into structured booking hints
    const raw = await complete({
      system:
        'You map a client request onto a provider\'s services. Reply with JSON only: {"serviceId": string|null, "date": "YYYY-MM-DD"|null, "partOfDay": "morning"|"afternoon"|"evening"|null, "reply": string}. "serviceId" must be one of the provided ids. "reply" is one short friendly sentence. Resolve relative dates using today\'s date.',
      user: `Today: ${clip(context?.today, 10)}\nServices: ${clip(context?.services, 2000)}\nRequest: ${clip(fields.text, 300)}`,
      json: true,
      maxTokens: 200,
    });
    const intent = JSON.parse(raw);
    return NextResponse.json({ intent });
  } catch {
    return NextResponse.json({ error: "The AI assistant could not help right now." }, { status: 502 });
  }
}
