import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const TYPE_LABELS: Record<string, string> = {
  couples:    "romantic partners getting to know each other more deeply",
  friends:    "close friends getting to know each other better",
  deep:       "anyone who wants a meaningful conversation",
  laughs:     "friends or couples who want something light and funny",
  dreams:     "anyone who wants to talk about goals and aspirations",
  nostalgia:  "anyone reminiscing about their past",
  wyr:        "anyone playing Would You Rather",
  challenges: "friends or couples who want group activities and tasks",
};

const TYPE_FORMAT: Record<string, string> = {
  couples:    "personal questions about the relationship",
  friends:    "questions about life, personality, and connection",
  deep:       "introspective, meaningful questions",
  laughs:     "funny, lighthearted questions",
  dreams:     "questions about goals, aspirations, and the future",
  nostalgia:  "questions about the past, childhood, and memories",
  wyr:        "Would You Rather choices (always start with 'Would you rather')",
  challenges: "tasks or activities to do right now (imperative sentences)",
};

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json() as {
      themeId: string;
      themeName: string;
      count?: number;
      existing?: string[];
    };

    const { themeId, themeName, count = 10, existing = [] } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "API key not configured" }, { status: 500 });
    }

    const client = new Anthropic({ apiKey });

    const existingList = existing.length > 0
      ? `\n\nDo NOT repeat or closely paraphrase any of these existing cards:\n${existing.slice(0, 30).map((t, i) => `${i + 1}. ${t}`).join("\n")}`
      : "";

    const prompt = `Generate exactly ${count} fresh conversation starter cards for the "${themeName}" theme.

Audience: ${TYPE_LABELS[themeId] ?? "anyone"}
Card style: ${TYPE_FORMAT[themeId] ?? "questions or tasks"}

Requirements:
- Each card should feel personal, specific, and interesting — not generic
- Vary the depth and energy: some light, some thoughtful
- Safe and appropriate for all ages (no alcohol, no physical risk, no inappropriate content)
- Short enough to fit on a card — ideally 1–2 sentences max${existingList}

Return ONLY a valid JSON array, no markdown, no explanation:
[
  {"text": "...", "type": "question|task|would-you-rather|scenario"},
  ...
]`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (message.content[0] as { type: string; text: string }).text.trim();

    // Extract JSON array from response (handle any surrounding text)
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) {
      return Response.json({ error: "Invalid response from model" }, { status: 500 });
    }

    const parsed = JSON.parse(match[0]) as Array<{ text: string; type: string }>;
    const cards = parsed
      .filter((c) => c.text && c.type)
      .map((c, i) => ({
        id: `gen-${themeId}-${Date.now()}-${i}`,
        text: c.text.trim(),
        type: c.type as "question" | "task" | "would-you-rather" | "scenario",
      }));

    return Response.json({ cards });
  } catch (err) {
    console.error("/api/cards error:", err);
    return Response.json({ error: "Generation failed" }, { status: 500 });
  }
}
