# Manual Crafter

> **Requires:** Claude Code + Node ≥18. Check with `node -v`.

Builds topical theological training manuals from sermon transcripts or from scratch.
Maintains a persistent church theological DNA profile so every manual carries
the same doctrinal identity and voice.

## Install

    /plugin marketplace add gygundo/manual-crafter-plugin
    /plugin install manual-crafter@manual-crafter-plugin
    /reload-plugins

## How to run it

    /manual-crafter:orchestrator

Or just ask: *"build a manual on prayer from these sermon transcripts"*

## What this makes

A clean `.docx` file ready for your design team to brand and print. Optionally
also produces a workbook variant with fill-in-the-blank blanks.

Output lands in `~/Documents/Manuals/<manual title>/output/`.

## Build your church DNA first

    /manual-crafter:dna-builder

Point it at a directory of sermon transcripts. It builds a persistent theological
DNA profile that enriches every future manual automatically.

## Licence

MIT. See [LICENSE](./LICENSE).
