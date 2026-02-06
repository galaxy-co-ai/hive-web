import { NextResponse } from "next/server";
import { bulkSaveHexes, clearAllHexes, getAllHexes } from "@/lib/kv";
import { hexSchema, Hex } from "@/lib/schemas";

// Engineering constitution hexes embedded directly
// These are the seed data from hive/hexes/*.json
const SEED_HEXES: Hex[] = [
  {
    id: "engineering-constitution",
    name: "Engineering Constitution",
    type: "junction",
    description: "Agent-native routing hub for engineering standards. Query with your current task to get relevant rules.",
    entryHints: ["engineering rules", "engineering standards", "code standards", "how to build", "best practices", "constitution", "coding guidelines", "development rules"],
    tags: ["constitution", "standards", "hub"],
    contents: {
      data: {
        purpose: "Route agents to specific engineering rule domains based on current task",
        usage: "Query with your task intent. Follow edges to relevant domain hexes.",
        globalRules: `## Global Non-Negotiables (Always Applied)

These apply to EVERY file, EVERY component, EVERY commit:

### Code
1. TypeScript strict mode. No \`any\` types. Zod validation on all external data.
2. Every server action returns \`{ success: true, data } | { success: false, error }\`. No exceptions thrown to client.
3. Auth check is the FIRST line of every protected server action and API route.
4. All env vars validated with Zod at startup. Missing var = app doesn't start.

### UI
5. Every interactive element must have: hover state, active/pressed state, focus-visible state, and disabled state.
6. All spacing uses the 4px grid: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128.
7. No orphan styles. Every style belongs to a design token or a component.
8. Mobile-first responsive. Start at 320px, scale up.
9. \`-webkit-font-smoothing: antialiased\` and \`text-rendering: optimizeLegibility\` on body.
10. \`box-sizing: border-box\` globally applied.
11. No dead click areas — expand padding, not margin.
12. \`user-select: none\` on interactive element labels. \`pointer-events: none\` on decorative elements.

### Copy
13. Button labels use verb + noun ("Create project" not "Submit").
14. Error messages follow: what happened + why + what to do next.
15. Never use "successfully" — it's always redundant.
16. Sentence case everywhere. No Title Case except brand names.

### Quality
17. No \`console.log\` in production code. Use structured logging server-side.
18. Every LLM call has \`maxTokens\` set and rate limiting applied.
19. Every webhook verifies signature before processing.`,
      },
    },
    edges: [
      { id: "to-strategy", to: "constitution-strategy-scope", when: { intent: "new product feature scoping planning MVP requirements" }, priority: 10, description: "Strategy, scoping, MVP definition, ship dates" },
      { id: "to-design-system", to: "constitution-design-system", when: { intent: "visual identity tokens colors fonts design system branding" }, priority: 10, description: "Design tokens, fonts, colors, component library choice" },
      { id: "to-ui-foundations", to: "constitution-ui-foundations", when: { intent: "component page layout UI interface building" }, priority: 9, description: "Component patterns, restraint, visual hierarchy" },
      { id: "to-typography", to: "constitution-typography", when: { intent: "typography text fonts headings type scale" }, priority: 8, description: "Type scale, fluid sizing, font settings" },
      { id: "to-interactive", to: "constitution-interactive-elements", when: { intent: "buttons inputs forms links toggles interactive" }, priority: 9, description: "Buttons, inputs, forms, all interactive states" },
      { id: "to-motion", to: "constitution-motion", when: { intent: "animation transition motion hover effects" }, priority: 8, description: "Animation timing, easing, enter/exit patterns" },
      { id: "to-color", to: "constitution-color-system", when: { intent: "color theme dark mode palette tokens" }, priority: 8, description: "Semantic tokens, dark mode, contrast" },
      { id: "to-layout", to: "constitution-layout-spacing", when: { intent: "layout spacing grid responsive breakpoints" }, priority: 8, description: "4px grid, breakpoints, flex/grid patterns" },
      { id: "to-accessibility", to: "constitution-accessibility", when: { intent: "accessibility a11y WCAG screen reader keyboard focus" }, priority: 9, description: "WCAG AA, focus management, ARIA, semantic HTML" },
      { id: "to-performance", to: "constitution-performance", when: { intent: "performance speed optimization loading bundle" }, priority: 8, description: "Core Web Vitals, images, code splitting" },
      { id: "to-code-standards", to: "constitution-code-standards", when: { intent: "code standards TypeScript React naming patterns" }, priority: 9, description: "TypeScript strict, React patterns, file naming" },
      { id: "to-backend", to: "constitution-backend-api", when: { intent: "backend API server action auth rate limiting webhook" }, priority: 9, description: "Server actions, API routes, auth, AI integration" },
      { id: "to-data-layer", to: "constitution-data-layer", when: { intent: "database schema state management caching data" }, priority: 8, description: "Database schemas, state management, caching" },
      { id: "to-copy-voice", to: "constitution-copy-voice", when: { intent: "copy text writing labels errors empty states UX writing" }, priority: 8, description: "Microcopy, error messages, button labels, tone" },
      { id: "to-testing", to: "constitution-testing-qa", when: { intent: "testing tests QA quality assurance pre-launch" }, priority: 8, description: "What to test, pre-launch QA, audits" },
      { id: "to-ops", to: "constitution-ops-ship", when: { intent: "deployment deploy shipping CI CD monitoring logging" }, priority: 8, description: "Deployment, environments, monitoring, git workflow" },
      { id: "to-growth", to: "constitution-growth-launch", when: { intent: "launch SEO analytics landing page growth" }, priority: 8, description: "SEO, analytics, landing pages, launch checklist" },
      { id: "to-project-setup", to: "constitution-project-setup", when: { intent: "new project setup scaffolding initialize dependencies" }, priority: 9, description: "Project scaffolding, dependencies, folder structure" },
    ],
    created: "2026-02-06T07:52:20.451Z",
    updated: "2026-02-06T07:52:20.451Z",
  },
  {
    id: "constitution-interactive-elements",
    name: "Interactive Elements",
    type: "data",
    description: "Engineering constitution rules for interactive elements",
    entryHints: ["buttons", "inputs", "forms", "links", "toggles", "interactive", "click", "tap"],
    tags: ["constitution", "ui", "forms", "interactive"],
    contents: {
      data: {
        rules: `# Interactive Elements

Applied when building buttons, inputs, forms, links, toggles, or any clickable element.

## Universal Rules (ALL interactive elements)
\`\`\`css
.interactive {
  user-select: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: all 150ms ease;
}
\`\`\`

All interactive elements MUST define: Default, Hover, Active/Pressed, Focus-visible, Disabled states.

## BUTTON_SIZES
- sm: height 32px, padding 0 12px, font-size 13px
- md: height 40px, padding 0 16px, font-size 14px
- lg: height 48px, padding 0 24px, font-size 16px
Minimum touch target: 44x44px.

## BUTTON_VARIANTS
- primary: Solid background. ONE per visible screen area.
- secondary: Border/outline only.
- ghost: No background, text-only with hover.
- destructive: Red-toned. Deletions only.

## INPUT_STANDARD
Height 40px, padding 0 12px, border-radius 8px. Font-size 16px (prevents iOS zoom).

## INPUT_FOCUS
Use 2px ring (box-shadow, not border): box-shadow: 0 0 0 2px rgba(primary, 0.5).
NEVER use border changes for focus (causes layout shift).`,
      },
    },
    edges: [
      { id: "back-to-hub", to: "engineering-constitution", when: { always: true }, priority: 1, description: "Return to constitution hub for other domains" },
      { id: "to-related-0", to: "constitution-accessibility", when: { intent: "keyboard focus screen reader ARIA a11y" }, priority: 5, description: "Related: accessibility" },
      { id: "to-related-1", to: "constitution-motion", when: { intent: "animation transition hover easing" }, priority: 5, description: "Related: motion" },
    ],
    created: "2026-02-06T07:52:20.461Z",
    updated: "2026-02-06T07:52:20.461Z",
  },
  {
    id: "constitution-ui-foundations",
    name: "UI Foundations",
    type: "data",
    description: "Engineering constitution rules for ui foundations",
    entryHints: ["UI", "component", "page", "layout", "interface", "checklist"],
    tags: ["constitution", "ui", "components"],
    contents: {
      data: {
        rules: `# UI Foundations

Applied when creating any new component, page, or layout.

## Component Checklist
- [ ] Renders correctly at 320px, 768px, 1024px, 1440px
- [ ] No hardcoded pixel widths on containers
- [ ] Interactive states implemented (hover, active, focus-visible, disabled)
- [ ] Keyboard navigable
- [ ] No layout shift on interaction
- [ ] Loading/skeleton state exists if data-dependent
- [ ] Error state exists if fallible
- [ ] Empty state exists if content can be absent

## REMOVE_BEFORE_ADD
- WHEN: Designing any new UI
- DO: Start with minimum elements. Add only when absence creates confusion.
- NEVER: Add decorative borders, dividers, or backgrounds "to fill space."

## NO_VISUAL_NOISE
- WHEN: Reviewing a completed component
- DO: Ask "can I remove this element and the UI still works?" for every element.
- NEVER: Use borders AND background color AND shadow on the same container. Pick one.

## HIERARCHY_THROUGH_SPACE
- DO: Use whitespace as primary separator. 32px between related groups, 64px+ between sections.
- NEVER: Use <hr> or decorative dividers. Use spacing tokens.

## CARD_STANDARD
- DO: border-radius: 12px, padding: 24px, subtle border (1px solid at 6-8% opacity).
- NEVER: Mix border-radius values across cards on the same page.`,
      },
    },
    edges: [
      { id: "back-to-hub", to: "engineering-constitution", when: { always: true }, priority: 1, description: "Return to constitution hub for other domains" },
      { id: "to-related-0", to: "constitution-interactive-elements", when: { intent: "button input form interactive" }, priority: 5, description: "Related: interactive-elements" },
      { id: "to-related-1", to: "constitution-layout-spacing", when: { intent: "grid spacing responsive breakpoint" }, priority: 5, description: "Related: layout-spacing" },
    ],
    created: "2026-02-06T07:52:20.459Z",
    updated: "2026-02-06T07:52:20.459Z",
  },
  {
    id: "constitution-layout-spacing",
    name: "Layout & Spacing",
    type: "data",
    description: "Engineering constitution rules for layout & spacing",
    entryHints: ["layout", "spacing", "grid", "responsive", "breakpoints", "flex", "gap"],
    tags: ["constitution", "layout", "spacing", "responsive"],
    contents: {
      data: {
        rules: `# Layout & Spacing

Applied when positioning elements, creating layouts, or defining spacing.

## 4px Grid (use these tokens ONLY)
| Token | Value | Use Case |
|-------|-------|----------|
| xs | 4px | Inline icon gaps |
| sm | 8px | Related element gaps |
| md | 12px | Compact card padding |
| base | 16px | Default padding |
| lg | 20px | Component internal padding |
| xl | 24px | Card padding |
| 2xl | 32px | Between related sections |
| 3xl | 40px | Major section breaks |
| 4xl | 48px | Page section padding |
| 5xl | 64px | Hero sections |

## SPACING_PROXIMITY
- DO: Related items get LESS space. Unrelated items get MORE space. Ratio at least 2:1.
- NEVER: Use same spacing everywhere.

## RESPONSIVE_BREAKPOINTS
- sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
- Mobile-first: base styles for 320px, add min-width queries upward.
- NEVER: Use max-width queries.

## FLEX_VS_GRID
- Flex: one-dimensional (nav bars, button groups)
- Grid: two-dimensional (page structure, card grids)
- NEVER: Use float for layout.

## DEAD_ZONES
- DO: Make ENTIRE row/item clickable, not just text. Zero gaps between interactive items.`,
      },
    },
    edges: [
      { id: "back-to-hub", to: "engineering-constitution", when: { always: true }, priority: 1, description: "Return to constitution hub for other domains" },
      { id: "to-related-0", to: "constitution-ui-foundations", when: { intent: "component container card" }, priority: 5, description: "Related: ui-foundations" },
    ],
    created: "2026-02-06T07:52:20.463Z",
    updated: "2026-02-06T07:52:20.463Z",
  },
  {
    id: "constitution-color-system",
    name: "Color System",
    type: "data",
    description: "Engineering constitution rules for color system",
    entryHints: ["color", "theme", "dark mode", "palette", "tokens", "contrast"],
    tags: ["constitution", "color", "design", "theming"],
    contents: {
      data: {
        rules: `# Color System

Applied when choosing colors, implementing themes, or building dark mode.

## Semantic Tokens (USE THESE in components)
\`\`\`css
--color-bg-primary, --color-bg-secondary, --color-bg-tertiary
--color-text-primary, --color-text-secondary, --color-text-tertiary
--color-border-default, --color-border-subtle, --color-border-strong
--color-accent, --color-accent-hover, --color-accent-subtle
--color-success, --color-warning, --color-destructive
\`\`\`

## SEMANTIC_NOT_RAW
- DO: Use semantic tokens (--color-text-primary).
- NEVER: Use raw hex (#1a1a1a) or Tailwind literals (text-gray-500) in components.

## DARK_MODE_NOT_INVERSION
- DO: Design dark mode as separate palette. Warm grays (hsl 220, 10%, 10%), not pure black. Text at 85-90% white.
- NEVER: Use #000000 background or #ffffff text on dark.

## CONTRAST_MINIMUMS
- Normal text (<24px): 4.5:1 ratio
- Large text (≥24px): 3:1 ratio
- UI components: 3:1 ratio

## COLOR_FOR_MEANING
- DO: Always pair color with icon or text label.
- NEVER: Rely solely on color (8% of men are colorblind).`,
      },
    },
    edges: [
      { id: "back-to-hub", to: "engineering-constitution", when: { always: true }, priority: 1, description: "Return to constitution hub for other domains" },
      { id: "to-related-0", to: "constitution-design-system", when: { intent: "tokens visual identity" }, priority: 5, description: "Related: design-system" },
      { id: "to-related-1", to: "constitution-accessibility", when: { intent: "contrast ratio colorblind" }, priority: 5, description: "Related: accessibility" },
    ],
    created: "2026-02-06T07:52:20.462Z",
    updated: "2026-02-06T07:52:20.462Z",
  },
  {
    id: "constitution-motion",
    name: "Motion & Animation",
    type: "data",
    description: "Engineering constitution rules for motion and animation",
    entryHints: ["animation", "transition", "motion", "hover", "easing", "effects"],
    tags: ["constitution", "motion", "animation", "transitions"],
    contents: {
      data: {
        rules: `# Motion & Animation

Applied when adding transitions, animations, or any movement.

## TIMING_SCALE
- instant: 0ms (color changes only)
- fast: 100ms (hover states)
- normal: 150ms (most interactions)
- slow: 200ms (modals, drawers)
- deliberate: 300ms (page transitions)

## EASING
- ease-out: Use for ENTER animations (elements appearing)
- ease-in: Use for EXIT animations (elements leaving)
- ease-in-out: Use for movement between states
- linear: NEVER use for UI (feels robotic)

## HOVER_STATES
\`\`\`css
.button {
  transition: background-color 100ms ease, transform 100ms ease;
}
.button:hover {
  /* subtle scale or color shift */
}
.button:active {
  transform: scale(0.98);
}
\`\`\`

## REDUCE_MOTION
Always wrap animations in prefers-reduced-motion:
\`\`\`css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
\`\`\`

## NO_LAYOUT_SHIFT
- NEVER animate width, height, or margin
- DO animate transform and opacity only`,
      },
    },
    edges: [
      { id: "back-to-hub", to: "engineering-constitution", when: { always: true }, priority: 1, description: "Return to constitution hub for other domains" },
      { id: "to-related-0", to: "constitution-interactive-elements", when: { intent: "button hover state" }, priority: 5, description: "Related: interactive-elements" },
    ],
    created: "2026-02-06T07:52:20.464Z",
    updated: "2026-02-06T07:52:20.464Z",
  },
  {
    id: "constitution-typography",
    name: "Typography",
    type: "data",
    description: "Engineering constitution rules for typography",
    entryHints: ["typography", "text", "fonts", "headings", "type scale", "font size"],
    tags: ["constitution", "typography", "fonts", "text"],
    contents: {
      data: {
        rules: `# Typography

Applied when working with text, headings, or font settings.

## TYPE_SCALE
Use fluid type with clamp():
- body: clamp(16px, 1rem + 0.5vw, 18px)
- small: clamp(13px, 0.8rem + 0.25vw, 14px)
- h1: clamp(32px, 2rem + 2vw, 48px)
- h2: clamp(24px, 1.5rem + 1vw, 32px)
- h3: clamp(20px, 1.25rem + 0.5vw, 24px)

## LINE_HEIGHT
- Headings: 1.2
- Body: 1.5
- Small text: 1.4

## MAX_WIDTH
- Prose: max-width 65ch
- UI text: no max, let container define

## FONT_STACK
\`\`\`css
--font-sans: "Inter", system-ui, sans-serif;
--font-mono: "JetBrains Mono", ui-monospace, monospace;
\`\`\`

## FONT_WEIGHT
- 400: body text
- 500: labels, buttons
- 600: headings, emphasis
- 700: NEVER (too heavy for UI)`,
      },
    },
    edges: [
      { id: "back-to-hub", to: "engineering-constitution", when: { always: true }, priority: 1, description: "Return to constitution hub for other domains" },
      { id: "to-related-0", to: "constitution-accessibility", when: { intent: "readable legibility" }, priority: 5, description: "Related: accessibility" },
    ],
    created: "2026-02-06T07:52:20.465Z",
    updated: "2026-02-06T07:52:20.465Z",
  },
  {
    id: "constitution-accessibility",
    name: "Accessibility",
    type: "data",
    description: "Engineering constitution rules for accessibility",
    entryHints: ["accessibility", "a11y", "WCAG", "screen reader", "keyboard", "focus"],
    tags: ["constitution", "accessibility", "a11y", "wcag"],
    contents: {
      data: {
        rules: `# Accessibility

Applied to every component. These are not optional.

## WCAG_AA_MINIMUM
Target WCAG 2.1 AA compliance for all public interfaces.

## SEMANTIC_HTML
- Use \`<button>\` not \`<div onClick>\`
- Use \`<nav>\`, \`<main>\`, \`<article>\`, \`<aside>\`
- Use heading hierarchy (h1 → h2 → h3)

## FOCUS_VISIBLE
\`\`\`css
:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
:focus:not(:focus-visible) {
  outline: none;
}
\`\`\`

## KEYBOARD_NAV
- All interactive elements reachable via Tab
- Enter/Space activates buttons
- Escape closes modals/dropdowns
- Arrow keys navigate lists

## ARIA_RULES
- aria-label on icon-only buttons
- aria-expanded on toggles/accordions
- aria-live="polite" for async updates
- role="alert" for errors

## SKIP_LINK
Every page needs "Skip to content" as first focusable element.

## IMAGES
- All \`<img>\` have alt text (empty alt="" for decorative)
- Meaningful images: describe content, not appearance`,
      },
    },
    edges: [
      { id: "back-to-hub", to: "engineering-constitution", when: { always: true }, priority: 1, description: "Return to constitution hub for other domains" },
      { id: "to-related-0", to: "constitution-color-system", when: { intent: "contrast colorblind" }, priority: 5, description: "Related: color-system" },
    ],
    created: "2026-02-06T07:52:20.466Z",
    updated: "2026-02-06T07:52:20.466Z",
  },
  {
    id: "constitution-code-standards",
    name: "Code Standards",
    type: "data",
    description: "Engineering constitution rules for code standards",
    entryHints: ["code standards", "TypeScript", "React", "naming", "patterns", "conventions"],
    tags: ["constitution", "code", "typescript", "react"],
    contents: {
      data: {
        rules: `# Code Standards

Applied when writing any code.

## TYPESCRIPT
- strict: true in tsconfig
- No \`any\` - use \`unknown\` and narrow
- Prefer type over interface for props
- Export types from same file as component

## NAMING
- Components: PascalCase
- Functions/hooks: camelCase
- Files: kebab-case.tsx
- Constants: SCREAMING_SNAKE_CASE

## FILE_STRUCTURE
\`\`\`
src/
  components/
    ui/          # Primitives (Button, Input)
    [feature]/   # Feature-specific
  lib/           # Utilities, helpers
  app/           # Next.js routes
\`\`\`

## REACT_PATTERNS
- Composition over props drilling
- Server Components by default
- "use client" only when needed
- No inline functions in JSX (extract to const)

## IMPORTS
- Absolute imports (@/components/...)
- Group: react, next, third-party, local
- No default exports except pages/layouts`,
      },
    },
    edges: [
      { id: "back-to-hub", to: "engineering-constitution", when: { always: true }, priority: 1, description: "Return to constitution hub for other domains" },
      { id: "to-related-0", to: "constitution-testing-qa", when: { intent: "testing linting" }, priority: 5, description: "Related: testing-qa" },
    ],
    created: "2026-02-06T07:52:20.467Z",
    updated: "2026-02-06T07:52:20.467Z",
  },
  {
    id: "constitution-backend-api",
    name: "Backend & API",
    type: "data",
    description: "Engineering constitution rules for backend and API",
    entryHints: ["backend", "API", "server action", "auth", "rate limiting", "webhook"],
    tags: ["constitution", "backend", "api", "server"],
    contents: {
      data: {
        rules: `# Backend & API

Applied when building server actions, API routes, or integrations.

## SERVER_ACTIONS
\`\`\`typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

async function createThing(input: Input): Promise<ActionResult<Thing>> {
  // Auth check FIRST
  const user = await getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Validate with Zod
  const validated = schema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: validated.error.message };
  }

  // Do the thing
  const thing = await db.things.create(validated.data);
  return { success: true, data: thing };
}
\`\`\`

## RATE_LIMITING
- Apply to all public endpoints
- Use sliding window algorithm
- Return 429 with Retry-After header

## WEBHOOKS
- Verify signatures before processing
- Return 200 immediately, process async
- Idempotency keys required

## AI_INTEGRATION
- Always set maxTokens
- Stream responses when possible
- Log token usage for cost tracking`,
      },
    },
    edges: [
      { id: "back-to-hub", to: "engineering-constitution", when: { always: true }, priority: 1, description: "Return to constitution hub for other domains" },
      { id: "to-related-0", to: "constitution-data-layer", when: { intent: "database schema" }, priority: 5, description: "Related: data-layer" },
    ],
    created: "2026-02-06T07:52:20.468Z",
    updated: "2026-02-06T07:52:20.468Z",
  },
  {
    id: "constitution-data-layer",
    name: "Data Layer",
    type: "data",
    description: "Engineering constitution rules for data layer",
    entryHints: ["database", "schema", "state management", "caching", "data", "prisma"],
    tags: ["constitution", "data", "database", "state"],
    contents: {
      data: {
        rules: `# Data Layer

Applied when designing schemas, managing state, or caching.

## PRISMA
- Use Prisma for all database access
- Schema-first development
- Migrations in version control

## SCHEMA_DESIGN
- Soft delete by default (deletedAt timestamp)
- Created/updated timestamps on every table
- Use UUIDs, not auto-increment IDs
- Foreign keys enforced at database level

## STATE_MANAGEMENT
- Server state: React Query / SWR
- Form state: react-hook-form
- Global UI state: Zustand (last resort)
- URL state: searchParams preferred

## CACHING
- Revalidate on mutation, not timer
- Use stale-while-revalidate pattern
- Cache at edge when possible`,
      },
    },
    edges: [
      { id: "back-to-hub", to: "engineering-constitution", when: { always: true }, priority: 1, description: "Return to constitution hub for other domains" },
      { id: "to-related-0", to: "constitution-backend-api", when: { intent: "API server" }, priority: 5, description: "Related: backend-api" },
    ],
    created: "2026-02-06T07:52:20.469Z",
    updated: "2026-02-06T07:52:20.469Z",
  },
  {
    id: "constitution-copy-voice",
    name: "Copy & Voice",
    type: "data",
    description: "Engineering constitution rules for copy and voice",
    entryHints: ["copy", "text", "writing", "labels", "errors", "empty states", "UX writing"],
    tags: ["constitution", "copy", "writing", "ux"],
    contents: {
      data: {
        rules: `# Copy & Voice

Applied when writing any user-facing text.

## BUTTON_LABELS
- Verb + noun: "Create project", "Send message"
- Never: "Submit", "Click here", "OK"
- Destructive: "Delete project" not "Delete"

## ERROR_MESSAGES
Structure: What happened + Why + What to do
- ❌ "Invalid input"
- ✅ "Email format isn't valid. Enter an address like name@example.com"

## EMPTY_STATES
- Explain what this area will show
- Provide action to populate it
- Never just "No data" or "Nothing here"

## LOADING
- Use skeleton, not spinner for content areas
- Show progress for long operations
- "Loading..." only for unpredictable waits

## CONFIRMATION_MESSAGES
- Don't say "successfully" — it's implied
- ❌ "Project created successfully"
- ✅ "Project created"

## CASE
- Sentence case everywhere
- No Title Case except brand names
- ALL CAPS only for destructive warnings`,
      },
    },
    edges: [
      { id: "back-to-hub", to: "engineering-constitution", when: { always: true }, priority: 1, description: "Return to constitution hub for other domains" },
      { id: "to-related-0", to: "constitution-accessibility", when: { intent: "screen reader alt text" }, priority: 5, description: "Related: accessibility" },
    ],
    created: "2026-02-06T07:52:20.470Z",
    updated: "2026-02-06T07:52:20.470Z",
  },
  {
    id: "constitution-testing-qa",
    name: "Testing & QA",
    type: "data",
    description: "Engineering constitution rules for testing and QA",
    entryHints: ["testing", "tests", "QA", "quality assurance", "pre-launch", "audit"],
    tags: ["constitution", "testing", "qa", "quality"],
    contents: {
      data: {
        rules: `# Testing & QA

Applied when writing tests or preparing for launch.

## WHAT_TO_TEST
- Critical user paths (signup, checkout, core feature)
- Edge cases for forms (empty, too long, special chars)
- Error handling (network failure, invalid state)
- Accessibility (keyboard nav, screen reader)

## TEST_TYPES
- Unit: Pure functions, utilities
- Integration: API routes, server actions
- E2E: Critical flows only (Playwright)
- Visual: Component snapshots (optional)

## PRE_LAUNCH_CHECKLIST
- [ ] All critical paths work on mobile
- [ ] Forms validate correctly
- [ ] Loading/error states implemented
- [ ] Lighthouse > 90 on all categories
- [ ] No console errors
- [ ] Analytics tracking verified
- [ ] Error monitoring connected
- [ ] Environment variables set

## ACCESSIBILITY_AUDIT
- [ ] Keyboard navigation complete
- [ ] Screen reader tested
- [ ] Color contrast verified
- [ ] Focus indicators visible`,
      },
    },
    edges: [
      { id: "back-to-hub", to: "engineering-constitution", when: { always: true }, priority: 1, description: "Return to constitution hub for other domains" },
      { id: "to-related-0", to: "constitution-ops-ship", when: { intent: "deploy launch" }, priority: 5, description: "Related: ops-ship" },
    ],
    created: "2026-02-06T07:52:20.471Z",
    updated: "2026-02-06T07:52:20.471Z",
  },
  {
    id: "constitution-ops-ship",
    name: "Ops & Ship",
    type: "data",
    description: "Engineering constitution rules for ops and shipping",
    entryHints: ["deployment", "deploy", "shipping", "CI", "CD", "monitoring", "logging"],
    tags: ["constitution", "ops", "deployment", "ci-cd"],
    contents: {
      data: {
        rules: `# Ops & Ship

Applied when deploying or setting up infrastructure.

## ENVIRONMENTS
- Development: localhost, mock services
- Preview: Vercel preview URLs per PR
- Production: Main branch auto-deploy

## GIT_WORKFLOW
- main is always deployable
- Feature branches for all work
- Squash merge to main
- Conventional commit messages

## MONITORING
- Sentry for error tracking
- Vercel Analytics for Web Vitals
- Custom logging for business events

## LOGGING
\`\`\`typescript
// Use structured logging, not console.log
logger.info("User action", {
  userId,
  action: "createProject",
  projectId
});
\`\`\`

## SECRETS
- All secrets in environment variables
- Never commit secrets (use .env.local)
- Rotate credentials on team changes`,
      },
    },
    edges: [
      { id: "back-to-hub", to: "engineering-constitution", when: { always: true }, priority: 1, description: "Return to constitution hub for other domains" },
      { id: "to-related-0", to: "constitution-testing-qa", when: { intent: "pre-launch checklist" }, priority: 5, description: "Related: testing-qa" },
    ],
    created: "2026-02-06T07:52:20.472Z",
    updated: "2026-02-06T07:52:20.472Z",
  },
  {
    id: "constitution-performance",
    name: "Performance",
    type: "data",
    description: "Engineering constitution rules for performance",
    entryHints: ["performance", "speed", "optimization", "loading", "bundle", "core web vitals"],
    tags: ["constitution", "performance", "optimization"],
    contents: {
      data: {
        rules: `# Performance

Applied when optimizing loading, bundle size, or Core Web Vitals.

## CORE_WEB_VITALS
- LCP: < 2.5s (largest contentful paint)
- FID: < 100ms (first input delay)
- CLS: < 0.1 (cumulative layout shift)

## IMAGES
- Use next/image for all images
- WebP format, responsive sizes
- Lazy load below fold
- Explicit width/height to prevent CLS

## CODE_SPLITTING
- Dynamic imports for heavy components
- Route-based splitting (automatic in Next.js)
- Analyze bundle with @next/bundle-analyzer

## FONTS
- Use next/font for optimization
- Subset to only needed characters
- font-display: swap

## NETWORK
- Prefetch critical resources
- Use stale-while-revalidate
- Compress API responses`,
      },
    },
    edges: [
      { id: "back-to-hub", to: "engineering-constitution", when: { always: true }, priority: 1, description: "Return to constitution hub for other domains" },
      { id: "to-related-0", to: "constitution-testing-qa", when: { intent: "lighthouse audit" }, priority: 5, description: "Related: testing-qa" },
    ],
    created: "2026-02-06T07:52:20.473Z",
    updated: "2026-02-06T07:52:20.473Z",
  },
  {
    id: "constitution-growth-launch",
    name: "Growth & Launch",
    type: "data",
    description: "Engineering constitution rules for growth and launch",
    entryHints: ["launch", "SEO", "analytics", "landing page", "growth", "marketing"],
    tags: ["constitution", "growth", "seo", "launch"],
    contents: {
      data: {
        rules: `# Growth & Launch

Applied when building landing pages or preparing for launch.

## SEO_ESSENTIALS
- Unique title and meta description per page
- Open Graph images for social sharing
- Semantic HTML structure
- sitemap.xml and robots.txt

## META_TAGS
\`\`\`tsx
export const metadata = {
  title: "Page Title | Brand",
  description: "150-160 char description",
  openGraph: {
    title: "Page Title",
    description: "Social description",
    images: [{ url: "/og-image.png" }],
  },
};
\`\`\`

## ANALYTICS
- Set up before launch, not after
- Track: page views, signups, core actions
- Use custom events for business metrics

## LANDING_PAGE
- Hero: Clear value prop, one CTA
- Social proof above fold
- Feature sections with visuals
- FAQ or objection handling
- Footer CTA repeat`,
      },
    },
    edges: [
      { id: "back-to-hub", to: "engineering-constitution", when: { always: true }, priority: 1, description: "Return to constitution hub for other domains" },
      { id: "to-related-0", to: "constitution-performance", when: { intent: "page speed lighthouse" }, priority: 5, description: "Related: performance" },
    ],
    created: "2026-02-06T07:52:20.474Z",
    updated: "2026-02-06T07:52:20.474Z",
  },
  {
    id: "constitution-project-setup",
    name: "Project Setup",
    type: "data",
    description: "Engineering constitution rules for project setup",
    entryHints: ["new project", "setup", "scaffolding", "initialize", "dependencies", "start"],
    tags: ["constitution", "setup", "scaffolding", "init"],
    contents: {
      data: {
        rules: `# Project Setup

Applied when starting a new project.

## STACK
- Next.js 14+ (App Router)
- TypeScript strict mode
- Tailwind CSS + shadcn/ui
- Prisma for database
- pnpm for packages

## INITIAL_SETUP
\`\`\`bash
pnpm create next-app@latest --typescript --tailwind --eslint --app --src-dir
pnpm add zod react-hook-form @hookform/resolvers
npx shadcn-ui@latest init
\`\`\`

## FOLDER_STRUCTURE
\`\`\`
src/
  app/              # Routes
  components/
    ui/             # shadcn components
    [feature]/      # Feature-specific
  lib/              # Utilities
  types/            # Shared types
\`\`\`

## CONFIG_FILES
- tsconfig.json: strict mode, paths
- .env.local: all secrets (gitignored)
- .env.example: template (committed)

## FIRST_COMMITS
1. Initial scaffolding
2. shadcn/ui setup
3. Auth setup
4. Database schema
5. First feature`,
      },
    },
    edges: [
      { id: "back-to-hub", to: "engineering-constitution", when: { always: true }, priority: 1, description: "Return to constitution hub for other domains" },
      { id: "to-related-0", to: "constitution-code-standards", when: { intent: "typescript naming" }, priority: 5, description: "Related: code-standards" },
    ],
    created: "2026-02-06T07:52:20.475Z",
    updated: "2026-02-06T07:52:20.475Z",
  },
  {
    id: "constitution-design-system",
    name: "Design System",
    type: "data",
    description: "Engineering constitution rules for design system",
    entryHints: ["visual identity", "tokens", "colors", "fonts", "design system", "branding"],
    tags: ["constitution", "design", "tokens", "visual"],
    contents: {
      data: {
        rules: `# Design System

Applied when defining visual identity and design tokens.

## TOKENS_FIRST
Define all visual decisions as tokens before using:
- Colors
- Spacing
- Typography
- Shadows
- Border radii
- Transitions

## shadcn/ui
- Use as base component library
- Customize via CSS variables
- Extend, don't modify originals

## COMPONENT_LIBRARY
- Build on primitives
- Document with Storybook (optional)
- Test in isolation before use

## THEMING
- CSS custom properties for all tokens
- Light/dark mode support from start
- System preference detection

## CONSISTENCY
- Same border-radius across all cards
- Same shadow scale (subtle, default, elevated)
- Same spacing tokens (never arbitrary)`,
      },
    },
    edges: [
      { id: "back-to-hub", to: "engineering-constitution", when: { always: true }, priority: 1, description: "Return to constitution hub for other domains" },
      { id: "to-related-0", to: "constitution-color-system", when: { intent: "colors palette theme" }, priority: 5, description: "Related: color-system" },
      { id: "to-related-1", to: "constitution-typography", when: { intent: "fonts type scale" }, priority: 5, description: "Related: typography" },
    ],
    created: "2026-02-06T07:52:20.476Z",
    updated: "2026-02-06T07:52:20.476Z",
  },
  {
    id: "constitution-strategy-scope",
    name: "Strategy & Scope",
    type: "data",
    description: "Engineering constitution rules for strategy and scope",
    entryHints: ["new product", "feature scoping", "planning", "MVP", "requirements"],
    tags: ["constitution", "strategy", "planning", "scope"],
    contents: {
      data: {
        rules: `# Strategy & Scope

Applied when planning features or defining MVP scope.

## MVP_DEFINITION
- What's the smallest thing that solves the core problem?
- Cut features until it feels uncomfortable
- Ship v1, learn, iterate

## SCOPE_CREEP
- Every addition pushes ship date
- "Nice to have" = "Not in v1"
- Track additions explicitly

## FEATURE_SIZING
- Small: 1-2 days
- Medium: 3-5 days
- Large: 1-2 weeks
- Epic: Break it down

## PRIORITIZATION
1. Blockers (can't ship without)
2. Must-haves (core value prop)
3. Should-haves (expected features)
4. Nice-to-haves (v2)

## SHIP_DATES
- Set a date, work backward
- Cut scope, not quality
- Buffer for unknowns (1.5x estimate)`,
      },
    },
    edges: [
      { id: "back-to-hub", to: "engineering-constitution", when: { always: true }, priority: 1, description: "Return to constitution hub for other domains" },
      { id: "to-related-0", to: "constitution-project-setup", when: { intent: "start new project" }, priority: 5, description: "Related: project-setup" },
    ],
    created: "2026-02-06T07:52:20.477Z",
    updated: "2026-02-06T07:52:20.477Z",
  },
];

