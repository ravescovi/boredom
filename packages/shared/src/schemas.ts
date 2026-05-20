import { z } from "zod";

export const GameVisibilitySchema = z.enum(["private", "unlisted", "public"]);
export type GameVisibility = z.infer<typeof GameVisibilitySchema>;

export const PlayerConfigSchema = z
  .object({
    min: z.number().int().min(1),
    max: z.number().int().min(1)
  })
  .refine((value) => value.max >= value.min, {
    message: "Maximum player count must be greater than or equal to minimum player count.",
    path: ["max"]
  });
export type PlayerConfig = z.infer<typeof PlayerConfigSchema>;

export const SafetyPolicySchema = z.object({
  version: z.string().min(1),
  prohibitsDrinkingGames: z.literal(true),
  prohibitsGambling: z.literal(true),
  prohibitsPhysicalRisk: z.literal(true),
  prohibitsIpInfringement: z.literal(true),
  prohibitsCommercialUse: z.literal(true),
  notes: z.array(z.string().min(1)).default([])
});
export type SafetyPolicy = z.infer<typeof SafetyPolicySchema>;

export const GameComponentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(["setup", "rule", "turn", "scoring", "variant", "safety"]),
  safetyReviewed: z.boolean()
});
export type GameComponent = z.infer<typeof GameComponentSchema>;

export const RemixMetadataSchema = z.object({
  sourceGameId: z.string().min(1).optional(),
  sourceVersionId: z.string().min(1).optional(),
  remixedByUserId: z.string().min(1).optional(),
  notes: z.string().optional()
});
export type RemixMetadata = z.infer<typeof RemixMetadataSchema>;

export const GameSpecSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(600),
  playerCount: PlayerConfigSchema,
  durationMinutes: z.number().int().min(1).max(240),
  ageRating: z.string().min(1),
  requiredMaterials: z.array(z.string().min(1)),
  approvedComponents: z.array(GameComponentSchema),
  setup: z.array(z.string().min(1)),
  rules: z.array(z.string().min(1)),
  turnStructure: z.array(z.string().min(1)),
  gameplayLoop: z.array(z.string().min(1)),
  scoring: z.array(z.string().min(1)),
  winCondition: z.string().min(1),
  edgeCases: z.array(z.string().min(1)),
  variants: z.array(z.string().min(1)),
  safetyNotes: z.array(z.string().min(1)),
  commercialUseAllowed: z.literal(false)
});
export type GameSpec = z.infer<typeof GameSpecSchema>;

export const GameVersionSchema = z.object({
  id: z.string().min(1),
  gameId: z.string().min(1),
  versionNumber: z.number().int().min(1),
  spec: GameSpecSchema,
  promptVersion: z.string().min(1),
  safetyPolicyVersion: z.string().min(1),
  createdAt: z.coerce.date()
});
export type GameVersion = z.infer<typeof GameVersionSchema>;
