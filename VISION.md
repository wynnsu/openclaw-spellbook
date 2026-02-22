# 🪄 OpenClaw Spellbook: Cast Spells, Not Commands.

**A zero-token-cost, community-driven thematic wrapper for OpenClaw Agents.**

## 🌟 The Vision

OpenClaw Spellbook transforms dry technical commands into immersive themed language through local hooks.

- Agent keeps working with normal technical skills.
- User sees magical/themed aliases in terminal/UI.
- No prompt bloat. No token waste.

## Design Principles

1. **Middleware over prompt engineering**
2. **Open contribution via simple YAML/JSON files**
3. **No strict minimum mapping coverage required**

## Product Shape

- `hooks/spellbook`: lifecycle + translation engine
- `spells/`: community theme registry
- `SPELLS.md`: local generated cache/index for selected theme

## Success Criteria

- Themed aliases work in both input and output directions.
- Themes are swappable without model changes.
- Community can contribute with minimal technical friction.
