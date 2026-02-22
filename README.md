# 🪄 OpenClaw Spellbook: Cast Spells, Not Commands.

**A zero-token-cost, community-driven thematic wrapper for OpenClaw Agents.**

## 🌟 The Vision

Why run `deploy-to-vercel` when you can cast *Summon*?
Why read `error-handling` logs when you can *Cleanse the Abyssal Corruption*?

**OpenClaw Spellbook** is a Hook-based middleware that transforms the dry, technical vocabulary of AI agents into immersive, gamified experiences.

Whether you want your agent to sound like a Hogwarts Archmage, a Cyberpunk Netrunner, or a Genshin Impact Vision-holder, Spellbook makes it happen — **without wasting a single token.**

---

## 🛠️ Core Tenets

### 1) Zero Token Waste (The Middleware Pattern)

LLM tokens are expensive; local string manipulation is free.

We do **not** stuff the system prompt with huge dictionaries. Instead, hooks do all translation locally:

- **Input phase:** Fuzzy-match user magical intent and translate to standard skill IDs before the model sees it.
- **Output phase:** Intercept standard technical output and render themed aliases in the UI/terminal.

### 2) Meme-Driven Contributions (Low Barrier to Entry)

You don’t need TypeScript skills to contribute a theme.

If you know lore, you can build a Spellbook by adding a simple YAML/JSON file under `/spells`.

### 3) No Coverage Gatekeeping

A Spellbook does **not** need to map all available skills to be useful.

If you map only 5 high-frequency skills (Read, Write, Search, Deploy, Kill), that’s still valid and welcome.

---

## 🏗️ Technical Architecture

### 1) The Engine (`/hooks/spellbook`)

A pair of OpenClaw hooks handling the full lifecycle:

- **`onboard` / `init`**
  - Scan `/spells` registry
  - Show themes with coverage counts
  - Let user choose a lineage
  - Generate local `SPELLS.md` cache/index

- **`agent:before-turn` (Pre-processing)**
  - Lightweight local fuzzy search (e.g. `fuse.js`)
  - Example: "Use the Force to find the bug" → `search-web`

- **`agent:after-turn` (Post-processing)**
  - Mask technical action stream with themed aliases
  - Example: `Executing git-commit` → `📜 Logging into Jedi Archives...`

### 2) The Lore Registry (`/spells`)

Flat directory of YAML/JSON files with a dead-simple schema:

```yaml
theme: "Genshin Impact"
author: "@YourGitHubHandle"
description: "Turn your terminal into a Vision-user interface."
mappings:
  search-web:
    spell: "Elemental Sight"
    icon: "👁️"
  fix-bugs:
    spell: "Cleanse"
    icon: "💧"
```

---

## 🗺️ User Journey

1. **Install**
   ```bash
   openclaw install hook spellbook
   ```
2. **Choose Lore**
   ```text
   🔮 Choose your Magical Lineage:
   ❯ [Game] Genshin Impact (42 skills) - by @Traveler
     [Movie] Harry Potter (15 skills) - by @HogwartsAlumni
     [Sci-Fi] Cyberpunk (8 skills) - by @Netrunner
   ```
3. **Initialize**
   - Generate `SPELLS.md` in workspace root or global config.
4. **Play**
   - User interacts naturally.
   - Agent thinks in technical terms, speaks in magic.

---

## 🤝 Contributing

We want weird, niche, and creative themes.

- **Archmage:** map 50+ skills
- **Novice:** map top 5 skills
- **Comedian:** turn errors into Gordon Ramsay insults

### Steps

1. Fork the repo.
2. Duplicate `spells/templates/basic.yaml`.
3. Add your theme mappings.
4. Open a PR.

---

## 📂 Repository Layout

```text
.
├── .github/workflows/ci.yml
├── hooks/
│   └── spellbook/
│       ├── src/
│       ├── README.md
│       └── tsconfig.json
├── schemas/
│   └── spell.schema.json
├── scripts/
│   └── validate-spells.mjs
├── spells/
│   ├── templates/
│   │   └── basic.yaml
│   └── teyvat.yaml
├── VISION.md
├── package.json
└── README.md
```

---

## 🧪 Local Scripts

```bash
npm install
npm run lint
npm run validate:spells
npm run build
npm run fetch:popular-skills -- --limit 10 --include-hot
npm run generate:spellbook-theme -- --theme "Star Wars" --limit 10 --author "@you"
```

- `lint` runs strict TypeScript checks for the hook scaffold.
- `validate:spells` validates all YAML/JSON files under `/spells` against `schemas/spell.schema.json`.
- `fetch:popular-skills` pulls top skills from:
  - `skills.sh` (trending installs, optional hot movers)
  - ClawHub (`https://clawhub.ai/skills?sort=downloads&nonSuspicious=true`)
- `generate:spellbook-theme` creates a themed YAML mapping under `spells/` by merging popular skills from `skills.sh` + ClawHub and layering lore from a URL/Wikipedia (with heuristic fallback).

CI runs the lint and spell schema checks on every push and pull request.

---

## 🧰 Installable Skill: `spell-mapping-generator`

This repo includes an installable skill subfolder that can be added directly:

```bash
npx skills add wynnsu/openclaw-spellbook/spell-mapping-generator
```

Usage examples:

```bash
npm run generate:spellbook-theme -- --theme "Studio Ghibli" --limit 10 --author "@you"
npm run generate:spellbook-theme -- --topic "Harry Potter" --limit 50 --out spells/harry-potter.yaml --author "@you"
npm run generate:spellbook-theme -- --url "https://en.wikipedia.org/wiki/The_Lord_of_the_Rings" --limit 50
```

---

## 📜 License

MIT
