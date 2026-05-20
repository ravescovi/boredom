"use client";

export type ErrorCategory =
  | "drinking_or_intoxication"
  | "gambling_or_stakes"
  | "physical_risk"
  | "ip_or_imitation"
  | "schema_mismatch"
  | "other";

type Props = {
  variant: "rejected" | "error";
  categories?: ErrorCategory[];
  message?: string;
  onRetry: () => void;
};

const CATEGORY_LABEL: Record<ErrorCategory, string> = {
  drinking_or_intoxication: "drinking or intoxication",
  gambling_or_stakes: "gambling or financial stakes",
  physical_risk: "physical risk",
  ip_or_imitation: "imitating existing games",
  schema_mismatch: "incomplete game structure",
  other: "another safety concern"
};

export function GenerationErrorView({ variant, categories = [], message, onRetry }: Props) {
  if (variant === "rejected") {
    return (
      <div className="mx-auto max-w-2xl rounded-md border border-[#ffd166] bg-white p-6 text-[#251646] shadow-sm">
        <h2 className="text-2xl font-bold">We couldn&apos;t safely generate that one.</h2>
        <p className="mt-3 text-[#4d3f66]">Try a different vibe, props, or game style.</p>
        {categories.length > 0 && (
          <p className="mt-3 text-sm text-[#4d3f66]">
            Reason: {categories.map((c) => CATEGORY_LABEL[c]).join(", ")}.
          </p>
        )}
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-md bg-[#ff5c8a] px-4 py-2 font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-2xl rounded-md border border-[#ffd166] bg-white p-6 text-[#251646] shadow-sm">
      <h2 className="text-2xl font-bold">Something went wrong on our side.</h2>
      <p className="mt-3 text-[#4d3f66]">{message ?? "Try again in a moment."}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-md bg-[#ff5c8a] px-4 py-2 font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}
