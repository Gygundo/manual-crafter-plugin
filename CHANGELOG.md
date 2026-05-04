# Changelog

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
