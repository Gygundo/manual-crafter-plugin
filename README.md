# Manual Crafter

> **Requires:** Claude Code + Node ≥18. Check with `node -v`.

Builds theological **training manuals** from sermon transcripts or from scratch — every lesson
follows the Maldonado teaching structure (Bible Text → Objectives → Introduction → question-driven
teaching → Final Questions → Application, plus optional Tithes & Offerings and Prayer blocks).
Maintains a persistent church theological DNA profile so every manual carries the same doctrinal
identity, teaching voice, and stewardship posture.

Two product models:
- **Standalone lessons** — a collection of self-contained lessons, each its own topic, teachable in
  any order (the *52 Life Lessons* format).
- **Progressive** — one topic developed across building lessons, ending in a conclusion.

The lesson structure lives in `references/lesson-template.md`; quality is enforced by
`references/manual-craft-rules.md` and scored against `references/lesson-rubric.md` by the editor.

## Install

    /plugin marketplace add gygundo/manual-crafter-plugin
    /plugin install manual-crafter@manual-crafter-plugin
    /reload-plugins

## How to run it

    /manual-crafter:orchestrator

Or just ask: *"build a manual on prayer from these sermon transcripts"*

## What this makes

A clean `.docx` file ready for your design team to brand and print — cover, contents, then each
lesson laid out in the training-manual format. The teaching is delivered in full; there is **no
fill-in-the-blank workbook variant**.

Output lands in `~/Documents/Manuals/<manual title>/output/`.

## Build your church DNA first

    /manual-crafter:dna-builder

Point it at a directory of sermon transcripts. It builds a persistent theological
DNA profile that enriches every future manual automatically.

## Licence

MIT. See [LICENSE](./LICENSE).
