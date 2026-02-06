import { z } from "zod";

// ============================================
// HEX TYPES
// ============================================

export const hexTypeSchema = z.enum(["data", "tool", "gateway", "junction"]);
export type HexType = z.infer<typeof hexTypeSchema>;

export const parameterDefSchema = z.object({
  type: z.enum(["string", "number", "boolean", "object", "array"]),
  description: z.string(),
  required: z.boolean().optional(),
  default: z.unknown().optional(),
});
export type ParameterDef = z.infer<typeof parameterDefSchema>;

export const toolDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.string(), parameterDefSchema),
  handler: z.string(),
});
export type ToolDefinition = z.infer<typeof toolDefinitionSchema>;

export const hexContentsSchema = z.object({
  data: z.unknown().optional(),
  refs: z.array(z.string()).optional(),
  tools: z.array(toolDefinitionSchema).optional(),
});
export type HexContents = z.infer<typeof hexContentsSchema>;

// ============================================
// EDGE TYPES
// ============================================

export const edgeConditionSchema = z.object({
  intent: z.string().optional(),
  hasData: z.array(z.string()).optional(),
  lacks: z.array(z.string()).optional(),
  match: z.record(z.string(), z.unknown()).optional(),
  always: z.boolean().optional(),
});
export type EdgeCondition = z.infer<typeof edgeConditionSchema>;

export const edgeTransformSchema = z.object({
  pick: z.array(z.string()).optional(),
  omit: z.array(z.string()).optional(),
  inject: z.record(z.string(), z.unknown()).optional(),
  rename: z.record(z.string(), z.string()).optional(),
});
export type EdgeTransform = z.infer<typeof edgeTransformSchema>;

export const edgeSchema = z.object({
  id: z.string().min(1),
  to: z.string().min(1),
  when: edgeConditionSchema,
  transform: edgeTransformSchema.optional(),
  priority: z.number().int().min(0).max(100),
  description: z.string(),
});
export type Edge = z.infer<typeof edgeSchema>;

// ============================================
// HEX SCHEMA
// ============================================

export const hexSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "ID must be lowercase alphanumeric with hyphens"),
  name: z.string().min(1).max(100),
  type: hexTypeSchema,
  contents: hexContentsSchema,
  entryHints: z.array(z.string()).min(1),
  edges: z.array(edgeSchema),
  tags: z.array(z.string()),
  description: z.string().optional(),
  created: z.string().datetime(),
  updated: z.string().datetime(),
});
export type Hex = z.infer<typeof hexSchema>;

// Schema for creating a new hex (without timestamps)
export const createHexSchema = hexSchema.omit({
  created: true,
  updated: true,
});
export type CreateHexInput = z.infer<typeof createHexSchema>;

// Schema for updating a hex (partial, without id/timestamps)
export const updateHexSchema = hexSchema
  .omit({ id: true, created: true, updated: true })
  .partial();
export type UpdateHexInput = z.infer<typeof updateHexSchema>;

// ============================================
// QUERY RESULT
// ============================================

export const queryResultSchema = z.object({
  hex: hexSchema,
  score: z.number(),
  matchedHints: z.array(z.string()),
});
export type QueryResult = z.infer<typeof queryResultSchema>;
