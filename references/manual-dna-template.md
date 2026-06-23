# Manual DNA

> Per-manual context document. Read by all pipeline stages.
> Populated by the orchestrator at project creation, updated after outline approval.

## Metadata

**Title:** [Manual title]
**Subtitle:** [Optional subtitle]
**Topic:** [The theological topic, or the equipping theme, this manual addresses]
**Target Audience:** [Who will read this — e.g. new believers, cell group leaders, general congregation]
**Manual Type:** [e.g. equipping, discipleship, topical study, retreat resource]
**Created:** [YYYY-MM-DD]
**Source Material:** [List of source sermon/transcript files used, or "from scratch"]

---

## Product Model

**Model:** [`standalone-lessons` | `progressive`]

- **`standalone-lessons`** — the manual is a collection of self-contained lessons, each on its own
  topic, teachable in any order (the classic *52 Life Lessons* format). No conclusion lesson.
- **`progressive`** — the manual develops ONE topic across lessons that build on each other, ending
  with a Conclusion lesson.

---

## Lesson Configuration

Controls which configurable elements of the lesson template appear in this manual. See
`lesson-template.md` for the full element spec.

| Setting | Value | Notes |
|---------|-------|-------|
| Format mode | [`facilitated` \| `self-study`] | Default `facilitated`. `facilitated` = leader teaches a group (Final Questions + Application/Activation ON). `self-study` = individual reader (both OFF). |
| Application label | [`Application` \| `Activation`] | Heading used for the leader-action block (facilitated mode only) |
| Tithes & Offerings block | [`on` \| `off`] | Default `on`; requires church Stewardship DNA |
| Prayer block | [`on` \| `off`] | Default `on` (skipped per-lesson where redundant) |
| Per-lesson length target | [e.g. 450–800 words teaching] | Excludes scripture/objectives/questions |

> The **Bible Text** anchor verse is always rendered unlabelled (directly under the lesson title);
> there is no "Bible Text" heading in the output.

---

## Theological Angle

Which aspects of the church's theological DNA are most relevant to this topic?
What specific doctrinal lens should this manual apply?

[2–4 sentences describing the theological angle for this specific manual — drawn from
theological-dna.md but focused on the topic.]

---

## Lesson Structure

Populated after outline approval. One row per lesson.

| # | Lesson Title | Core Theme | Bible Text (anchor) |
|---|--------------|-----------|---------------------|
| 1 | [Title] | [What this lesson teaches] | [Anchor verse + reference] |

---

## Voice Notes

Any manual-specific voice guidance beyond the church voice profile.
Leave blank if no additional guidance needed.

[Optional: specific tone adjustments, audience-specific language notes, etc.]

---

## Style Rules

- Scripture translation: [e.g. NKJV unless otherwise noted]
- Spelling convention: [e.g. South African English]
- Per-lesson length target: [e.g. 450–800 words of teaching per lesson]
