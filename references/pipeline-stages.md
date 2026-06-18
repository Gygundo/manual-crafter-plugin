# Manual Crafter Pipeline Stages

## Overview

```
Stage 0: Ingest     — Extract teaching content + glean theological DNA from transcripts
Stage 1: Outline    — Lesson structure scaffolded to the lesson template (USER APPROVAL GATE)
Stage 2: Write      — Each lesson written to the full Maldonado lesson template
Stage 3: Edit       — Enforce manual-craft-rules + score every lesson against the lesson rubric
Stage 4: Format     — Clean .docx output matching the training-manual layout
```

Foundational references (read across stages):
- `references/lesson-template.md` — the structural source of truth (the Maldonado lesson scaffold)
- `references/manual-craft-rules.md` — the procedural musts (MANUAL-01..14)
- `references/lesson-rubric.md` — the scored pedagogy rubric (single source of truth for quality)

## Stage 0 — Ingest (Conditional)

**Runs when:** Source material (sermon transcripts, notes) is present in `sources/`
**Skipped when:** No source material — Claude writes from scratch using church DNA
**Output:** `ingested/topic-extract.md`, `ingested/dna-additions.md`, updates to `~/Documents/Manuals/.church-profile/theological-dna.md`

Ingester reads all files in `sources/`, extracts teaching content relevant to the manual topic and
gleans theological DNA additions (including any Stewardship/Giving and Teaching/Pedagogical DNA).

## Stage 1 — Outline (Approval Gate)

**Output:** `outline.md` with `<!-- APPROVED -->` marker on approval
**Gate:** NEVER skipped. User must approve before writing begins.

Outliner reads manual-dna.md (incl. **Product Model**) + theological-dna.md + lesson-template.md +
topic-extract.md (if exists). It branches on product model:
- **`standalone-lessons`** — a collection of self-contained lessons, each its own topic. No conclusion.
- **`progressive`** — one topic across building lessons, ending with a `## Conclusion:` lesson.

For each lesson it scaffolds the title, core theme, a proposed **Bible Text anchor**, and **Objectives**
hints — the spine the writer will fill. On approval: adds `<!-- APPROVED -->` and populates the Lesson
Structure table in manual-dna.md.

## Stage 2 — Write (Sequential)

**Output:** `sections/s0N-[slug]-draft.md` for each lesson
**Pattern:** Sequential — each lesson reads what came before for continuity, but every lesson must be
self-contained (MANUAL-09).

Writer reads lesson-template.md + manual-craft-rules.md + manual-dna.md + theological-dna.md +
voice-profile.md + outline.md. For each lesson it produces the full Maldonado template: Bible Text,
Objectives, Introduction, question-driven Teaching Body, Final Questions, Application/Activation, and
configured-on Tithes & Offerings / Prayer. Each file carries a `<!-- LESSON: N | Title | word_count -->`
header and a `<!-- LESSON COMPLETE -->` footer.

## Stage 3 — Edit

**Output:** `edited/s0N-[slug]-final.md` for each lesson + `reports/edit-report.md`
**Pass:** Enforce every rule in `manual-craft-rules.md` (auto-revise or flag), then score each lesson
against `lesson-rubric.md` (0–14).

Editor reads all lessons + the three foundational references + manual-dna.md + theological-dna.md +
voice-profile.md. It writes edited versions to `edited/` (each with an `<!-- EDIT COMPLETE -->` marker)
and a report containing per-lesson scorecards and any flags. A lesson **ships** when `lesson_total ≥ 10`
and the hard rules (MANUAL-01, -02, -11) pass. The orchestrator surfaces any lesson below the gate.

## Stage 4 — Format

**Output:** `output/[Manual Title].docx`
**Prerequisites:** All `edited/s0N-[slug]-final.md` files exist + `manual-dna.md`

Formatter reads all edited lessons and runs the docx-js script (`scripts/format-manual.js`) to render
the training-manual layout: cover, table of contents, then each lesson with its labelled sections
(Bible Text, Objectives, Introduction, teaching, Final Questions, Application, Tithes & Offerings,
Prayer). There is **no workbook / fill-in-the-blank variant** — the teaching is delivered in full.