/**
 * POST /api/seed - Import hexes from embedded seed data
 * Optional: ?clear=true to clear existing data first
 */
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const shouldClear = url.searchParams.get("clear") === "true";

    if (shouldClear) {
      await clearAllHexes();
    }

    // Validate all hexes
    const validatedHexes: Hex[] = [];
    const errors: Array<{ id: string; error: string }> = [];

    for (const hex of SEED_HEXES) {
      const result = hexSchema.safeParse(hex);
      if (result.success) {
        validatedHexes.push(result.data);
      } else {
        errors.push({ id: hex.id, error: result.error.message });
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: "Some hexes failed validation", details: errors },
        { status: 400 }
      );
    }

    await bulkSaveHexes(validatedHexes);

    // Get count after seeding
    const allHexes = await getAllHexes();

    return NextResponse.json({
      success: true,
      data: {
        seeded: validatedHexes.length,
        total: allHexes.length,
        hexIds: validatedHexes.map((h) => h.id),
      },
    });
  } catch (error) {
    console.error("Failed to seed hexes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed hexes" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/seed - Get status of seed data
 */
export async function GET() {
  try {
    const hexes = await getAllHexes();

    return NextResponse.json({
      success: true,
      data: {
        total: hexes.length,
        seedDataCount: SEED_HEXES.length,
        hexIds: hexes.map((h) => h.id),
      },
    });
  } catch (error) {
    console.error("Failed to get seed status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get seed status" },
      { status: 500 }
    );
  }
}
