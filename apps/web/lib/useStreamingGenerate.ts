"use client";

import type { GameSpec } from "@bordom-ai/shared";
import { useCallback, useRef, useState } from "react";

export type RejectionCategory =
  | "drinking_or_intoxication"
  | "gambling_or_stakes"
  | "physical_risk"
  | "ip_or_imitation"
  | "schema_mismatch"
  | "other";

export type StreamingState =
  | { status: "idle" }
  | { status: "streaming"; partial: Partial<GameSpec> }
  | {
      status: "ok";
      game: GameSpec;
      promptVersion: string;
      safetyPolicyVersion: string;
    }
  | {
      status: "rejected";
      categories: RejectionCategory[];
      promptVersion: string;
      safetyPolicyVersion: string;
    }
  | { status: "input_error"; fields: Record<string, string> }
  | { status: "error"; message: string };

type ServerEvent =
  | { type: "partial"; partial: Partial<GameSpec> }
  | { type: "ok"; game: GameSpec; promptVersion: string; safetyPolicyVersion: string }
  | {
      type: "rejected";
      categories: RejectionCategory[];
      promptVersion: string;
      safetyPolicyVersion: string;
    }
  | { type: "input_error"; fields: Record<string, string> }
  | { type: "error"; message: string };

const initialState: StreamingState = { status: "idle" };

export function useStreamingGenerate() {
  const [state, setState] = useState<StreamingState>(initialState);
  const abortRef = useRef<AbortController | null>(null);

  const submit = useCallback(async (formData: FormData) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ status: "streaming", partial: {} });

    let res: Response;
    try {
      res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
        signal: controller.signal
      });
    } catch (err) {
      if ((err as { name?: string }).name !== "AbortError") {
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Network error"
        });
      }
      return;
    }

    if (!res.ok || !res.body) {
      setState({ status: "error", message: `Server returned ${res.status}` });
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let eventEnd = buffer.indexOf("\n\n");
        while (eventEnd !== -1) {
          const rawEvent = buffer.slice(0, eventEnd);
          buffer = buffer.slice(eventEnd + 2);
          handleRawEvent(rawEvent, setState);
          eventEnd = buffer.indexOf("\n\n");
        }
      }
    } catch (err) {
      if ((err as { name?: string }).name !== "AbortError") {
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Stream error"
        });
      }
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(initialState);
  }, []);

  return { state, submit, reset };
}

function handleRawEvent(raw: string, setState: (s: StreamingState) => void) {
  const dataLine = raw.split("\n").find((l) => l.startsWith("data:"));
  if (!dataLine) return;
  const json = dataLine.slice(5).trimStart();
  let parsed: ServerEvent;
  try {
    parsed = JSON.parse(json) as ServerEvent;
  } catch {
    return;
  }
  switch (parsed.type) {
    case "partial":
      setState({ status: "streaming", partial: parsed.partial });
      return;
    case "ok":
      setState({
        status: "ok",
        game: parsed.game,
        promptVersion: parsed.promptVersion,
        safetyPolicyVersion: parsed.safetyPolicyVersion
      });
      return;
    case "rejected":
      setState({
        status: "rejected",
        categories: parsed.categories,
        promptVersion: parsed.promptVersion,
        safetyPolicyVersion: parsed.safetyPolicyVersion
      });
      return;
    case "input_error":
      setState({ status: "input_error", fields: parsed.fields });
      return;
    case "error":
      setState({ status: "error", message: parsed.message });
      return;
  }
}
