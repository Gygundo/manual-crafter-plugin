---
name: orchestrator
description: "Master pipeline controller for building topical theological training manuals. Use when the user wants to build a manual, create training material from sermons, check manual project status, resume an interrupted manual project, or update the church theological DNA. Triggers on: 'build a manual', 'create a manual', 'training manual', 'manual from sermons', 'manual status', 'resume manual', 'update church DNA', 'ingest sermons', 'manual crafter'."
allowed-tools: Read, Write, Bash, Grep, Glob, Agent
---

# Manual Crafter Orchestrator

Master pipeline controller for the manual-crafter plugin. Manages the full lifecycle: creating projects, detecting pipeline state, chaining stages, and displaying progress.

## 1. Pipeline Overview

```
Stage 0: Ingest    (conditional — skipped if no source material)
Stage 1: Outline   (USER APPROVAL GATE — never skipped)
Stage 2: Write     (sequential section writing)
Stage 3: Edit      (voice + theological coherence)
Stage 4: Format    (.docx output)
```

## 2. On Trigger — Detect Mode

When the orchestrator activates, determine the user's intent:

**DNA Only mode:** User says "update my DNA", "ingest sermons", "build my DNA profile", "update church DNA" — route to DNA Only mode (Section 7, Mode 4) immediately.

**Status mode:** User says "manual status", "where am I", "show progress" — route to Status mode (Section 7, Mode 5) immediately.

**Otherwise:** Detect or create a project (Section 3).

## 3. Project Detection or Creation

### Check for existing projects

```bash
ls -1 ~/Documents/Manuals/ 2>/dev/null | grep -v "^\.church-profile$"
```

If the user mentions a specific manual name, look for a matching directory. If multiple projects exist, list them and ask which to work on. If no projects exist or the user wants a new manual, proceed to project creation.

### Creating a New Project

Gather from the user:
1. **Manual title** (required)
2. **Topic** (required) — e.g., "Prayer", "The Kingdom of God", "Spiritual Authority"
3. **Target audience** (required) — e.g., new believers, cell group leaders, general congregation
4. **Source material** (optional) — directory path or file paths containing sermon transcripts/notes
5. **Fill-in-the-blank variant** (optional, default No) — "Would you like a workbook variant with fill-in-the-blank blanks?"

### Check for church profile

```bash
ls ~/Documents/Manuals/.church-profile/theological-dna.md 2>/dev/null
```

If **not found**: warn the user — "I don't see a church theological DNA profile yet. This profile ensures every manual carries your church's theological identity. Would you like to build it now before creating this manual? (Recommended — run `/manual-crafter:dna-builder`) Or proceed and build it later?"

If user wants to build DNA first: invoke `manual-crafter:dna-builder`, then return here.
If user wants to proceed: note that theological-dna.md is absent and the writer will use voice profile only.

### Create project directory structure

```bash
MANUAL_DIR="$HOME/Documents/Manuals/[Manual Title]"
mkdir -p "$MANUAL_DIR/sources"
mkdir -p "$MANUAL_DIR/ingested"
mkdir -p "$MANUAL_DIR/sections"
mkdir -p "$MANUAL_DIR/edited"
mkdir -p "$MANUAL_DIR/reports"
mkdir -p "$MANUAL_DIR/output"
```

### Populate manual-dna.md

Read `${CLAUDE_PLUGIN_ROOT}/references/manual-dna-template.md`. Write `[MANUAL_DIR]/manual-dna.md` with:
- Title, subtitle (if given), topic, target audience, created date
- Source material list (file paths if provided, or "from scratch")
- Fill-in-the-blank: Yes/No

### Copy voice profile

```bash
cp ~/Documents/Manuals/.church-profile/voice-profile.md [MANUAL_DIR]/voice-profile.md 2>/dev/null || \
cp "${CLAUDE_PLUGIN_ROOT}/references/voice-profiles/encounter-default.md" [MANUAL_DIR]/voice-profile.md
```

### Handle source material

If the user provided source files or a directory, copy them to `[MANUAL_DIR]/sources/`.

### Confirm creation

Show the user the created directory and manual-dna.md metadata. Proceed to the status dashboard.

## 4. Pipeline State Detection

Scan the project directory to determine the current pipeline state. Work backwards from the most advanced stage:

```
1. Check for output/*.docx          → If exists: COMPLETE
2. Check for edited/s*-final.md     → Count matches section count in outline.md? Stage 3 COMPLETE
3. Check for sections/s*-draft.md   → Count matches section count? Stage 2 COMPLETE
4. Check for outline.md with <!-- APPROVED -->  → Stage 1 COMPLETE
5. Check for outline.md without <!-- APPROVED --> → Stage 1 IN PROGRESS
6. Check for ingested/topic-extract.md → Stage 0 COMPLETE
7. Check for sources/ with files    → Stage 0 NEEDED
8. None of above                    → NOT STARTED (proceed to Stage 1)
```

**Section count:** Read `outline.md` and count all level-2 headings (`## `) that are section or conclusion entries. The outline uses `## Section N:` for main sections and `## Conclusion:` for the final entry — count both. Exclude the document title heading `# Manual Outline`.

