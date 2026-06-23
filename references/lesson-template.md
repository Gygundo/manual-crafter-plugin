# Lesson Template — The Maldonado Training Structure

> **This is the foundational pedagogical DNA of the plugin.** Every lesson in every manual
> follows this structure. It is read by the outliner (to scaffold), the writer (to fill),
> the editor (to verify), and the formatter (to render). If a change to lesson structure is
> wanted, it changes HERE first, then propagates.
>
> The structure is modelled on the Guillermo Maldonado *52 Life Lessons* training manuals:
> short, self-contained, scripturally saturated teaching units that a lay leader can teach to a
> small group with no prior training. The genius of the format is that **the wisdom is in the
> structure, not the teacher** — the scaffold itself does the discipling.

## Why This Structure (Design Intent)

A training manual is not a book and not a sermon. It is **equipping material**. The reader is
either being taught or about to teach. Every element below exists to serve that:

- **Objectives** tell the learner what they will walk away knowing — measurable, not vague.
- **Introduction** names the felt problem before the answer, so the teaching lands on a real need.
- **Teaching body** is driven by *questions the reader is already asking* and *numbered points
  they can hold onto* — this is how people retain and re-teach.
- **Final Questions** let the learner (or a group) self-check comprehension.
- **Application / Activation** turns knowledge into action — a manual that doesn't change behaviour failed.
- **Scripture on every claim** — the authority is the Word, never the author.

> **No fill-in-the-blanks.** Earlier drafts of this plugin shipped a workbook variant with blanked
> words. That is removed permanently. The teaching is delivered in full, declarative prose — the
> reader receives the truth, not a quiz.

## The Canonical Lesson Element Order

Every lesson is written in this exact order. Elements marked **(required)** appear in every lesson;
**(configurable)** elements are toggled per manual in `manual-dna.md` (Lesson Configuration).

1. **Lesson Title** *(required)*
2. **Bible Text** *(required)* — one anchor verse. **Rendered unlabelled** — the verse appears
   directly beneath the lesson title with no "Bible Text" heading in the output. (The writer still
   emits the `## Bible Text` marker so the structure is parseable; the formatter suppresses the label.)
3. **Objectives** *(required)* — 2–4 learner outcomes
4. **Introduction** *(required)* — frames the felt need, ends pointing at the lesson
5. **Teaching Body** *(required)* — sub-questions + numbered points, every claim scripture-anchored
6. **Final Questions** *(configurable — facilitated mode)* — 2–4 review/discussion questions
7. **Application / Activation** *(configurable — facilitated mode)* — leader-facing action steps
8. **Tithes & Offerings** *(configurable — default ON)* — giving scripture + short exhortation
9. **Prayer** *(configurable — default ON where the topic calls for it)* — a written prayer to pray aloud

### Format mode (facilitated vs self-study)

`manual-dna.md` sets a **Format mode** that controls the two group-facing elements:

- **`facilitated`** *(default)* — the manual is taught by a leader to a group. **Final Questions**
  and **Application/Activation** are BOTH ON.
- **`self-study`** — the manual is read by an individual. **Final Questions** and
  **Application/Activation** are BOTH OFF (a self-study lesson ends after the Teaching Body, then any
  configured-on Tithes & Offerings / Prayer).

Bible Text, Objectives, Introduction, Teaching Body are always present in both modes.

## The Markdown Contract

The writer emits each lesson as markdown following this contract **exactly**, because the formatter
parses it deterministically. Headings carry structural meaning:

- `#` → the **Lesson Title** (the only `#` in the file)
- `##` → a **structural section label** — one of the fixed labels below, in order
- `###` → a **teaching sub-question** in the body (rendered bold, e.g. *"What is repentance?"*)
- `1.` / `2.` → **numbered teaching points** (bold lead-in, then explanation)
- `-` → bullet list (objectives, final questions, application steps, sub-points)
- `> *"…"* — Reference (Translation)` → a **scripture block** (blockquote + italic)

The fixed `##` labels, in order, are exactly:
`Bible Text`, `Objectives`, `Introduction`, `Final Questions`, `Application` (or `Activation`),
`Tithes & Offerings`, `Prayer`. The `## Bible Text` marker is emitted but **not rendered as a
heading** (the verse shows under the title). In **self-study** mode, `Final Questions` and
`Application`/`Activation` are omitted entirely.

**The teaching body has no `##` label.** Everything between the Introduction's content and the next
`##` label (Final Questions in facilitated mode; Tithes & Offerings or Prayer in self-study) is the
teaching body. This mirrors the source manuals, where teaching flows directly out of the introduction.

### Full skeleton

