import { fuzzyMatch } from "./fuzzy";

export type CanonicalSkillId = string;

export interface SpellMapping {
  spell: string;
  icon?: string;
}

export interface SpellTheme {
  theme: string;
  author: string;
  description: string;
  mappings: Record<CanonicalSkillId, SpellMapping>;
}

export interface SpellbookRuntime {
  theme: SpellTheme;
  fuzzyThreshold: number;
  entries: Array<{
    canonicalSkillId: CanonicalSkillId;
    spell: string;
    icon?: string;
  }>;
}

export interface InitOptions {
  theme: SpellTheme;
  fuzzyThreshold?: number;
}

export interface BeforeTurnTranslation {
  text: string;
  mode: "none" | "exact" | "fuzzy";
  canonicalSkillId?: CanonicalSkillId;
  matchedSpell?: string;
  confidence?: number;
}

export interface AfterTurnTranslation {
  text: string;
  replacements: number;
}

function assertNonEmptyString(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Invalid spell theme: ${label} must be a non-empty string`);
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceInsensitive(input: string, search: string, replacement: string): { text: string; replacements: number } {
  const pattern = new RegExp(escapeRegExp(search), "gi");
  let replacements = 0;
  const text = input.replace(pattern, () => {
    replacements += 1;
    return replacement;
  });

  return { text, replacements };
}

export function init(options: InitOptions): SpellbookRuntime {
  const { theme, fuzzyThreshold = 0.72 } = options;

  assertNonEmptyString(theme.theme, "theme");
  assertNonEmptyString(theme.author, "author");
  assertNonEmptyString(theme.description, "description");

  if (!theme.mappings || typeof theme.mappings !== "object") {
    throw new Error("Invalid spell theme: mappings must be an object");
  }

  const entries = Object.entries(theme.mappings)
    .map(([canonicalSkillId, mapping]) => {
      assertNonEmptyString(canonicalSkillId, "mappings key");
      assertNonEmptyString(mapping?.spell, `mappings.${canonicalSkillId}.spell`);
      if (mapping?.icon !== undefined) {
        assertNonEmptyString(mapping.icon, `mappings.${canonicalSkillId}.icon`);
      }

      return {
        canonicalSkillId,
        spell: mapping.spell.trim(),
        icon: mapping.icon?.trim()
      };
    })
    .sort((a, b) => b.spell.length - a.spell.length);

  if (entries.length === 0) {
    throw new Error("Invalid spell theme: mappings must contain at least one entry");
  }

  return {
    theme,
    fuzzyThreshold,
    entries
  };
}

export function translateBeforeTurn(input: string, runtime: SpellbookRuntime): BeforeTurnTranslation {
  if (input.trim() === "") {
    return { text: input, mode: "none" };
  }

  for (const entry of runtime.entries) {
    const exact = replaceInsensitive(input, entry.spell, entry.canonicalSkillId);
    if (exact.replacements > 0) {
      return {
        text: exact.text,
        mode: "exact",
        canonicalSkillId: entry.canonicalSkillId,
        matchedSpell: entry.spell,
        confidence: 1
      };
    }
  }

  const match = fuzzyMatch(
    input,
    runtime.entries.map((entry) => ({
      value: entry.spell,
      metadata: entry
    })),
    runtime.fuzzyThreshold
  );

  if (!match) {
    return { text: input, mode: "none" };
  }

  // Fuzzy matches are surfaced as metadata only; callers can decide how aggressively to rewrite input.
  return {
    text: input,
    mode: "fuzzy",
    canonicalSkillId: match.candidate.metadata.canonicalSkillId,
    matchedSpell: match.candidate.metadata.spell,
    confidence: Number(match.score.toFixed(3))
  };
}

export function translateAfterTurn(input: string, runtime: SpellbookRuntime): AfterTurnTranslation {
  let text = input;
  let replacements = 0;

  for (const entry of runtime.entries) {
    const displayName = entry.icon ? `${entry.icon} ${entry.spell}` : entry.spell;
    const pattern = new RegExp(
      `(^|[^A-Za-z0-9_-])(${escapeRegExp(entry.canonicalSkillId)})(?=$|[^A-Za-z0-9_-])`,
      "g"
    );

    text = text.replace(pattern, (_match, prefix: string) => {
      replacements += 1;
      return `${prefix}${displayName}`;
    });
  }

  return { text, replacements };
}

export { fuzzyMatch } from "./fuzzy";
