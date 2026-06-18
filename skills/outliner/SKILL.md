---
name: outliner
description: "Generate a lesson structure for a training manual, scaffolded to the Maldonado lesson template. Called by the orchestrator during Stage 1. Reads manual DNA, theological DNA, lesson template, and topic extract. Not user-invocable directly."
user-invocable: false
allowed-tools: Read, Write, Bash, Grep, Glob
---

# Manual Crafter — Outliner

Stage 1 of the pipeline. Generates the lesson structure for the manual and scaffolds each lesson to
the Maldonado lesson template. Called by the orchestrator with the project directory path as `$ARGUMENTS`.

**Mode detection:** If `$ARGUMENTS` contains `--populate-dna`, skip directly to Section 5. Do not
execute Sections 1–4. In this mode, `$ARGUMENTS` has the form `[project_directory] --populate-dna` —
extract the project directory from the first token before the space.

## 1. Read Context Documents

Read all of the following:

1. `[project_directory]/manual-dna.md` — topic, audience, **Product Model**, Lesson Configuration, any section hints
2. `${CLAUDE_PLUGIN_ROOT}/references/lesson-template.md` — the lesson scaffold you are designing toward
3. `~/Documents/Manuals/.church-profile/theological-dna.md` — doctrinal positions, emphases, key terms, scripture anchors
4. `~/Documents/Manuals/.church-profile/voice-profile.md` — voice profile (tonal guidance, default translation)
5. `[project_directory]/ingested/topic-extract.md` — if it exists (extracted teaching content from sources)

Read the **Product Model** from manual-dna.md. It is one of `standalone-lessons` or `progressive`.
Everything in Section 2 branches on it.

## 2. Generate Lesson Structure

### If Product Model is `standalone-lessons`

The manual is a collection of self-contained lessons, each on its own topic (the classic *52 Life
Lessons* format). Generate the requested number of lessons (ask the orchestrator/user if a count was
not given — typical sets are 8, 12, 26, or 52). Each lesson:

- Addresses ONE distinct life/discipleship topic, teachable in any order
- Is fully self-contained — no lesson depends on another
- Carries a clear, inviting title ("Repentance", "Authority Over the Enemy", "What Is the Tithe?")
- **No conclusion lesson** — there is no overarching arc to close.

Spread the lessons across the church's emphases (drawn from theological-dna.md) so the set as a whole
disciples the reader broadly.

### If Product Model is `progressive`

The manual develops ONE topic across 4–8 lessons that build on each other. Lessons should:

- Progress logically (foundation → depth → application)
- Each address a distinct angle on the single topic
- Collectively give the reader a complete grounding in that topic
- Align with the church's theological emphases

**A Conclusion lesson is required** for progressive manuals. It must:
- Introduce no new doctrine — only close the loop on what was taught
- Land as a declaration: this is who you are, this is what is true, this is your inheritance
- End with a clear call to action
- Be titled `## Conclusion: [Memorable short phrase]` (e.g., "Walk in What You Have")

### For every lesson (both models) — scaffold to the template

For each lesson, propose:
- **Title** — clear and inviting
- **Theme** — one sentence: what this lesson teaches
- **Bible Text (anchor)** — the single verse the lesson hangs off (the most direct carrier of the truth)
- **Objectives** — 2–4 verb-led learner outcomes (Know / Recognise / Identify / Understand)
- **Teaching sub-questions** — 3–6 questions the reader is already asking, that the body will answer
- **Theological angle** — which church-DNA emphasis this lesson draws on

This scaffold is the spine the writer fills. Drawing it now keeps every lesson on the template.

## 3. Write outline.md

Write `[project_directory]/outline.md`:

```markdown
# Manual Outline: [Topic or Manual Theme]

**Manual:** [Title from manual-dna.md]
**Product Model:** [standalone-lessons | progressive]
**Target Audience:** [Audience from manual-dna.md]
**Lessons:** [N]

---

## Lesson 1: [Title]

**Theme:** [One sentence — what this lesson teaches]
**Bible Text (anchor):** [Verse reference — e.g. Mark 1:15]
**Objectives:**
- [Verb-led outcome 1]
- [Verb-led outcome 2]
**Teaching sub-questions:** [e.g. What is repentance? · How is it different from remorse? · What should we do after we repent?]
**Theological angle:** [Which church-DNA emphasis this draws on]

## Lesson 2: [Title]

[Same structure]

...

[progressive manuals ONLY — final lesson:]
## Conclusion: [Memorable phrase]

**Theme:** [How the manual closes — a declaration / call to action]
**Bible Text (anchor):** [Verse]

---

**Outline generated:** [YYYY-MM-DD]
**Source material used:** [Yes — from topic-extract.md / No — from church DNA only]
```

## 4. Present for Approval

The orchestrator handles the approval gate. The outliner's job is only to produce outline.md. Report:
"Outline complete: [N] lessons ([product model]). Each scaffolded with Bible Text + Objectives.
Waiting for orchestrator to present for user approval."

## 5. On Approval — Populate Manual DNA Lesson Structure

When the orchestrator signals approval (it adds `<!-- APPROVED -->` to outline.md), it calls the
outliner once more with argument `--populate-dna`.

On receiving `--populate-dna`:
1. Read the approved `outline.md`
2. Read `[project_directory]/manual-dna.md`
3. Populate the **Lesson Structure** table in manual-dna.md with one row per lesson:
   `| # | Lesson Title | Core Theme | Bible Text (anchor) |`
4. Write updated manual-dna.md

Report: "Manual DNA lesson structure populated ([N] lessons)."