```markdown
<!-- LESSON: [N] | [Title] | [word_count] words -->

# [Lesson Title]

## Bible Text

> *"[Anchor verse, quoted in full]"* — [Reference] ([Translation])

## Objectives

- [Learner outcome 1 — begins with a verb: "Know…", "Recognise…", "Identify…", "Understand…"]
- [Learner outcome 2]
- [Learner outcome 3 — optional]

## Introduction

[1–2 short paragraphs. Name the felt problem or question the reader carries. Speak directly to
"you". End by pointing at what this lesson establishes — e.g. "Today we will learn…".]

### [First teaching sub-question — what the reader is actually asking]

[Answer in short, declarative paragraphs. Anchor the key claim in scripture:]

> *"[Scripture]"* — [Reference] ([Translation])

### [Second teaching sub-question]

[Answer. Where the teaching has discrete components, use numbered points:]

1. **[Bold lead-in phrase].** [Explanation — 1–3 sentences.]

   > *"[Supporting scripture]"* — [Reference] ([Translation])

2. **[Bold lead-in phrase].** [Explanation.]

### [Further sub-questions as the topic requires]

[Continue until the topic is taught. 3–6 sub-questions / point-clusters is typical.]

## Final Questions

- [Review question that tests a core point of the lesson]
- [Review question]
- [Review question — optional]

## Application

- [Leader-facing action step — what the leader does with the group: "The leader will guide…",
  "Pray with each person…", "Lead the group to declare…"]
- [Action step]

## Tithes & Offerings

> *"[Giving / stewardship scripture]"* — [Reference] ([Translation])

[2–4 sentences of giving exhortation in the church's voice — drawn from the church's stewardship
DNA, never generic. This block is configurable; omit it if the manual disables it.]

## Prayer

*"[A written prayer, first-person plural or singular, that the leader can pray aloud over the group
— gathering up the lesson into a declaration and a request. 40–120 words.]"*

<!-- LESSON COMPLETE: bible-text [present], objectives [N], teaching [N sub-questions], final-questions [N], application [N] -->
```

## Element Specifications

### Lesson Title
A clear, readable phrase — concrete and inviting, not academic. Match the source manuals:
"Repentance", "Authority Over the Enemy", "What Is the Tithe?", "The Supernatural Love of God".
Questions and imperatives are welcome ("End Gossip!", "What Does 'to Build' Mean?").

### Bible Text
**Exactly one** anchor verse, quoted in full, italic, with reference and translation. This is the
spine of the lesson — the whole teaching hangs off it. Choose the verse that most directly carries
the lesson's core truth. Use the church's default translation (from the voice profile / theological DNA).

### Objectives
**2–4 bullets**, each beginning with a learning verb (Know, Recognise, Identify, Understand, Learn).
State what the learner will be able to do or know after the lesson — observable, not "appreciate the
beauty of…". These are the measurable spine the Final Questions will test against.

### Introduction
**1–2 short paragraphs.** Open on the reader's lived reality — the question, ache, confusion, or
need the topic answers. Address "you" directly. Do **not** open with a definition or a doctrinal
declaration; open with the human situation, then turn toward the teaching. Land the introduction on
a forward-pointing sentence ("Today we will learn what true repentance is and what it produces.").

### Teaching Body
The core. Built from two devices, used together:

- **Sub-questions (`###`)** — phrase the heading as the question the reader is already asking:
  "What is repentance?", "What is the difference between repentance and remorse?", "Why did Jesus
  begin by preaching repentance?". Answer in short, declarative paragraphs.
- **Numbered points** — when a claim has discrete components (stages, types, reasons, consequences),
  enumerate them with a **bold lead-in** then a short explanation, each anchored in scripture where
  possible: "1. **Authority by obedience.** This authority is received through…".

Rules for the body:
- **Every key claim is anchored in scripture.** A teaching paragraph that makes a doctrinal claim
  without a verse nearby is incomplete.
- **Accessible, declarative voice** — write for a church member, not a seminary student. State truth
  as settled, in the church's voice (see voice profile). No hedging.
- **Progressive within the lesson** — build from definition → depth → implication.
- **Self-contained** — the lesson must teach fully on its own; assume no other lesson has been read
  (even in a progressive manual, never depend on the reader having the prior lesson in hand).

### Final Questions
**2–4 review questions** that map back to the Objectives. These are recall/comprehension checks a
leader asks the group, or a reader asks themselves. Phrase them plainly: "What is repentance and
what is remorse?", "Why did Jesus emphasise repentance?".

### Application / Activation
**Leader-facing action steps.** This is what the leader *does* with the group after teaching —
pray, guide reflection, lead a declaration, make a call to salvation, give a practical assignment.
Phrase in the leader's voice: "The leader will guide each person to…", "Pray with them for…",
"Lead the group to renounce…". Use the label **Application** by default, or **Activation** if the
manual configures that term (set in `manual-dna.md`).

### Tithes & Offerings *(configurable, default ON)*
A recurring closing block: one giving/stewardship scripture, then 2–4 sentences of exhortation in
the church's voice. The exhortation MUST be drawn from the church's stewardship DNA
(`theological-dna.md` → Stewardship & Giving Exhortation) — never generic boilerplate from another
ministry. If the church has no stewardship DNA recorded and the manual leaves this block ON, the
editor flags it for the user rather than inventing a giving theology. Omit entirely if the manual
disables this block.

### Prayer *(configurable, default ON where the topic calls for it)*
A short written prayer (40–120 words) the leader prays aloud over the group, gathering the lesson
into a declaration + request. First person ("Father, we come…" or "Father, I come…"). Skip for
lessons where a closing prayer would be redundant with the Application step.

## Conclusion Lessons (Progressive Manuals Only)

In a **progressive single-topic** manual, the final lesson is a **Conclusion** (titled
`## Conclusion: [memorable phrase]` in the outline). A conclusion lesson is a variation on the
template: it keeps Bible Text, Introduction, and a short teaching recap, but introduces **no new
doctrine** — it closes the loop, names what the reader now possesses, and lands on a call to action.
In a **standalone-lesson collection**, there is no conclusion lesson; each lesson is its own
self-contained unit.

## What Carries Through (The Training Guarantee)

Every stage reads this file so the training character cannot be lost:
- the **outliner** scaffolds each lesson's Bible Text + Objectives from here,
- the **writer** fills the full template from here,
- the **editor** verifies presence and order of every required element against this contract and the
  `manual-craft-rules.md`, and scores pedagogy against `lesson-rubric.md`,
- the **formatter** renders the markdown contract to `.docx` matching the source-manual layout.
