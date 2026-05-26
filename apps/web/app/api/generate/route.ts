import { mockGenerateGame, selectStreamingClient, streamGame, type StreamEvent } from "@bordom-ai/ai";
import {
  categorizeReason,
  dedupe,
  parseFormData,
  randomInput,
  type ParsedInput,
  type RejectionCategory
} from "../../generate/runGenerateAction";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Outgoing =
  | { type: "partial"; partial: Record<string, unknown> }
  | { type: "ok"; game: unknown; promptVersion: string; safetyPolicyVersion: string }
  | { type: "rejected"; categories: RejectionCategory[]; promptVersion: string; safetyPolicyVersion: string }
  | { type: "input_error"; fields: Record<string, string> }
  | { type: "error"; message: string };

function sseEncode(payload: Outgoing): string {
  return `event: ${payload.type}\ndata: ${JSON.stringify(payload)}\n\n`;
}

export async function POST(req: Request): Promise<Response> {
  const form = await req.formData();
  const isRandom = form.get("random") === "1";
  const parsed = isRandom ? { ok: true as const, value: randomInput() } : parseFormData(form);

  const encoder = new TextEncoder();

  if (!parsed.ok) {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(sseEncode({ type: "input_error", fields: parsed.fields }))
        );
        controller.close();
      }
    });
    return new Response(stream, { headers: sseHeaders() });
  }

  const input = parsed.value;
  const selection = selectStreamingClient(process.env);

  if (selection.mode === "unavailable") {
    return sseError(selection.reason);
  }

  if (selection.mode === "mock") {
    console.warn("ANTHROPIC_API_KEY not set; streaming a mock game instead of calling Anthropic");
    return mockStream(input, encoder);
  }

  const startedAt = Date.now();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of streamGame(input, {
          client: selection.client,
          model: selection.model
        })) {
          controller.enqueue(encoder.encode(sseEncode(translate(event, input, startedAt))));
          if (event.kind === "ok" || event.kind === "rejected" || event.kind === "error") {
            controller.close();
            return;
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown streaming error";
        controller.enqueue(encoder.encode(sseEncode({ type: "error", message })));
        controller.close();
      }
    }
  });

  return new Response(stream, { headers: sseHeaders() });
}

function translate(event: StreamEvent, input: ParsedInput, startedAt: number): Outgoing {
  if (event.kind === "partial") {
    return { type: "partial", partial: event.partial as Record<string, unknown> };
  }
  if (event.kind === "ok") {
    console.log(
      JSON.stringify({
        status: "ok",
        inputJson: input,
        outputJson: event.game,
        promptVersion: event.promptVersion,
        safetyPolicyVersion: event.safetyPolicyVersion,
        latencyMs: Date.now() - startedAt,
        streamed: true,
        model: process.env.BORDON_GENERATOR_MODEL || "claude-haiku-4-5-20251001"
      })
    );
    return {
      type: "ok",
      game: event.game,
      promptVersion: event.promptVersion,
      safetyPolicyVersion: event.safetyPolicyVersion
    };
  }
  if (event.kind === "rejected") {
    const categories = dedupe(event.reasons.map(categorizeReason));
    console.log(
      JSON.stringify({
        status: "rejected",
        inputJson: input,
        rejectionReasons: event.reasons,
        promptVersion: event.promptVersion,
        safetyPolicyVersion: event.safetyPolicyVersion,
        latencyMs: Date.now() - startedAt,
        streamed: true,
        model: process.env.BORDON_GENERATOR_MODEL || "claude-haiku-4-5-20251001"
      })
    );
    return {
      type: "rejected",
      categories,
      promptVersion: event.promptVersion,
      safetyPolicyVersion: event.safetyPolicyVersion
    };
  }
  console.log(
    JSON.stringify({
      status: "error",
      inputJson: input,
      message: event.message,
      latencyMs: Date.now() - startedAt,
      streamed: true,
      model: process.env.BORDON_GENERATOR_MODEL || "claude-haiku-4-5-20251001"
    })
  );
  return { type: "error", message: event.message };
}

function mockStream(input: ParsedInput, encoder: TextEncoder): Response {
  const game = mockGenerateGame(input);
  const fieldOrder: (keyof typeof game)[] = [
    "title",
    "summary",
    "requiredMaterials",
    "setup",
    "rules",
    "turnStructure",
    "gameplayLoop",
    "scoring",
    "winCondition",
    "edgeCases",
    "variants",
    "safetyNotes"
  ];
  const stream = new ReadableStream({
    async start(controller) {
      const accum: Record<string, unknown> = {};
      for (const field of fieldOrder) {
        accum[field as string] = game[field];
        controller.enqueue(encoder.encode(sseEncode({ type: "partial", partial: { ...accum } })));
        await new Promise((r) => setTimeout(r, 90));
      }
      controller.enqueue(
        encoder.encode(
          sseEncode({
            type: "ok",
            game,
            promptVersion: "final-game-v0.3.0",
            safetyPolicyVersion: "safety-policy-v0.1.0"
          })
        )
      );
      controller.close();
    }
  });
  return new Response(stream, { headers: sseHeaders() });
}

function sseError(message: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(sseEncode({ type: "error", message })));
      controller.close();
    }
  });
  return new Response(stream, { headers: sseHeaders() });
}

function sseHeaders(): HeadersInit {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive"
  };
}
