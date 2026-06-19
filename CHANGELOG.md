# Changelog

## 1.2.0 — 2026-06-19

Scripture quotes are now verified against a real translation, and the .docx is fully portable.

- **New — scripture verification (MANUAL-12 is now enforceable).** `scripts/verify-scripture.mjs`
  checks every scripture blockquote in the lessons against the live text from **API.Bible**
  (default NKJV) and writes `reports/scripture-verification.md`. British/SA spelling is normalised
  and faithful excerpts are accepted; genuine wrong-wording, wrong-verse, and mistagged-translation
  quotes are surfaced as `CHECK`. The editor (Stage 3) runs it and folds results into the edit
  report. No API key is stored in the plugin — it resolves from `API_BIBLE_KEY`, `BIBLE_API_KEY`,
  `~/Development/bible-app/server/.env`, or `BIBLE_APP_ENV`, and skips gracefully if none is found.
  New reference: `references/scripture-verification.md`.
- **Fixed — portable .docx (no "fields may refer to other files" prompt).** The formatter no longer
  emits a live `TableOfContents` field; the Contents page is now static text. The document opens
  clean with no update-fields dialog and no external dependency. (Footer page numbers use the safe
  `PAGE` field, which does not trigger the prompt.)
- Version aligned: `package.json` and `plugin.json` both → 1.2.0.

## 1.1.0 — 2026-06-18

Manuals are now true training material in the Maldonado lesson structure, and the plugin mirrors
book-crafter's quality architecture (rubric + editor-enforced craft rules). **Breaking:** the
fill-in-the-blank workbook variant is removed; terminology moves from "sections" to "lessons".

- **New reference — `lesson-template.md`**: the foundational pedagogical DNA. Every lesson follows
  Bible Text → Objectives → Introduction → question-driven Teaching Body → Final Questions →
  Application/Activation → (optional) Tithes & Offerings → (optional) Prayer. Defines the markdown
  contract the writer emits and the formatter renders. Read by every stage so the training character
  carries through.
- **New reference — `manual-craft-rules.md`**: 14 voice-agnostic procedural rules (MANUAL-01..14),
  each auto-revise or flag, enforced by the editor (no deterministic script — the editor is the
  enforcement surface).
- **New reference — `lesson-rubric.md`**: 7-component pedagogy rubric (0–14). Editor scores every
  lesson; ship gate = total ≥ 10 AND hard rules (MANUAL-01/-02/-11) pass.
- **Product models**: orchestrator asks at creation — `standalone-lessons` (collection, no
  conclusion) or `progressive` (single topic, conclusion required). Outliner branches accordingly.
- **Lesson configuration** in manual-dna.md: Application vs Activation heading, Tithes & Offerings
  on/off, Prayer on/off, per-lesson length target.
- **Theological DNA** gains **Stewardship & Giving Exhortation** (feeds the Tithes & Offerings block
  in the church's voice, never foreign boilerplate) and **Teaching & Pedagogical DNA**. Ingester and
  dna-builder now glean both.
- **Writer/Outliner/Editor/Formatter/Orchestrator** rewritten around the lesson template and rubric.
- **Formatter (`format-manual.js` v3)**: parses the lesson contract (labelled sections, sub-questions,
  numbered points, scripture blockquotes); workbook/blank code removed.
- **Removed**: fill-in-the-blank workbook variant (`--workbook`, answer keys, blanks) — permanently.

## 1.0.2 — 2026-05-05

Pipeline fix — conclusion section now always written:

- **Orchestrator**: Stage 2 now has a dedicated conclusion step that runs after all numbered sections. Reads `## Conclusion:` from outline.md, extracts the title, and calls the writer for it as section N+1. Warns if outline has no conclusion. State detection updated to include the conclusion in expected section count.
- **Outliner**: Conclusion is now explicitly required. Added guidance: every outline must end with a `## Conclusion: [Title]` section; defined what the conclusion must do (declaration + call to action, no new doctrine).
- **Writer**: Added conclusion-specific writing guidance — shorter target (350-480 words), no new doctrine, opens with a declaration, closes with a direct call to action.

## 1.0.1 — 2026-05-04

Formatter improvements:

- Proper cover page: ministry name, manual type label, large title (36pt), subtitle
- Table of Contents (auto-generated, links to chapters)
- Chapter titles promoted to H1 with section numbers (e.g. "1.   What Fellowship Actually Is")
- Standalone scripture blocks (`*"..."* (Ref)`) now indented and italic
- Running header: ministry name (right-aligned, muted)
- Running footer: manual title · page number (centered, muted)
- Cover page intentionally left clean (no header/footer)
- Removed generic hardcoded Introduction paragraph
- Improved heading styles: H1 22pt, H2 15pt, H3 12pt bold italic, with dark navy palette
- Body line-height improved (1.4× spacing)

## 1.0.0 — 2026-05-04

Initial release.

- Orchestrator with Guided, Full Pipeline, Resume, DNA Only, and Status modes
- Persistent church theological DNA profile (additive, never wiped)
- Pipeline: Ingest → Outline → Write → Edit → Format
- Clean .docx output with optional fill-in-the-blank workbook variant
- Encounter Church default voice profile included
