# Manual Craft Rules

> Voice-agnostic procedural rules enforced on every lesson. Read by the **writer** (as constraints
> while drafting) and the **editor** (as checks during the editing pass). All checks are LLM
> judgment — this plugin deliberately ships no deterministic checker script; the editor is the
> enforcement surface. Each rule has an enforcement mode: **auto-revise** (editor rewrites in place)
> or **flag** (editor records in the edit report for the user).
>
> These rules encode the Maldonado training structure defined in `lesson-template.md`. That file is
> the *what*; this file is the *must*. Keep the two in sync.

## Rule Summary

| ID | Rule | Mode |
|----|------|------|
| MANUAL-01 | All required elements present, in canonical order | auto-revise |
| MANUAL-02 | Exactly one Bible Text anchor verse, full quote + reference + translation | auto-revise |
| MANUAL-03 | Objectives are 2–4 verb-led, measurable learner outcomes | auto-revise |
| MANUAL-04 | Introduction opens on the felt need, not a definition; ends pointing forward | flag → auto-revise if clearly violated |
| MANUAL-05 | Every doctrinal claim in the teaching body is scripture-anchored | flag |
| MANUAL-06 | Teaching body is question-driven and/or numbered, not undifferentiated prose | auto-revise |
| MANUAL-07 | Final Questions map back to the Objectives | flag |
| MANUAL-08 | Application steps are leader-facing and actionable | auto-revise |
| MANUAL-09 | Lesson is self-contained — teaches fully without depending on another lesson | flag |
| MANUAL-10 | Church voice: declarative, no hedging, no academic register, Avoid-list respected | auto-revise |
| MANUAL-11 | No fill-in-the-blanks, no quiz gaps, no blanked words | auto-revise |
| MANUAL-12 | Scripture references plausible and in the church translation; uncertain ones flagged | flag |
| MANUAL-13 | Tithes & Offerings drawn from church stewardship DNA, never foreign boilerplate | flag |
| MANUAL-14 | Lesson length within the configured target range | flag |

## MANUAL-01 — Element Completeness & Order

Every lesson MUST contain, in this order: Lesson Title (`#`), Bible Text, Objectives, Introduction,
Teaching Body, Final Questions, Application/Activation, and — if the manual configures them on —
Tithes & Offerings and Prayer. See `lesson-template.md` § The Canonical Lesson Element Order.

**Failure mode:** A missing required element or an out-of-order element → auto-revise (insert /
reorder). A missing *configurable* element that the manual turned OFF is not a failure.

## MANUAL-02 — Bible Text Discipline

Exactly **one** anchor verse at the top of the lesson, quoted in full, italic, blockquote, with
reference and translation: `> *"…"* — John 3:16 (NKJV)`. Not two verses, not a paraphrase, not a
bare reference.

**Failure mode:** Zero or multiple anchor verses, missing reference, or missing translation →
auto-revise.

## MANUAL-03 — Objectives

**2–4 bullets**, each beginning with a learning verb (Know, Recognise, Identify, Understand, Learn,
Discover). Each must name something observable the learner will know or be able to do. No vague
"appreciate" / "be blessed by" objectives.

**Failure mode:** Fewer than 2 or more than 4; any objective that is not verb-led and measurable →
auto-revise.

## MANUAL-04 — Introduction Opens on the Need

The Introduction must open on the reader's lived reality — a question, ache, confusion, or need —
addressed to "you". It must NOT open with a dictionary definition or a flat doctrinal declaration.
It should end on a forward-pointing sentence that turns toward the lesson.

**Failure mode:** Opens with a definition/declaration → flag; auto-revise if the fix is clear.

## MANUAL-05 — Scripture-Anchored Teaching

Every doctrinal claim in the teaching body must have a scripture nearby (same sub-question block or
numbered point). A teaching paragraph that asserts a theological claim with no verse in its vicinity
is an "orphan claim".

**Failure mode:** Orphan claims → flag with the claim text and a suggested anchor. (Flag rather than
auto-revise, because inserting a verse is a doctrinal act the user should see.)

## MANUAL-06 — Question-Driven Body

The teaching body must be structured with sub-questions (`###`) and/or numbered points — the
Maldonado device. It must NOT be a wall of undifferentiated expository prose with no internal
scaffold. At least one sub-question OR one numbered list is required; most lessons use several.