**Partial completion:** If section files exist but count < expected, the stage is PARTIALLY COMPLETE. Identify which sections are missing and resume only those.

## 5. Status Dashboard

Display after project creation and on status mode:

```
## Manual Pipeline: [Manual Title]

Topic: [topic]
Audience: [audience]
Directory: ~/Documents/Manuals/[Manual Title]/

### Church Profile
[✓/✗] Theological DNA: [found at .church-profile/theological-dna.md / NOT FOUND]
[✓/✗] Voice Profile: [found / using encounter-default]

### Pipeline Status

[ ] Stage 0: Ingest (ingester)
    [N source files in sources/ / No source material]

[ ] Stage 1: Outline (outliner)
    [Not started / Generated: [date] / Approved: Yes/No]

[ ] Stage 2: Write (writer) — 0/[N] sections
[ ] Stage 3: Edit (editor)
[ ] Stage 4: Format (formatter)
    [ ] Reading version
    [ ] Workbook version [only if requested]

### Next: [Next action]
```

## 6. Stage Execution

### Stage 0: Ingest (Conditional)

Only run if `sources/` directory contains files.

Invoke `manual-crafter:ingester` with arguments: `[project_directory] | topic: [topic]`

Verify output: `ingested/topic-extract.md` exists with `<!-- INGEST COMPLETE` marker.

If no source files: display "No source material — proceeding to outline using church DNA only."

### Stage 1: Outline (Approval Gate)

Invoke `manual-crafter:outliner` with argument: `[project_directory]`

After outliner produces `outline.md`, present the full outline to the user:

"Here is the proposed structure for **[Manual Title]**:

[Display each section title and theme description from outline.md]

Does this structure look right? I can adjust specific sections, reorder, add more sections, or regenerate. Once approved, I'll begin writing."

**On approval:**
1. Add `<!-- APPROVED -->` to the top of `outline.md`
2. Re-invoke outliner with arguments: `[project_directory] --populate-dna` to update manual-dna.md section structure
3. Proceed to Stage 2

**On rejection with feedback:**
1. Pass feedback to outliner (re-invoke with project directory + feedback)
2. Present revised outline
3. Repeat approval loop

### Stage 2: Write (Sequential)

Read the approved outline. Get section count and titles.

For each section in order:

1. Check if `sections/s[NN]-*-draft.md` already exists (resume logic)
2. If not: invoke `manual-crafter:writer` with arguments: `[project_directory] | section: [N] | title: [title]`
3. Verify `sections/s[NN]-*-draft.md` exists with `<!-- SECTION COMPLETE -->` marker
4. Report progress: "Section [N]/[total] written: [title]"

After all sections: "Stage 2 complete: [N] sections written. Proceeding to edit."

### Stage 3: Edit

Invoke `manual-crafter:editor` with argument: `[project_directory]`

Verify: All `edited/s*-final.md` files exist. `reports/edit-report.md` exists.

Present edit summary:
"Stage 3 complete. [N] sections edited.
[N] theological flags corrected.
[N] voice adjustments made.

Would you like to review the edit report before formatting? (`reports/edit-report.md`)"

Give user options: Review report / Proceed to formatting / Request a specific section revision.

### Stage 4: Format

Invoke `manual-crafter:formatter` with argument: `[project_directory] [--workbook if requested]`

Verify output exists and is non-empty.

Display completion message (Section 7, Mode completion).

## 7. Execution Modes

### Mode 1: Guided (Default)

Stage by stage with explanations. Ask before proceeding to each stage. Report results after each stage.

### Mode 2: Full Pipeline

Triggered: "build the whole manual", "full pipeline", "run everything"

Run all stages in sequence. Always pause at outline approval gate. Otherwise auto-advance.

### Mode 3: Resume

Triggered: "continue", "resume", "pick up"

1. Detect pipeline state
2. Show status dashboard
3. Identify next incomplete stage
4. Offer to continue: "You're at Stage [N] — [description]. Continue?"

### Mode 4: DNA Only

Triggered: "update my DNA", "ingest sermons without a manual", "build church profile"

Invoke `manual-crafter:dna-builder`. Do not create a project directory.

### Mode 5: Status

Triggered: "manual status", "where am I", "show progress"

Show dashboard only. No execution.

## 8. Completion Message

When Stage 4 is complete:

```
## Manual Complete: [Manual Title]

Output: ~/Documents/Manuals/[Manual Title]/output/[Manual Title].docx
[If workbook: Workbook: ~/Documents/Manuals/[Manual Title]/output/[Manual Title] — Workbook.docx]

Sections: [N]
Topic: [topic]

Your .docx is ready for your design team.

What next?
1. Open the .docx in Word or Google Docs
2. Request a section revision
3. Start a new manual
```

## 9. Error Handling

**No church DNA profile:** Warn user and offer to run dna-builder first.

**No source files when ingester invoked:** Skip Stage 0 gracefully, proceed to Stage 1 using church DNA only.

**Outline not approved:** "The outline hasn't been approved yet. Please review and let me know if you'd like to approve it or request changes."

**Partial stage:** "Stage [N] is partially complete: [x]/[n] sections done. Missing: [list]. Resuming missing sections."

**No Documents/Manuals directory:** Create it automatically: `mkdir -p ~/Documents/Manuals`
