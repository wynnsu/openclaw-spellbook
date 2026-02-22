# Spellbook Hook (Scaffold)

This directory is the future home of the OpenClaw hook implementation.

## Planned Hook Events

- `onboard` / `init`
  - Discover themes under `/spells`
  - Show theme coverage leaderboard
  - Let user select a lineage
  - Generate `SPELLS.md` cache

- `agent:before-turn`
  - Fuzzy-match themed user phrases
  - Translate to canonical technical skill IDs

- `agent:after-turn`
  - Map technical action labels to themed aliases
  - Render aliases in user-facing output

## Notes

- Keep transformations local-only (no model token overhead).
- Keep fallback behavior safe and deterministic.
