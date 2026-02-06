import { Redis } from "@upstash/redis";
import { Hex, hexSchema } from "./schemas";

// Initialize Redis client from environment variables
// Supports both Vercel KV names and standard Upstash names
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const HEX_PREFIX = "hex:";
const HEX_IDS_KEY = "hex:ids";

/**
 * Get a hex by ID
 */
export async function getHex(id: string): Promise<Hex | null> {
  const data = await redis.get<Hex>(`${HEX_PREFIX}${id}`);
  if (!data) return null;

  // Validate with Zod
  const result = hexSchema.safeParse(data);
  if (!result.success) {
    console.error(`Invalid hex data for ${id}:`, result.error);
    return null;
  }
  return result.data;
}

/**
 * Get all hexes
 */
export async function getAllHexes(): Promise<Hex[]> {
  const ids = await redis.smembers(HEX_IDS_KEY);
  if (!ids.length) return [];

  // Fetch all hexes in parallel
  const hexes = await Promise.all(ids.map((id) => getHex(id)));
  return hexes.filter((h): h is Hex => h !== null);
}

/**
 * Save a hex (create or update)
 */
export async function saveHex(hex: Hex): Promise<void> {
  await Promise.all([
    redis.set(`${HEX_PREFIX}${hex.id}`, hex),
    redis.sadd(HEX_IDS_KEY, hex.id),
  ]);
}

/**
 * Delete a hex
 */
export async function deleteHex(id: string): Promise<boolean> {
  const exists = await redis.exists(`${HEX_PREFIX}${id}`);
  if (!exists) return false;

  await Promise.all([
    redis.del(`${HEX_PREFIX}${id}`),
    redis.srem(HEX_IDS_KEY, id),
  ]);
  return true;
}

/**
 * Check if a hex exists
 */
export async function hexExists(id: string): Promise<boolean> {
  return (await redis.exists(`${HEX_PREFIX}${id}`)) > 0;
}

/**
 * Bulk save hexes (for seeding)
 */
export async function bulkSaveHexes(hexes: Hex[]): Promise<void> {
  if (!hexes.length) return;

  // Use pipeline for efficiency
  const pipeline = redis.pipeline();
  const ids: string[] = [];

  for (const hex of hexes) {
    pipeline.set(`${HEX_PREFIX}${hex.id}`, hex);
    ids.push(hex.id);
  }

  // Add all IDs to the set
  for (const id of ids) {
    pipeline.sadd(HEX_IDS_KEY, id);
  }

  await pipeline.exec();
}

/**
 * Clear all hexes (for testing/reset)
 */
export async function clearAllHexes(): Promise<void> {
  const ids = await redis.smembers(HEX_IDS_KEY);
  if (!ids.length) return;

  const pipeline = redis.pipeline();
  for (const id of ids) {
    pipeline.del(`${HEX_PREFIX}${id}`);
  }
  pipeline.del(HEX_IDS_KEY);

  await pipeline.exec();
}
