---
name: ingester
description: "Ingest sermon transcripts or notes for a manual project. Extracts topic-relevant teaching content and gleans theological DNA additions. Called by the orchestrator during Stage 0. Not user-invocable directly."
user-invocable: false
allowed-tools: Read, Write, Bash, Grep, Glob
---

# Manual Crafter — Ingester

Stage 0 of the pipeline. Reads source material from `[project_directory]/sources/`, extracts content relevant to the manual topic, and gleans any new theological DNA. Called by the orchestrator with the project directory path and manual topic as arguments via `$ARGUMENTS`.

## 1. Parse Arguments

Arguments format: `[project_directory] | topic: [manual topic]`

If arguments cannot be parsed into exactly two parts separated by ` | topic: `, report an error: 'Invalid arguments format. Expected: [project_directory] | topic: [topic name]' and exit.

Extract:
- `project_directory` — absolute path to the manual project
- `topic` — the manual topic (e.g., "Prayer", "The Kingdom of God")

## 2. Discover Source Files

```bash
find [project_directory]/sources -name "*.md" -o -name "*.txt" -o -name "*.pdf" 2>/dev/null
```

If no source files found, report: "No source files found in `[project_directory]/sources/`. Stage 0 skipped — proceeding to outline with church DNA only." Then exit.

## 3. Extract Topic Content

Read each source file. For each file, extract content that is directly relevant to the manual topic `[topic]`:

- Teaching points made about the topic
- Scripture references used in relation to the topic
- Pastoral illustrations or examples related to the topic
- Doctrinal claims made about the topic
- Practical applications or calls to action on the topic

**Filter:** Only extract content with a clear connection to `[topic]`. Do not extract tangentially related content.

Write all extracted content to `[project_directory]/ingested/topic-extract.md`:

```markdown
# Topic Extract: [topic]

**Source files processed:** [N]
**Extracted:** [YYYY-MM-DD]

---

## Teaching Points

[Bullet list of key teaching points extracted, with source file attribution]

## Scripture References

[All scriptures used in connection with the topic, with source attribution]

## Pastoral Illustrations

[Any stories, examples, or analogies used to illustrate the topic]

## Doctrinal Claims

[Explicit doctrinal statements made about the topic]

## Practical Applications

[Calls to action, how-to guidance, application statements]

<!-- INGEST COMPLETE: [N] source files, [topic] -->
```

## 4. Glean Theological DNA Additions

While reading source files, also look for theological DNA signals not specifically about the topic:

- Explicit statements of doctrinal position ("We believe...", "The church holds...")
- Recurring phrases that mark theological identity
- Terms used in distinctive ways
- Scripture anchors (frequently cited scriptures)

Write gleaned additions to `[project_directory]/ingested/dna-additions.md`:

```markdown
# DNA Additions — Gleaned from [project name] Sources

**Gleaned:** [YYYY-MM-DD]

---

## New Doctrinal Positions
[Any new positions not in current theological-dna.md]

## New Recurring Themes
[New themes or frequency updates for existing themes]

## New Key Term Usage
[New terms or clarifications of existing terms]

## New Scripture Anchors
[New frequently-cited scriptures]

<!-- DNA ADDITIONS COMPLETE -->
```

## 5. Merge DNA Additions into Church Profile

Present the gleaned additions to the user: "I found [N] potential theological DNA additions from these source files. Would you like to merge them into your church profile now, or review them first in `ingested/dna-additions.md`?"

On approval: read `~/Documents/Manuals/.church-profile/theological-dna.md`, merge additively (adding new items, updating existing where clarified, appending to the DNA Change Log table), write the updated file.

On "review first": report the path to `dna-additions.md` and stop. The user can manually review and then say "merge the DNA additions" to trigger the merge.

Report: "Stage 0 complete: [N] source files ingested. Topic content extracted to `ingested/topic-extract.md`. DNA additions pending user review at `ingested/dna-additions.md`." (Adjust final sentence if the user approved immediate merge: "Church DNA updated with [N] new items.")
