---
name: editor
description: "Edit all written sections for voice consistency, theological coherence, scripture accuracy, and flow. Called by the orchestrator during Stage 3. Not user-invocable directly."
user-invocable: false
allowed-tools: Read, Write, Bash, Grep, Glob
---

# Manual Crafter — Editor

Stage 3 of the pipeline. Performs a single editing pass across all written sections. Called by the orchestrator with the project directory path as `$ARGUMENTS`.

## 1. Read Context

Read all of the following:

1. `[project_directory]/manual-dna.md` — topic, audience, theological angle
2. `~/Documents/Manuals/.church-profile/theological-dna.md` — church DNA (ground truth for theological accuracy)
3. `~/Documents/Manuals/.church-profile/voice-profile.md` — voice profile (ground truth for voice)
4. All `[project_directory]/sections/s*-draft.md` files — sections to edit (in order)

## 2. Editing Pass

For each section in order:

### Check 1: Voice consistency

Compare against voice-profile.md:
- Does the tone match? (Too academic? Too casual? Too hedging?)
- Are sentence patterns consistent with the voice profile?
- Is vocabulary aligned? (Check for avoided terms from voice profile)
- Are emphasis techniques applied correctly?

### Check 2: Theological coherence

Compare against theological-dna.md:
- Are doctrinal positions stated correctly and consistently with the church's DNA?
- Are key terms used in the church's defined way (not generic usage)?
- Are theological emphases present and correct?
- Does anything contradict the church's doctrinal positions?

### Check 3: Scripture accuracy

- Are scriptures quoted accurately? (Verify reference format — do not fabricate verses)
- Are scriptures from the church's preferred translation (from voice profile)?
- Are scripture anchors from theological-dna.md used where relevant?

### Check 4: Flow

After reviewing all sections:
- Does each section build naturally on the one before it?
- Are there abrupt transitions between sections?
- Does the manual progress from foundation through depth to application?
- Does the conclusion feel like a satisfying close?

## 3. Write Edited Sections

For each section, write an edited version to `[project_directory]/edited/s[NN]-[slug]-final.md`.

Apply corrections from all four checks. If a section passes all checks with only minor polish needed, apply the polish. If a section has significant theological issues, correct them and note it in the edit report.

File format:

```markdown
<!-- SECTION: [N] | [Title] | [word_count] words | edited -->

## [Section Title]

[Edited content]

<!-- EDIT COMPLETE: voice [pass/flag], theology [pass/flag], scripture [pass/flag], flow [pass/flag] -->
```

## 4. Write Edit Report

Write `[project_directory]/reports/edit-report.md`:

```markdown
# Edit Report

**Manual:** [Title]
**Edited:** [YYYY-MM-DD]
**Sections:** [N]

## Summary

| Section | Voice | Theology | Scripture | Flow | Changes |
|---------|-------|----------|-----------|------|---------|
| [Title] | pass/flag | pass/flag | pass/flag | pass/flag | [brief description] |

## Flags

[List any theological flags, voice deviations, or scripture issues that were corrected — with the original text and the correction]

## Flow Notes

[Any notes on transitions adjusted between sections]

<!-- EDIT REPORT COMPLETE -->
```

Report: "Stage 3 complete. [N] sections edited. [N] flags corrected. Edit report at `reports/edit-report.md`."
