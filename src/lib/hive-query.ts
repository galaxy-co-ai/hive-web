import { Hex, QueryResult } from "./schemas";

// ============================================
// CONCEPT MAP — Lightweight synonym expansion
// ============================================

const CONCEPT_MAP: Record<string, string[]> = {
  button: ["interactive", "form", "click", "input", "ui", "element"],
  deploy: ["ship", "ops", "launch", "release", "production", "ci", "cd"],
  database: ["schema", "data", "table", "model", "prisma", "sql"],
  style: ["css", "design", "theme", "color", "token", "tailwind"],
  auth: ["login", "signup", "session", "permission", "security", "authentication"],
  test: ["qa", "quality", "check", "audit", "verify", "testing"],
  api: ["backend", "server", "endpoint", "route", "action", "rest"],
  layout: ["spacing", "grid", "responsive", "breakpoint", "flex", "gap"],
  text: ["typography", "font", "heading", "copy", "writing"],
  image: ["performance", "optimization", "loading", "asset", "media"],
  error: ["handling", "validation", "message", "boundary", "catch"],
  form: ["input", "validation", "field", "submit", "interactive"],
  component: ["ui", "element", "widget", "block", "module"],
  animation: ["motion", "transition", "hover", "easing", "duration"],
  color: ["theme", "palette", "token", "dark", "light", "mode"],
  accessibility: ["a11y", "wcag", "aria", "screen", "reader", "keyboard", "focus"],
  seo: ["search", "meta", "og", "social", "crawl", "sitemap"],
  setup: ["scaffold", "init", "initialize", "new", "project", "start"],
  code: ["typescript", "react", "standards", "patterns", "naming"],
  copy: ["writing", "ux", "microcopy", "label", "message", "voice"],
};

/**
 * Tokenize text into lowercase words (3+ chars)
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/**
 * Expand words with synonyms from the concept map
 */
function expandWithSynonyms(words: string[]): string[] {
  const expanded = new Set(words);

  for (const word of words) {
    // Check if word is a key in concept map
    if (CONCEPT_MAP[word]) {
      for (const synonym of CONCEPT_MAP[word]) {
        expanded.add(synonym);
      }
    }

    // Check if word appears as a value in concept map
    for (const [key, synonyms] of Object.entries(CONCEPT_MAP)) {
      if (synonyms.includes(word)) {
        expanded.add(key);
        for (const synonym of synonyms) {
          expanded.add(synonym);
        }
      }
    }
  }

  return Array.from(expanded);
}

/**
 * Count word overlap between two arrays
 */
function wordOverlap(a: string[], b: string[]): number {
  const setB = new Set(b);
  return a.filter((w) => setB.has(w)).length;
}

/**
 * Query hexes by intent
 */
export function queryHexes(hexes: Hex[], intent: string, limit = 5): QueryResult[] {
  const results: QueryResult[] = [];

  const intentWords = tokenize(intent);
  const expandedIntent = expandWithSynonyms(intentWords);

  for (const hex of hexes) {
    const matchedHints: string[] = [];
    let score = 0;

    // Check entry hints
    for (const hint of hex.entryHints) {
      const hintWords = tokenize(hint);
      const expandedHint = expandWithSynonyms(hintWords);
      const overlap = wordOverlap(expandedIntent, expandedHint);
      if (overlap > 0) {
        matchedHints.push(hint);
        score += overlap;
      }
    }

    // Check name and description
    const nameWords = tokenize(hex.name);
    const expandedName = expandWithSynonyms(nameWords);
    const nameOverlap = wordOverlap(expandedIntent, expandedName);
    score += nameOverlap * 0.5;

    if (hex.description) {
      const descWords = tokenize(hex.description);
      const expandedDesc = expandWithSynonyms(descWords);
      const descOverlap = wordOverlap(expandedIntent, expandedDesc);
      score += descOverlap * 0.3;
    }

    // Check tags
    for (const tag of hex.tags) {
      if (expandedIntent.includes(tag.toLowerCase())) {
        score += 0.5;
      }
    }

    if (score > 0) {
      results.push({ hex, score, matchedHints });
    }
  }

  // Sort by score, return top N
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
