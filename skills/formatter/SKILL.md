---
name: formatter
description: "Convert edited manual sections into a professional .docx file. Called by the orchestrator during Stage 4. Not user-invocable directly."
user-invocable: false
allowed-tools: Read, Write, Bash, Glob, Grep
---

# Manual Crafter — Formatter

Stage 4 of the pipeline. Converts all `edited/s*-final.md` files into a clean `.docx` document. Called by the orchestrator with the project directory path as `$ARGUMENTS`. Optionally produces a workbook variant.

## 1. Parse Arguments

Arguments format: `[project_directory] [--workbook]`

Split `$ARGUMENTS` on whitespace. The first token is `project_directory`. If a second token `--workbook` is present, set `workbook_mode = true`, otherwise `workbook_mode = false`. If no arguments are provided, report: 'No project directory provided. Usage: [project_directory] [--workbook]' and exit.

Extract:
- `project_directory` — absolute path
- `workbook_mode` — true if `--workbook` is present

## 2. Pre-flight Checks

### Verify docx-js

```bash
node -e "require('docx')" 2>/dev/null || npm install -g docx
```

### Verify edited sections exist

```bash
ls [project_directory]/edited/s*-final.md | wc -l
```

If count is 0: report error "No edited sections found. Run the editor (Stage 3) first." and exit.

### Read manual DNA

Read `[project_directory]/manual-dna.md`. Extract title. If title is empty or "[Fill in]", use the directory name as the title.

## 3. Execute Formatter Script

The formatter script at `${CLAUDE_PLUGIN_ROOT}/scripts/format-manual.js` handles all docx generation.

Create the output directory:

```bash
mkdir -p [project_directory]/output
```

Run the formatter:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/format-manual.js" "[project_directory]"
```

If workbook mode is active, also run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/format-manual.js" "[project_directory]" --workbook
```

The script outputs `[Manual Title].docx` where the title comes from the `**Title:**` field in `manual-dna.md`. Capture the script's stdout to confirm the actual output paths before verifying in Section 4.

## 4. Verify Output

```bash
ls -lh [project_directory]/output/*.docx
```

Verify each expected .docx file:
- Exists (`ls` returns a result)
- Is non-empty (`test -s [path]`)

If any file is missing or empty: report the error output from the script and stop.

## 5. Report Completion

Report:

```
Stage 4 complete.

Output: [project_directory]/output/[Manual Title].docx ([size])
[If workbook: Workbook: [project_directory]/output/[Manual Title] — Workbook.docx ([size])]

Sections: [N]

Open in Microsoft Word or Google Docs. Your design team can brand and print from there.
```
