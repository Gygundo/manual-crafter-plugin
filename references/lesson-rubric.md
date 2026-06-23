---
schema_version: 1
total_range: [0, 14]
components:
  - key: structural_completeness
    label: "Structural Completeness"
    range: [0, 2]
  - key: objective_clarity
    label: "Objective Clarity"
    range: [0, 2]
  - key: scriptural_anchoring
    label: "Scriptural Anchoring"
    range: [0, 2]
  - key: pedagogical_scaffold
    label: "Pedagogical Scaffold"
    range: [0, 2]
  - key: voice_fidelity
    label: "Voice Fidelity"
    range: [0, 2]
  - key: application_strength
    label: "Application Strength"
    range: [0, 2]
  - key: self_containment
    label: "Self-Containment & Accessibility"
    range: [0, 2]
thresholds:
  ship_floor: 10
  hard_rules: [MANUAL-01, MANUAL-02, MANUAL-11]
---

# Lesson Rubric

> Pedagogy scoring for lesson-level quality. 7 components × 0–2 points = **0–14 total**. This is the
> single source of truth for "is this lesson good training material?" The **editor** scores every
> lesson against this rubric and records the scorecard in `reports/edit-report.md`. A lesson ships
> when its total ≥ `ship_floor` (10) **and** the three structural hard rules (MANUAL-01, -02, -11)
> pass. The rubric measures pedagogy; `manual-craft-rules.md` enforces the procedural musts. They
> work together — a lesson can score 12 and still be blocked by a hard-rule failure.

## Components

> **Format mode.** Score against the elements the manual's **Format mode** actually requires. In
> `self-study` mode a lesson has no Final Questions and no Application/Activation — their absence is
> correct and must NOT cost points. Judge only the elements that are configured on.

### Structural Completeness (0–2)
Are all required elements present and in canonical order (per `lesson-template.md`)? Bible Text,
Objectives, Introduction, Teaching Body — plus, **in facilitated mode**, Final Questions and
Application — plus configured-on Tithes & Offerings / Prayer. (In self-study mode, Final
Questions/Application are correctly absent.)
- **2** — every element required by the Format mode present, correctly ordered, correctly formatted.
- **1** — all present but one is thin (e.g. a single objective) or slightly out of order.
- **0** — an element required by the mode is missing. (Also a MANUAL-01 hard-rule failure.)

### Objective Clarity (0–2)
Are the Objectives verb-led and measurable? In facilitated mode, does each also map to a Final
Question?
- **2** — 2–4 sharp, verb-led objectives (facilitated: each testable by a Final Question; self-study:
  each clearly delivered by the teaching body).
- **1** — objectives present but vague, or (facilitated) not all mapped to Final Questions.
- **0** — objectives missing, not verb-led, or unrelated to what the lesson actually teaches.

### Scriptural Anchoring (0–2)
Is the Bible Text well-chosen, and is every key teaching claim anchored in scripture?
- **2** — strong anchor verse; every doctrinal claim has a verse in its block; scripture drives the teaching.
- **1** — anchor present but some teaching claims float without a verse nearby.
- **0** — weak/irrelevant anchor, or teaching is largely assertion without scripture.

### Pedagogical Scaffold (0–2)
Is the body question-driven and/or numbered, and does it build definition → depth → implication?
- **2** — sub-questions and/or numbered points carry the teaching; clear progression; easy to re-teach.
- **1** — some scaffold but stretches of undifferentiated prose, or weak progression.
- **0** — wall of expository prose with no internal scaffold. (Also a MANUAL-06 failure.)

### Voice Fidelity (0–2)
Does it read in the church's voice — declarative, warm, direct — with no hedging, no academic
register, and zero Avoid-list words?
- **2** — unmistakably the church's voice; settled, accessible, no drift.
- **1** — mostly on-voice with minor hedging or one register slip.
- **0** — academic, hedged, generic-AI, or uses Avoid-list vocabulary.

### Application Strength (0–2)
**Facilitated mode:** are the Application/Activation steps leader-facing, concrete, and genuinely
actionable? **Self-study mode:** there is no Application block — score this on how well the lesson
moves the reader from knowing to doing through its closing (the Prayer as a personal response, and/or
a teaching body that lands on lived implication).
- **2** — (facilitated) specific leader action steps that turn the lesson into practice; or
  (self-study) a closing that genuinely calls the reader to live the truth, not just feel it.
- **1** — actionable but generic, or partly a restatement of the teaching.
- **0** — vague encouragement, or just re-teaches with no movement toward practice.

### Self-Containment & Accessibility (0–2)
Does the lesson teach fully on its own, in language a church member (not a seminarian) can follow?
- **2** — complete and accessible standalone; no load-bearing dependency on another lesson.
- **1** — mostly standalone but leans on a prior lesson or drifts briefly into inaccessible language.
- **0** — cannot stand alone, or is pitched over the target audience's head.

## Scoring Aggregation

Each lesson receives a `lesson_total` (0–14) summing the seven components.

| Total | Band | Meaning |
|-------|------|---------|
| 0–6   | Below floor | Revise before shipping |
| 7–9   | Weak | Ships only if no hard-rule failure AND the user accepts |
| 10–12 | Solid | Ships as-is |
| 13–14 | Exemplary | Bestseller-grade training material |

**Ship gate (per lesson):** `lesson_total >= 10` **AND** MANUAL-01, MANUAL-02, MANUAL-11 all pass.
Either failing blocks the lesson — the editor records it and the orchestrator surfaces it to the user.

**Manual gate:** the manual is ready to format when **every** lesson clears its ship gate. The editor
reports any lesson below the gate with its scorecard and the specific components/rules that fell short.

## Scorecard Emit Format

For each lesson, the editor appends a scorecard to `reports/edit-report.md` using this exact shape so
it is easy to scan (column-0 fields, one block per lesson):

```yaml
lesson: [N]
title: [Lesson Title]
lesson_total: [0-14]
structural_completeness: [0-2]
objective_clarity: [0-2]
scriptural_anchoring: [0-2]
pedagogical_scaffold: [0-2]
voice_fidelity: [0-2]
application_strength: [0-2]
self_containment: [0-2]
hard_rules: [pass | fail: MANUAL-NN, ...]
ship: [yes | no]
```

## Maintenance
Keep in sync with `manual-craft-rules.md` (the procedural musts) and `lesson-template.md` (the
structure). Keep ≤ ~140 lines.
