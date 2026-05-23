import {
  FINAL_GAME_PROMPT_VERSION,
  SAFETY_POLICY_VERSION,
  mockGenerateGame,
  selectStreamingClient,
  streamGame,
  type StreamEvent
} from "@bordon-ai/ai";
import { GameSpecSchema } from "@bordon-ai/shared";
import {
  categorizeReason,
  dedupe,
  parseFormData,
  randomInput,
  type ParsedInput,
  type RejectionCategory
} from "../../generate/runGenerateAction";
import { parseCacheHitRate, shouldServeCached } from "../../../lib/cacheRoll";
import { hashInput } from "../../../lib/inputHash";
import { findCachedGameByInputHash } from "../../../lib/games";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Outgoing =
  | { type: "partial"; partial: Record<string, unknown> }
  | {
      type: "ok";
      game: unknown;
      promptVersion: string;
      safetyPolicyVersion: string;
      inputHash?: string;
      shortId?: string;
      cached?: boolean;
    }
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

  // Generation cache: for deterministic (non-random) inputs, serve a previously
  // stored game for the same input a configurable fraction of the time, skipping
  // the model call entirely. Random requests always generate fresh.
  const inputHash = isRandom ? null : hashInput(input);
  const cacheRate = parseCacheHitRate(process.env);
  if (inputHash && shouldServeCached(cacheRate)) {
    const cached = await serveCachedGame(inputHash, input, encoder);
    if (cached) return cached;
    // Rolled to serve from cache but nothing is stored for this input yet. Log
    // the miss so cache effectiveness (hits / rolls) is measurable for tuning
    // BORDON_CACHE_HIT_RATE, then fall through to a fresh generation.
    console.log(JSON.stringify({ status: "cache_miss", inputHash, cacheRate }));
  }

  const selection = selectStreamingClient(process.env);

  if (selection.mode === "unavailable") {
    return sseError(selection.reason);
  }

  if (selection.mode === "mock") {
    console.warn("ANTHROPIC_API_KEY not set; streaming a mock game instead of calling Anthropic");
    return mockStream(input, inputHash, encoder);
  }

  const startedAt = Date.now();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of streamGame(input, {
          client: selection.client,
          model: selection.model
        })) {
          controller.enqueue(encoder.encode(sseEncode(translate(event, input, startedAt, inputHash))));
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

function translate(
  event: StreamEvent,
  input: ParsedInput,
  startedAt: number,
  inputHash: string | null
): Outgoing {
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
        cached: false,
        model: process.env.BORDON_GENERATOR_MODEL || "claude-haiku-4-5-20251001"
      })
    );
    return {
      type: "ok",
      game: event.game,
      promptVersion: event.promptVersion,
      safetyPolicyVersion: event.safetyPolicyVersion,
      ...(inputHash ? { inputHash } : {})
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

function mockStream(input: ParsedInput, inputHash: string | null, encoder: TextEncoder): Response {
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
            promptVersion: FINAL_GAME_PROMPT_VERSION,
            safetyPolicyVersion: SAFETY_POLICY_VERSION,
            ...(inputHash ? { inputHash } : {})
          })
        )
      );
      controller.close();
    }
  });
  return new Response(stream, { headers: sseHeaders() });
}

async function serveCachedGame(
  inputHash: string,
  input: ParsedInput,
  encoder: TextEncoder
): Promise<Response | null> {
  let record;
  try {
    record = await findCachedGameByInputHash(inputHash);
  } catch (err) {
    // A cache lookup failure must never break generation — fall through to the model.
    console.error("generate: cache lookup failed", err);
    return null;
  }
  if (!record) return null;

  // Re-validate the stored spec before serving, upholding the invariant that only
  // GameSpecSchema-valid games reach the UI. A bad row is skipped, not served.
  const parsed = GameSpecSchema.safeParse(record.spec);
  if (!parsed.success) return null;

  console.log(
    JSON.stringify({
      status: "ok",
      inputJson: input,
      cached: true,
      shortId: record.shortId,
      promptVersion: FINAL_GAME_PROMPT_VERSION,
      safetyPolicyVersion: SAFETY_POLICY_VERSION,
      streamed: true
    })
  );

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(
          sseEncode({
            type: "ok",
            game: parsed.data,
            promptVersion: FINAL_GAME_PROMPT_VERSION,
            safetyPolicyVersion: SAFETY_POLICY_VERSION,
            shortId: record.shortId,
            cached: true
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
