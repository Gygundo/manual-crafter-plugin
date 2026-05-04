---
name: outliner
description: "Generate a topic-driven section structure for a training manual. Called by the orchestrator during Stage 1. Reads manual DNA, theological DNA, and topic extract. Not user-invocable directly."
user-invocable: false
allowed-tools: Read, Write, Bash, Grep, Glob
---

# Manual Crafter — Outliner

Stage 1 of the pipeline. Generates a themed section structure for the manual topic. Called by the orchestrator with the project directory path as `$ARGUMENTS`.

## 1. Read Context Documents

Read all of the following:

1. `[project_directory]/manual-dna.md` — topic, audience, angle, any existing section hints
2. `~/Documents/Manuals/.church-profile/theological-dna.md` — church doctrinal positions, emphases, key terms
3. `~/Documents/Manuals/.church-profile/voice-profile.md` — voice profile (for tonal guidance)
4. `[project_directory]/ingested/topic-extract.md` — if exists (extracted teaching content from sources)

## 2. Generate Section Structure

Based on the topic and context, generate 4-8 themed sections that cover the topic comprehensively. Sections should:

- Progress logically (foundation → depth → application)
- Each address a distinct angle on the topic
- Collectively give the reader a complete theological grounding in the topic
- Align with the church's theological emphases from theological-dna.md

**Good section structure principles:**
- Start with "What is X?" or "The foundation of X" — establish before building
- Move through theological depth in the middle sections
- End with application or implications for the believer's life
- Each section title should be a clear, readable phrase (not academic)

## 3. Write outline.md

Write `[project_directory]/outline.md`:

```markdown
# Manual Outline: [Topic]

**Manual:** [Title from manual-dna.md]
**Topic:** [Topic]
**Target Audience:** [Audience from manual-dna.md]
**Sections:** [N]

---

## Section 1: [Title]

**Theme:** [One sentence describing what this section covers]
**Theological angle:** [Which aspect of the church's DNA this section draws on]
**Key scripture(s):** [1-3 scriptures this section will anchor to]
**Estimated length:** [400-600 words]

## Section 2: [Title]

[Same structure]

...

## Conclusion: [Title or "Conclusion"]

**Theme:** [How the manual closes — typically a declaration or call to action]

---

**Outline generated:** [YYYY-MM-DD]
**Source material used:** [Yes — from topic-extract.md / No — from church DNA only]
```

## 4. Present for Approval

The orchestrator handles the approval gate. The outliner's job is only to produce the outline.md file. Report: "Outline complete: [N] sections. Waiting for orchestrator to present for user approval."

## 5. On Approval — Populate Manual DNA Section Structure

When the orchestrator signals approval (it adds `<!-- APPROVED -->` to outline.md), the orchestrator calls the outliner once more with argument `--populate-dna`.

On receiving `--populate-dna`:
1. Read the approved `outline.md`
2. Read `[project_directory]/manual-dna.md`
3. Populate the Section Structure table in manual-dna.md with one row per section
4. Write updated manual-dna.md

Report: "Manual DNA section structure populated."
