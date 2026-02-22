---
name: openclaw-spellbook
description: A zero-token-cost thematic wrapper for OpenClaw Agents that transforms technical commands into magical spell experiences. Use to add immersive, gamified themes (like Harry Potter, DnD 5e, Cyberpunk) to your agent. Includes the magic-quill skill for generating new spell mappings from any topic.
---

# OpenClaw Spellbook 🪄

A zero-token-cost, community-driven thematic wrapper for OpenClaw Agents that transforms technical commands into magical spell experiences.

## What It Does

Instead of running boring commands like `deploy-to-vercel`, your agent can cast "Summon to the Cloud Realm" ✨

OpenClaw Spellbook uses hooks to translate:
- **User input**: "Use magic to find the bug" → searches for `search-web` 
- **Agent output**: "Running git-commit" → displays as "📜 Logging into Jedi Archives"

## Included Skills

### magic-quill
Generate themed spell mapping YAML files from any topic (games, movies, franchises).

```bash
# Generate a Harry Potter themed spellbook
npx skills add wynnsu/openclaw-spellbook/magic-quill
node magic-quill/scripts/generate-spell-mapping.mjs --topic "Harry Potter" --limit 50 --out spells/harry-potter.yaml
```

### Pre-built Themes (in /spells)
- Harry Potter spells
- DnD 5e spells
- Supernatural spells
- And more!

## Quick Install

```bash
# Install the full spellbook (hook + skills)
npx skills add wynnsu/openclaw-spellbook

# Or install just the magic-quill skill for generating new themes
npx skills add wynnsu/openclaw-spellbook/magic-quill
```

## How It Works

The spellbook uses OpenClaw hooks to intercept and transform:
1. **Pre-turn**: Fuzzy-match user magical intent → skill IDs
2. **Post-turn**: Mask technical output → themed aliases

No token waste - all translation happens locally!

## Requirements

- OpenClaw agent
- For generated spell themes: Run `magic-quill` skill to create YAML, then add the spellbook hook to use them
