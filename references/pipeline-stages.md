# Manual Crafter Pipeline Stages

## Overview

```
Stage 0: Ingest     — Extract teaching content + glean theological DNA from transcripts
Stage 1: Outline    — Topic-driven section structure (USER APPROVAL GATE)
Stage 2: Write      — Sections written in pastoral teaching voice (sequential)
Stage 3: Edit       — Voice consistency + theological coherence pass
Stage 4: Format     — Clean .docx output (+ optional workbook variant)
```

## Stage 0 — Ingest (Conditional)

**Runs when:** Source material (sermon transcripts, notes) is present in `sources/`
**Skipped when:** No source material — Claude writes from scratch using church DNA
**Output:** `ingested/topic-extract.md`, `ingested/dna-additions.md`, updates to `~/Documents/Manuals/.church-profile/theological-dna.md`

Ingester reads all files in `sources/`, extracts:
1. Teaching content relevant to the manual topic → `ingested/topic-extract.md`
2. Theological DNA gleaned from the material → `ingested/dna-additions.md` → merged into persistent `theological-dna.md`

## Stage 1 — Outline (Approval Gate)

**Output:** `outline.md` with `<!-- APPROVED -->` marker on approval
**Gate:** NEVER skipped. User must approve before writing begins.

Outliner reads manual-dna.md + theological-dna.md + topic-extract.md (if exists).
Produces 4-8 themed sections covering the topic from different angles.
One-line description per section. Presented to user for approval.
On approval: adds `<!-- APPROVED -->` marker and populates Section Structure table in manual-dna.md.

## Stage 2 — Write (Sequential)

**Output:** `sections/s0N-[title].md` for each section
**Pattern:** Sequential (not parallel) — theological continuity requires each section to be aware of what came before

Writer reads manual-dna.md + theological-dna.md + voice-profile.md + outline.md.
For each section in order: writes 400-600 words of pastoral teaching content.
Each section file includes a metadata block: `<!-- SECTION: N | Title | word_count -->`.

## Stage 3 — Edit

**Output:** `edited/s0N-[title]-final.md` for each section
**Pass:** Single pass covering voice consistency, theological coherence, scripture accuracy, flow

Editor reads all sections + manual-dna.md + theological-dna.md + voice-profile.md.
Produces edited versions in `edited/`. Appends a `<!-- EDIT COMPLETE -->` marker.
Writes `reports/edit-report.md` summarising changes and any theological flags.

## Stage 4 — Format

**Output:** `output/[Manual Title].docx` (+ `output/[Manual Title] — Workbook.docx` if requested)
**Prerequisites:** All `edited/s0N-[title]-final.md` files exist + `manual-dna.md` + `voice-profile.md`

Formatter reads all edited sections and generates a Node.js docx-js script.
Executes the script to produce the final .docx.
If fill-in-the-blank variant requested: produces a second workbook .docx.
