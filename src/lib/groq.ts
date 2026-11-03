import Groq from "groq-sdk";

let client: Groq | null = null;

export function isGroqConfigured() {
  return Boolean(process.env.GROQ_API_KEY);
}

export async function complete({
  system,
  user,
  json = false,
  maxTokens = 400,
}: {
  system: string;
  user: string;
  json?: boolean;
  maxTokens?: number;
}) {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");
  client ??= new Groq({ apiKey: process.env.GROQ_API_KEY });

  const response = await client.chat.completions.create({
    model: process.env.GROQ_MODEL ?? "openai/gpt-oss-120b",
    temperature: json ? 0 : 0.6,
    max_tokens: maxTokens + 800,
    reasoning_effort: "low",
    ...(json ? { response_format: { type: "json_object" as const } } : {}),
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return response.choices[0]?.message?.content?.trim() ?? "";
}
