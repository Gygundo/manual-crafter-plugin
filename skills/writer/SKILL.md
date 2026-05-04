---
name: writer
description: "Write a single section of a training manual in pastoral teaching voice. Called by the orchestrator sequentially for each section. Not user-invocable directly."
user-invocable: false
allowed-tools: Read, Write, Bash, Grep, Glob
---

# Manual Crafter — Writer

Stage 2 of the pipeline. Writes one section at a time in pastoral teaching voice. Called by the orchestrator with arguments: `[project_directory] | section: [N] | title: [section title]`.

## 1. Parse Arguments

Arguments format: `[project_directory] | section: [N] | title: [section title]`

If arguments cannot be parsed into three parts (directory, section number, title), report: 'Invalid arguments. Expected: [project_directory] | section: [N] | title: [section title]' and exit.

Extract:
- `project_directory` — absolute path
- `section_number` — integer (1-based)
- `section_title` — the section title from outline.md

## 2. Read Context

Read all of the following before writing:

1. `[project_directory]/manual-dna.md` — topic, audience, theological angle, section structure
2. `~/Documents/Manuals/.church-profile/theological-dna.md` — church DNA (doctrinal positions, key terms, scripture anchors)
3. `~/Documents/Manuals/.church-profile/voice-profile.md` — voice characteristics
4. `[project_directory]/outline.md` — the full section structure (for continuity awareness)
5. `[project_directory]/ingested/topic-extract.md` — if exists (source teaching content)
6. All previously written sections in `[project_directory]/sections/` — for continuity (do not repeat what was already covered)

## 3. Write the Section

### Voice guidelines for manual writing:

- **Direct and declarative** — state theological truth without hedging
- **Accessible** — no academic language; write for a church member, not a seminary student
- **Scripturally anchored** — every key claim tied to a scripture
- **Pastoral** — warm conviction, not cold exposition
- **Foundational** — assume little prior knowledge on this specific topic
- **Progressive** — each section builds on what came before; do not restate prior sections

### Section structure (adapt to content — not rigid):

```
Opening statement (1-3 sentences establishing the theological anchor for this section)

Teaching content (300-500 words):
  - Doctrinal explanation grounded in scripture
  - Practical implication for the believer
  - 1-3 key principles worth remembering

Scripture block (1-3 core scriptures, italicised, with reference):
  *"Quote"* (Reference)

Closing statement (1-2 sentences tying this section back to the manual's core theme)

[Optional: 3 reflection questions if manual-dna.md requests them]
```

### Content guidelines:

- Use teaching content from `topic-extract.md` where it fits, but synthesise and rewrite — do not copy verbatim from transcripts
- Ground every doctrinal claim in the church's theological DNA
- Use key terms exactly as defined in `theological-dna.md`
- Prefer scripture anchors from `theological-dna.md` where relevant
- Do NOT use fill-in-the-blank blanks in this stage — the formatter handles that

### Length target: 400-600 words (excluding scripture block and reflection questions)

## 4. Write Section File

Write to `[project_directory]/sections/s[NN]-[slug]-draft.md` where:
- `NN` is zero-padded section number (01, 02, etc.)
- `slug` is the section title lower-cased with hyphens (e.g., `the-foundation-of-prayer`)

File format:

```markdown
<!-- SECTION: [N] | [Title] | [word_count] words -->

## [Section Title]

[Section content]

<!-- SECTION COMPLETE -->
```

Report: "Section [N] ([title]) written: [word_count] words."