**Failure mode:** Body with no sub-questions and no numbered structure → auto-revise (impose
question/point structure on the existing content).

## MANUAL-07 — Final Questions Map to Objectives

Each Objective should be testable by at least one Final Question, and each Final Question should
trace to a point actually taught in the lesson. Final Questions are recall/comprehension checks,
not new teaching.

**Failure mode:** An Objective with no corresponding Final Question, or a Final Question that
introduces untaught material → flag.

## MANUAL-08 — Application Is Leader-Facing & Actionable

Application/Activation steps describe what the leader DOES with the group — pray, guide, lead a
declaration, make a call, assign practice. Phrased in the leader's voice ("The leader will…", "Pray
with each person…"). Not a restatement of the teaching; not vague encouragement.

**Failure mode:** Application that merely re-teaches or offers vague encouragement → auto-revise into
concrete leader action steps.

## MANUAL-09 — Self-Containment

Every lesson must teach its topic fully on its own. Even in a progressive single-topic manual, a
lesson must NOT depend on the reader having the previous lesson in hand (no "as we established last
week, …" as a load-bearing premise). Callbacks are fine; load-bearing dependencies are not.

**Failure mode:** A claim that only makes sense if a prior lesson was read → flag.

## MANUAL-10 — Church Voice

The lesson must read in the church's voice (see `voice-profile.md`): declarative, warm, direct. No
hedging ("perhaps", "it might be said"), no academic register (standalone "soteriology",
"eschatology"), and zero words from the voice profile's **Avoid** list. Truth is stated as settled.

**Failure mode:** Hedging, academic register, or any Avoid-list word → auto-revise.

## MANUAL-11 — No Fill-in-the-Blanks

There are NO blanked words, NO `_____` gaps, and NO quiz-style omissions anywhere in a lesson. The
teaching is delivered in full. (This rule is permanent and non-negotiable — the workbook/blank
variant was removed from the plugin.)

**Failure mode:** Any blank or omitted-word gap → auto-revise (restore the full text).

## MANUAL-12 — Scripture Accuracy

Every scripture reference must use a plausible book/chapter/verse format and the church's default
translation (from the voice profile). Verse text is verified against a real translation via the
**scripture verifier** (`scripts/verify-scripture.mjs`, source: API.Bible — see
`references/scripture-verification.md`), which the editor runs in Stage 3. British/SA spelling is
normalised and faithful partial quotes (excerpts) are accepted.

Run it as `node scripts/verify-scripture.mjs "<project_directory>" --translation NKJV`; it writes
`reports/scripture-verification.md`. Fold any `CHECK` result into the edit report's Flags. A quote
tagged for one translation but matching only another (e.g. `(NKJV)` but only the KJV wording) is a
real error — fix the wording or the tag. If no API key is available the verifier skips gracefully;
fall back to flagging uncertain quotations for the user rather than passing them silently.

**Failure mode:** Implausible reference (e.g. John 3:100) → auto-revise the format; a verifier
`CHECK` (wrong words, a clause from another verse, mismatched reference) → flag in the edit report;
unverifiable (no key) → flag.

## MANUAL-13 — Stewardship Authenticity

When the Tithes & Offerings block is ON, its scripture and exhortation must be drawn from the
church's own stewardship DNA (`theological-dna.md` → Stewardship & Giving Exhortation), in the
church's voice. It must never reproduce another ministry's giving boilerplate. If the church has no
stewardship DNA recorded, do NOT invent a giving theology — flag for the user to supply it or turn
the block off.

**Failure mode:** Foreign/generic giving boilerplate, or invented giving theology with no DNA basis
→ flag.

## MANUAL-14 — Length Discipline

Each lesson should fall within the configured per-lesson target (default 450–800 words of teaching,
excluding scripture blocks, Objectives, Final Questions, Application, and Prayer). Source manuals
keep lessons to roughly two printed pages — short enough to teach in one sitting.

**Failure mode:** A lesson more than ~30% over or under target → flag (tighten or deepen, never pad).

## Maintenance

- Changing this file also requires updating `lesson-template.md` (the structural source of truth)
  and, where the rule text is cited, the writer and editor SKILL.md files.
- Keep this file ≤ ~180 lines. Prune ruthlessly.
