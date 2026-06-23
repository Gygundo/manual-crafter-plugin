---
name: orchestrator
description: "Master pipeline controller for building topical theological training manuals. Use when the user wants to build a manual, create training material from sermons, check manual project status, resume an interrupted manual project, or update the church theological DNA. Triggers on: 'build a manual', 'create a manual', 'training manual', 'manual from sermons', 'manual status', 'resume manual', 'update church DNA', 'ingest sermons', 'manual crafter'."
allowed-tools: Read, Write, Bash, Grep, Glob, Agent
---

# Manual Crafter Orchestrator

Master pipeline controller for the manual-crafter plugin. Manages the full lifecycle: creating
projects, detecting pipeline state, chaining stages, and displaying progress. Every manual is built
as a set of **lessons** following the Maldonado training-manual structure
(`${CLAUDE_PLUGIN_ROOT}/references/lesson-template.md`).

## 1. Pipeline Overview

```
Stage 0: Ingest    (conditional — skipped if no source material)
Stage 1: Outline   (USER APPROVAL GATE — never skipped)
Stage 2: Write     (sequential lesson writing, full lesson template)
Stage 3: Edit      (enforce manual-craft-rules + score every lesson against lesson-rubric)
Stage 4: Format    (.docx output — no workbook variant)
```

Foundational references the stages read: `references/lesson-template.md` (structure),
`references/manual-craft-rules.md` (procedural musts), `references/lesson-rubric.md` (quality scoring).

## 2. On Trigger — Detect Mode

**DNA Only mode:** "update my DNA", "ingest sermons", "build my DNA profile", "update church DNA" →
DNA Only mode (Section 7, Mode 4).

**Status mode:** "manual status", "where am I", "show progress" → Status mode (Section 7, Mode 5).

**Otherwise:** Detect or create a project (Section 3).

## 3. Project Detection or Creation

### Check for existing projects

```bash
ls -1 ~/Documents/Manuals/ 2>/dev/null | grep -v "^\.church-profile$"
```

If the user names a manual, look for a matching directory. If multiple exist, list and ask. If none
or the user wants a new manual, proceed to creation.

### Creating a New Project

Gather from the user:
1. **Manual title** (required)
2. **Topic or theme** (required) — e.g. "Prayer", "Foundations for New Believers"
3. **Target audience** (required) — e.g. new believers, cell group leaders, general congregation
4. **Product model** (required) — ask:
   > "Is this manual **(a) a collection of standalone lessons**, each on its own topic and teachable
   > in any order (the 52-Lessons format), or **(b) one topic developed across progressive lessons**
   > that build to a conclusion?"
   Map (a) → `standalone-lessons`, (b) → `progressive`.
   - If `standalone-lessons`: also ask how many lessons (typical sets: 8, 12, 26, 52).
5. **Lesson configuration** (offer sensible defaults, let the user override):
   - **Format mode** — ask:
     > "Is this manual **(a) facilitated** — a leader teaches it to a group (each lesson ends with
     > review/discussion questions and leader-led Application/Activation steps) — or **(b) self-study**
     > — an individual reads it (no group questions, no leader steps; lessons end after the teaching,
     > with the prayer)?"
     Map (a) → `facilitated` (default), (b) → `self-study`. In self-study mode the Final Questions and
     Application/Activation blocks are omitted, and the next two sub-questions (heading label) do not apply.
   - Leader-action heading *(facilitated only)*: **Application** (default) or **Activation**
   - Tithes & Offerings block: **on** (default) or off — note it requires church Stewardship DNA
   - Prayer block: **on** (default) or off
6. **Source material** (optional) — directory or file paths with sermon transcripts/notes

> Note: this plugin no longer offers a fill-in-the-blank workbook variant. The teaching is always
> delivered in full.

### Check for church profile

```bash
ls ~/Documents/Manuals/.church-profile/theological-dna.md 2>/dev/null
```

If **not found**: "I don't see a church theological DNA profile yet. This profile ensures every manual
carries your church's theological identity and teaching voice. Build it now? (Recommended — run
`/manual-crafter:dna-builder`.) Or proceed and build it later?"

