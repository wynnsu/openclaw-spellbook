---
name: magic-quill
description: Generate OpenClaw Spellbook YAML theme mappings from a topic (game/movie/franchise/etc.) or a URL. Use when you need to create or refresh a themed spell mapping file under /spells with broad coverage of popular skills (default top 50), using fetched lore/context when available and heuristic fallbacks when fetches fail.
---

# Magic Quill

A magical quill that inscribes themed spell mappings for OpenClaw Spellbook with high coverage for popular skills.

## Inputs

- `--topic <name>` or `--url <https://...>` (primary inputs; use one for lore fetching)
- Optional `--theme <name>` to override the final theme name (or run heuristic-only mode with just `--theme`)
- Optional `--out <path>` (alias: `--output`) (default: `spells/<theme-slug>.yaml`)
- Optional `--limit <n>` (alias: `--top`) for top-N coverage (default: `50`)
- Optional `--author <name>` (default: `@magic-quill`)

## What To Do

1. Gather popular skills from both sources when possible:
   - `skills.sh` trending installs
   - ClawHub downloads API endpoint
2. Merge and de-duplicate the results into a target set (fill gaps from built-in fallback skills if fetch fails).
3. Gather lore/context:
   - If `--url` is provided, fetch and extract page text first.
   - Else if `--topic` is provided, try Wikipedia summary API.
   - If fetch fails, use built-in theme lexicon/heuristics.
4. Generate spell mappings with broad coverage for the selected top skills.
5. Write YAML to the requested output path (usually under `spells/`).
6. Validate with `npm run validate:spells` if the output file is under `spells/`.

## Commands (Users)

```bash
npm run generate:spellbook-theme -- --theme "Studio Ghibli" --limit 50 --author "@you"
npm run generate:spellbook-theme -- --topic "Cyberpunk 2077" --limit 75 --out spells/cyberpunk-2077.yaml --author "@you"
npm run generate:spellbook-theme -- --url "https://en.wikipedia.org/wiki/The_Lord_of_the_Rings" --limit 50 --author "@you"
```

## Commands (Agents)

```bash
node magic-quill/scripts/generate-spell-mapping.mjs --theme "The Legend of Zelda" --topic "The Legend of Zelda" --limit 50 --out spells/zelda.yaml --author "@example"
node scripts/validate-spells.mjs
```

## Install From This Repo (Subpath)

Use a repo subpath source with `npx skills add`, for example:

```bash
npx skills add wynnsu/openclaw-spellbook/magic-quill
```

Usage after install (example prompt):

```text
Use magic-quill to create a Star Wars spell mapping with top 50 coverage and write it to spells/star-wars.yaml.
```
