---
name: dna-builder
description: "Build or update the church theological DNA profile from sermon transcripts, notes, or existing content. Use when the user says 'build my DNA', 'update church DNA', 'analyse my sermons', 'create a theological profile', or provides a directory of source content for DNA building. Produces a persistent theological-dna.md that all manuals inherit."
allowed-tools: Read, Write, Bash, Grep, Glob
---

# Manual Crafter — DNA Builder

Builds or enriches the persistent church theological DNA profile at `~/Documents/Manuals/.church-profile/theological-dna.md`. Run this before building your first manual, and again whenever new sermon content expands your source library.

## 1. On Trigger

When this skill activates:

1. Check if `~/Documents/Manuals/.church-profile/theological-dna.md` exists
   - If **exists**: this is an UPDATE run — display current DNA summary and ask user for source directory
   - If **not exists**: this is a FIRST BUILD — inform user: 'No church DNA profile found. I'll create one now.'

2. Ask the user: "Where is your source material? Provide a directory path containing sermon transcripts, notes, or teaching outlines (as .md, .txt, or .pdf files)."

3. Proceed to Section 2 (Analysis).

## 2. Source Analysis

### Step 1: Discover source files

```bash
find [source_directory] \( -name "*.md" -o -name "*.txt" -o -name "*.pdf" \) | head -50
```

List discovered files. Report how many were found.

Note: PDF files will be listed but Claude Code cannot read binary PDF files directly. If PDF files are found, inform the user and suggest converting them to .md or .txt first.

### Step 2: Read each source file

Read each file. For each file, extract:

**Doctrinal positions** — explicit statements of belief, theological claims, doctrinal declarations. Look for:
- "We believe..."
- "The [doctrine] is..."
- "God's Word says... therefore..."
- Any first-person plural declarations about theology

**Recurring themes** — topics, phrases, or convictions that appear multiple times across files. Note frequency.

**Key terms** — words used in a distinctive way that may differ from generic usage. Note the specific usage in context.

**Theological emphases** — what the teaching leans into (e.g., Kingdom now, supernatural as normative, grace not works). Note what is consistently amplified.

**Scripture anchors** — scriptures quoted repeatedly or treated as foundational. Count citations.

### Step 3: Synthesise findings

Compile findings across all source files into a structured summary:
- Doctrinal positions (list each with supporting evidence from sources)
- Top 5-10 recurring themes (ordered by frequency)
- Key terms table (term + this church's specific usage)
- Core emphases (what appears in ≥50% of sources)
- Top 10 scripture anchors (by citation frequency)

## 3. Present for Review

Show the user the synthesised DNA:

```
## Proposed Theological DNA

### Doctrinal Positions
[List each position with the evidence quote from source]

### Recurring Themes
1. [Theme] — appeared in [N] of [Total] sources
...

### Key Terms
| Term | This Church's Usage |
|------|---------------------|
...

### Theological Emphases
We emphasise:
- [Emphasis 1]

### Scripture Anchors
| Scripture | Citations | Context |
...
```

Ask: "Does this capture your church's theological DNA accurately? You can approve it, add missing positions, remove anything that doesn't fit, or correct any terms before I save it."

## 4. On Approval — Save DNA Profile

### Step 1: Check if existing DNA file exists

```bash
ls ~/Documents/Manuals/.church-profile/theological-dna.md 2>/dev/null
```

### Step 2: Create or update

**If creating for the first time:**

1. Create the church-profile directory:
```bash
mkdir -p ~/Documents/Manuals/.church-profile
```

2. Read `${CLAUDE_PLUGIN_ROOT}/references/theological-dna-template.md`

3. Write `~/Documents/Manuals/.church-profile/theological-dna.md` by populating the template with the approved DNA content. Set today's date in `Last Updated` and `Source Count`.

**If updating existing:**

1. Read existing `~/Documents/Manuals/.church-profile/theological-dna.md`

2. Merge new findings additively:
   - Add new doctrinal positions not already present (do not modify existing ones)
   - Add new recurring themes; update frequency notes on existing ones
   - Add new key terms; update existing if the new source clarifies usage
   - Add new scripture anchors; increment citation counts on existing
   - Append a row to the DNA Change Log table: today's date, source directory name, summary of key additions

3. Write the updated file.

### Step 3: Confirm

Report: "Theological DNA [built/updated] at `~/Documents/Manuals/.church-profile/theological-dna.md`. [N] doctrinal positions, [N] recurring themes, [N] scripture anchors captured."

Display the file path and invite the user to review it directly.

## 5. Copy Voice Profile (First Build Only)

If this was a FIRST BUILD (no prior theological-dna.md existed):

Ask: "Would you like to set up a voice profile for your church? This captures the pastor's writing style and is applied to every manual. Options:
1. Use the Encounter Church default voice profile
2. Build from source material (I'll analyse the writing style of your transcripts)
3. Skip for now (you can add it later)

Which would you like?"

**Option 1:**
```bash
cp ${CLAUDE_PLUGIN_ROOT}/references/voice-profiles/encounter-default.md \
   ~/Documents/Manuals/.church-profile/voice-profile.md
```
Report: "Encounter Church default voice profile installed."

**Option 2:**
Analyse the writing style of the provided source files. Look for: sentence length patterns, vocabulary preferences, emphasis techniques, rhetorical patterns. Generate a voice profile following the spec at `${CLAUDE_PLUGIN_ROOT}/references/voice-profiles/voice-profile-spec.md`. Present for review. On approval, write to `~/Documents/Manuals/.church-profile/voice-profile.md`.

**Option 3:**
Report: "Voice profile skipped. You can run `/manual-crafter:dna-builder` again later, or copy a profile manually to `~/Documents/Manuals/.church-profile/voice-profile.md`."