If building first: invoke `manual-crafter:dna-builder`, then return here. If proceeding: note that
theological-dna.md is absent and the writer will use the voice profile only.

If the **Tithes & Offerings** block is ON but the theological DNA has no Stewardship & Giving section,
warn: "The Tithes & Offerings block is on, but your church profile has no stewardship DNA recorded.
I can turn the block off, or you can add stewardship DNA via the dna-builder. Otherwise the editor
will flag those blocks for you to fill."

### Create project directory structure

```bash
MANUAL_DIR="$HOME/Documents/Manuals/[Manual Title]"
mkdir -p "$MANUAL_DIR"/{sources,ingested,sections,edited,reports,output}
```

### Populate manual-dna.md

Read `${CLAUDE_PLUGIN_ROOT}/references/manual-dna-template.md`. Write `[MANUAL_DIR]/manual-dna.md`
with: title, subtitle (if given), topic, target audience, created date, source material list,
**Product Model**, and the **Lesson Configuration** table (**Format mode** facilitated/self-study,
Application label, Tithes & Offerings on/off, Prayer on/off, per-lesson length target — default
450–800 words teaching).

### Copy voice profile

```bash
cp ~/Documents/Manuals/.church-profile/voice-profile.md [MANUAL_DIR]/voice-profile.md 2>/dev/null || \
cp "${CLAUDE_PLUGIN_ROOT}/references/voice-profiles/encounter-default.md" [MANUAL_DIR]/voice-profile.md
```

### Handle source material

If the user provided source files/directory, copy them to `[MANUAL_DIR]/sources/`.

### Confirm creation

Show the created directory, the product model, and the lesson configuration. Proceed to the dashboard.

## 4. Pipeline State Detection

Scan the project directory, working backwards from the most advanced stage:

```
1. output/*.docx                         → COMPLETE
2. edited/s*-final.md (count = expected)  → Stage 3 COMPLETE
3. sections/s*-draft.md (count = expected)→ Stage 2 COMPLETE
4. outline.md with <!-- APPROVED -->      → Stage 1 COMPLETE
5. outline.md without <!-- APPROVED -->   → Stage 1 IN PROGRESS
6. ingested/topic-extract.md             → Stage 0 COMPLETE
7. sources/ with files                    → Stage 0 NEEDED
8. none of the above                      → NOT STARTED (proceed to Stage 1)
```

**Expected lesson count:** Read `outline.md`. Count `## Lesson N:` headings. If the Product Model is
`progressive`, also check for a `## Conclusion:` line — if present, add 1 to the expected count. For
`standalone-lessons` there is no conclusion.

**Conclusion detection (progressive only):** Scan for a line beginning `## Conclusion:`. Extract the
title after the colon (default `Conclusion` if none).

**Partial completion:** If lesson files exist but count < expected, the stage is PARTIALLY COMPLETE.
Identify which lessons are missing and resume only those.

## 5. Status Dashboard

```
## Manual Pipeline: [Manual Title]

Topic: [topic]   Audience: [audience]   Model: [standalone-lessons | progressive]
Directory: ~/Documents/Manuals/[Manual Title]/

### Church Profile
[✓/✗] Theological DNA: [found / NOT FOUND]
[✓/✗] Voice Profile: [found / using encounter-default]

### Lesson Configuration
Format mode: [facilitated | self-study]
Leader-action heading: [Application | Activation]   (facilitated only)
Tithes & Offerings: [on | off]   Prayer: [on | off]

### Pipeline Status
[ ] Stage 0: Ingest    [N source files / No source material]
[ ] Stage 1: Outline   [Not started / Generated: date / Approved: Yes/No]
[ ] Stage 2: Write     — 0/[N] lessons
[ ] Stage 3: Edit      [— N/N lessons shipping once run]
[ ] Stage 4: Format

### Next: [Next action]
```

## 6. Stage Execution

### Stage 0: Ingest (Conditional)

Only if `sources/` contains files. Invoke `manual-crafter:ingester` with arguments:
`[project_directory] | topic: [topic]`. Verify `ingested/topic-extract.md` exists with the
`<!-- INGEST COMPLETE` marker. If no source files: "No source material — proceeding to outline using
church DNA only."

