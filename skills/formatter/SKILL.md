---
name: formatter
description: "Convert edited manual lessons into a professional .docx file matching the training-manual layout. Called by the orchestrator during Stage 4. Not user-invocable directly."
user-invocable: false
allowed-tools: Read, Write, Bash, Glob, Grep
---

# Manual Crafter — Formatter

Stage 4 of the pipeline. Converts all `edited/s*-final.md` lessons into a clean `.docx` document
laid out like the source training manuals. Called by the orchestrator with the project directory path
as `$ARGUMENTS`. **There is no workbook / fill-in-the-blank variant** — the teaching is rendered in full.

## 1. Parse Arguments

Arguments format: `[project_directory]`

`$ARGUMENTS` is the project directory (absolute path). If no argument is provided, report:
'No project directory provided. Usage: [project_directory]' and exit. Any extra tokens are ignored —
the formatter no longer accepts a `--workbook` flag.

## 2. Pre-flight Checks

### Verify docx-js

```bash
node -e "require('docx')" 2>/dev/null || npm install -g docx
```

### Verify edited lessons exist

```bash
ls [project_directory]/edited/s*-final.md | wc -l
```

If count is 0: report error "No edited lessons found. Run the editor (Stage 3) first." and exit.

### Read manual DNA

Read `[project_directory]/manual-dna.md`. Extract the title. If the title is empty or "[Fill in]",
use the directory name as the title.

## 3. Execute Formatter Script

The formatter script at `${CLAUDE_PLUGIN_ROOT}/scripts/format-manual.js` handles all docx generation —
it parses the lesson markdown contract (labelled sections, sub-questions, numbered points, scripture
blockquotes) and renders the training-manual layout.

```bash
mkdir -p [project_directory]/output
node "${CLAUDE_PLUGIN_ROOT}/scripts/format-manual.js" "[project_directory]"
```

The script outputs `[Manual Title].docx` where the title comes from the `**Title:**` field in
`manual-dna.md`. Capture the script's stdout to confirm the actual output path before verifying.

## 4. Verify Output

```bash
ls -lh [project_directory]/output/*.docx
```

Verify the .docx exists (`ls` returns a result) and is non-empty (`test -s [path]`). If missing or
empty: report the error output from the script and stop.

## 5. Report Completion

```
Stage 4 complete.

Output: [project_directory]/output/[Manual Title].docx ([size])

Lessons: [N]

Open in Microsoft Word or Google Docs. Your design team can brand and print from there.
```
