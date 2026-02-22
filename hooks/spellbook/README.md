# Spellbook Hook (TypeScript Scaffold)

This directory now contains a minimal Node/TypeScript scaffold for the Spellbook hook.

## Exported Functions

- `init(options)`
  - Validates a spell theme object and builds a runtime lookup index.
- `translateBeforeTurn(input, runtime)`
  - Performs exact spell phrase replacement first, then local fuzzy matching metadata as a safe fallback.
- `translateAfterTurn(input, runtime)`
  - Rewrites canonical skill IDs into themed aliases for user-facing output.
- `fuzzyMatch(...)`
  - Small local fuzzy helper used by the before-turn translator.

## Files

- `src/index.ts` - hook API scaffold and translation functions
- `src/fuzzy.ts` - local fuzzy matching helper
- `tsconfig.json` - build config (`npm run build`)

## Notes

- Local-only transformations keep token overhead at zero.
- Fuzzy matches are returned as metadata unless an exact replacement is safe.