### Stage 1: Outline (Approval Gate)

Invoke `manual-crafter:outliner` with argument `[project_directory]`. The outliner branches on the
Product Model and scaffolds each lesson (title, Bible Text anchor, Objectives, sub-questions).

Present the full outline:

"Here is the proposed structure for **[Manual Title]** ([N] lessons, [product model]):

[Display each lesson: title, theme, Bible Text anchor, objectives]

Does this look right? I can adjust lessons, reorder, add/remove, change the Bible Text anchors, or
regenerate. Once approved, I'll begin writing."

**On approval:**
1. Add `<!-- APPROVED -->` to the top of `outline.md`
2. Re-invoke outliner with `[project_directory] --populate-dna` to fill the Lesson Structure table
3. Proceed to Stage 2

**On rejection with feedback:** pass feedback to the outliner, present the revised outline, repeat.

### Stage 2: Write (Sequential)

Read the approved outline. Get lesson count and titles.

**Numbered lessons:** for each `## Lesson N: [Title]` in order:
1. Check if `sections/s[NN]-*-draft.md` already exists (resume logic)
2. If not: invoke `manual-crafter:writer` with `[project_directory] | section: [N] | title: [title]`
3. Verify the draft exists with the `<!-- LESSON COMPLETE -->` marker
4. Report: "Lesson [N]/[total] written: [title]"

**Conclusion (progressive manuals only):** after all numbered lessons, if `## Conclusion:` exists in
outline.md, write it as lesson N+1 (title `Conclusion: [phrase]`) via the writer, with resume logic.
For `standalone-lessons` manuals there is no conclusion step.

After all lessons: "Stage 2 complete: [N] lessons written. Proceeding to edit."

### Stage 3: Edit

Invoke `manual-crafter:editor` with argument `[project_directory]`. Verify all `edited/s*-final.md`
exist and `reports/edit-report.md` exists.

Present the edit summary using the report:
"Stage 3 complete. [N] lessons edited, **[N of N] shipping** (rubric ≥ 10/14 + hard rules pass).
[N] flags raised."

If any lesson is **below the ship gate**, list it with its score and weak components, and ask the user:
"Lesson [X] scored [Y]/14 ([weak components]). I can revise it again, you can review the edit report,
or we can proceed to formatting as-is. What would you like?"

Otherwise give options: Review report / Proceed to formatting / Request a specific lesson revision.

### Stage 4: Format

Invoke `manual-crafter:formatter` with argument `[project_directory]`. Verify the .docx exists and is
non-empty. Display the completion message (Section 8).

## 7. Execution Modes

**Mode 1: Guided (default)** — stage by stage with explanations; ask before each stage.
**Mode 2: Full Pipeline** — "build the whole manual" — run all stages; always pause at the outline
approval gate and at any below-gate lesson; otherwise auto-advance.
**Mode 3: Resume** — "continue"/"resume" — detect state, show dashboard, continue the next incomplete stage.
**Mode 4: DNA Only** — invoke `manual-crafter:dna-builder`; no project directory created.
**Mode 5: Status** — show dashboard only, no execution.

## 8. Completion Message

```
## Manual Complete: [Manual Title]

Output: ~/Documents/Manuals/[Manual Title]/output/[Manual Title].docx

Lessons: [N]   Model: [standalone-lessons | progressive]
Topic: [topic]

Your .docx is ready for your design team.

What next?
1. Open the .docx in Word or Google Docs
2. Request a lesson revision
3. Start a new manual
```

## 9. Error Handling

- **No church DNA profile:** warn and offer to run dna-builder first.
- **No source files when ingester invoked:** skip Stage 0, proceed to outline using church DNA only.
- **Tithes & Offerings on but no stewardship DNA:** warn at creation; editor flags affected lessons.
- **Outline not approved:** "The outline hasn't been approved yet. Approve it or request changes."
- **Lesson below ship gate:** surface the lesson, its score, and weak components; offer revise/review/proceed.
- **Partial stage:** "Stage [N] is partially complete: [x]/[n] lessons done. Missing: [list]. Resuming."
- **No Documents/Manuals directory:** create it: `mkdir -p ~/Documents/Manuals`
