# CLAUDE.md

This is an OpenClaw hook that self-evolves Skills from successful tool patterns.

## Architecture

- `src/handler.ts` — Main hook entry, handles `tool:result` events
- `src/counter.ts` — Counts successful tool uses (fuzzy match by tool name)
- `src/pattern-store.ts` — Persists pattern registry to `registry.json`
- `src/skill-builder.ts` — Generates `SKILL.md` from pattern metadata
- `src/notifier.ts` — Notifies user after new skill is created
- `src/logger.ts` — Log with rotation
- `src/config.ts` — Loads config from `~/.openclaw/configs/skill-evolution.json`

## Build & Test

```bash
npm install
npm test
npm run build
```
