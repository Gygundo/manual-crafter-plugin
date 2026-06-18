---
name: writer
description: "Write a single lesson of a training manual to the full Maldonado lesson template. Called by the orchestrator sequentially for each lesson. Not user-invocable directly."
user-invocable: false
allowed-tools: Read, Write, Bash, Grep, Glob
---

# Manual Crafter — Writer

Stage 2 of the pipeline. Writes one lesson at a time to the full Maldonado training-manual template.
Called by the orchestrator with arguments: `[project_directory] | section: [N] | title: [lesson title]`.

## 1. Parse Arguments

Arguments format: `[project_directory] | section: [N] | title: [lesson title]`

If arguments cannot be parsed into three parts (directory, lesson number, title), report: 'Invalid
arguments. Expected: [project_directory] | section: [N] | title: [lesson title]' and exit.

Extract: `project_directory` (absolute path), `lesson_number` (1-based integer), `lesson_title`.

## 2. Read Context

Read all of the following before writing:

1. `${CLAUDE_PLUGIN_ROOT}/references/lesson-template.md` — **the structure you MUST follow** (element order + markdown contract)
2. `${CLAUDE_PLUGIN_ROOT}/references/manual-craft-rules.md` — the procedural musts (MANUAL-01..14) you must satisfy as you draft
3. `[project_directory]/manual-dna.md` — topic, audience, Product Model, **Lesson Configuration** (Application label, Tithes & Offerings on/off, Prayer on/off, length target)
4. `~/Documents/Manuals/.church-profile/theological-dna.md` — doctrinal positions, key terms, scripture anchors, **Stewardship & Giving Exhortation**, **Teaching & Pedagogical DNA**
5. `~/Documents/Manuals/.church-profile/voice-profile.md` — voice characteristics + default scripture translation
6. `[project_directory]/outline.md` — find this lesson's scaffold (Bible Text anchor, Objectives, sub-questions). Use it.
7. `[project_directory]/ingested/topic-extract.md` — if it exists (source teaching content)
8. Previously written lessons in `[project_directory]/sections/` — for continuity awareness (do NOT create dependencies; every lesson stays self-contained per MANUAL-09)

## 3. Write the Lesson

Follow the **markdown contract in `lesson-template.md` exactly.** Produce every required element in
canonical order, plus the configured-on Tithes & Offerings / Prayer blocks. Use the lesson's outline
scaffold as your spine.

### Voice (per voice-profile.md and MANUAL-10)
- **Direct and declarative** — state truth as settled; no hedging
- **Accessible** — write for a church member, not a seminarian
- **Pastoral** — warm conviction
- **Church voice** — use key terms as defined in theological-dna.md; never use Avoid-list words

### Element-by-element

- **Bible Text** — the anchor verse from the outline, quoted in full, italic blockquote, with
  reference + translation: `> *"…"* — Ref (NKJV)`. Exactly one verse (MANUAL-02).
- **Objectives** — 2–4 verb-led, measurable bullets (MANUAL-03). Use/refine the outline's objectives.
- **Introduction** — open on the reader's felt need addressed to "you"; do NOT open with a definition;
  end pointing at the lesson (MANUAL-04).
- **Teaching Body** — drive it with `###` sub-questions (the questions the reader is asking) and
  numbered points with bold lead-ins (MANUAL-06). Anchor every key claim in scripture (MANUAL-05):

  ```markdown
  ### What is repentance?

  "Repentance" comes from the Greek *metanoia* — a change of mind, heart, and action. When repentance
  is genuine, people change the way they think and act.

  ### What will you experience when you truly repent?

  1. **Sadness over sin.** A genuine grief over having offended God.

  2. **Confession of sin.**

     > *"If we confess our sins, He is faithful and just to forgive us our sins…"* — 1 John 1:9 (NKJV)
  ```

  Build definition → depth → implication. Use teaching from `topic-extract.md` where it fits, but
  synthesise and rewrite — never copy transcript prose verbatim.
- **Final Questions** — 2–4 review questions that map to the Objectives (MANUAL-07).
- **Application / Activation** — leader-facing action steps (MANUAL-08), using the label set in the
  Lesson Configuration. "The leader will guide…", "Pray with each person…", "Lead the group to declare…".
- **Tithes & Offerings** *(only if configured ON)* — one giving scripture + 2–4 sentences of
  exhortation drawn from the church's **Stewardship & Giving Exhortation** DNA, in the church's voice
  (MANUAL-13). If the church has no stewardship DNA, write a brief `<!-- FLAG: no stewardship DNA -->`
  note instead of inventing giving theology, and tell the orchestrator.
- **Prayer** *(only if configured ON, and where it isn't redundant with Application)* — a 40–120 word
  written prayer the leader prays aloud, gathering the lesson into a declaration + request.

### Conclusion lessons (progressive manuals)
If the lesson title begins with `Conclusion:` — keep Bible Text, a short Introduction, and a brief
teaching recap, but introduce NO new doctrine. Name what the reader now possesses and close on a call
to action. Objectives/Final Questions may be lighter or omitted for a conclusion; keep Application.

### Length
Hit the per-lesson teaching target from the Lesson Configuration (default 450–800 words of teaching,
excluding scripture blocks, Objectives, Final Questions, Application, and Prayer). Source manuals keep
lessons to ~2 printed pages. If you reach the point before the target, deepen — never pad (MANUAL-14).

## 4. Write Lesson File

Write to `[project_directory]/sections/s[NN]-[slug]-draft.md` where `NN` is the zero-padded lesson
number and `slug` is the title lower-cased with hyphens.

Follow the full file layout in `lesson-template.md` § Full skeleton. The first line is the lesson
header comment and the last line is the completion marker:

```markdown
<!-- LESSON: [N] | [Title] | [word_count] words -->

# [Lesson Title]

[... all elements per the markdown contract ...]

<!-- LESSON COMPLETE: bible-text present, objectives [N], teaching [N sub-questions], final-questions [N], application [N] -->
```

Report: "Lesson [N] ([title]) written: [word_count] words. Elements: Bible Text, [N] objectives,
[N] sub-questions, [N] final questions, application[, tithes & offerings][, prayer]."
