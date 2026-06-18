#!/usr/bin/env node
/**
 * Manual Crafter — .docx formatter (v3)
 * Usage: node format-manual.js <project_directory>
 *
 * Reads: manual-dna.md, edited/s*-final.md
 * Writes: output/[Manual Title].docx
 *
 * Renders the Maldonado training-manual layout:
 *   Section 1 — Cover page (no header/footer)
 *   Section 2 — Table of Contents + all lessons (header: ministry, footer: title · page)
 *
 * Lesson markdown contract (see references/lesson-template.md):
 *   #    → Lesson Title          (Heading 1 — appears in TOC, prefixed with lesson number)
 *   ##   → Structural label      (Bible Text / Objectives / Introduction / Final Questions /
 *                                 Application / Activation / Tithes & Offerings / Prayer)
 *   ###  → Teaching sub-question (bold)
 *   1.   → Numbered teaching point (bold lead-in preserved via inline parse)
 *   -    → bullet
 *   >    → scripture block (indented, italic)
 *
 * There is NO workbook / fill-in-the-blank variant.
 */

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, PageBreak, TableOfContents,
  convertInchesToTwip, PageNumber, Footer, Header, SectionType,
} = require('docx');
const fs = require('fs');
const path = require('path');

// ── Args ──────────────────────────────────────────────────────────────────────

const projectDir = process.argv[2];

if (!projectDir) {
  console.error('Usage: node format-manual.js <project_directory>');
  process.exit(1);
}

// ── Read manual DNA ───────────────────────────────────────────────────────────

function readManualDna(dir) {
  const dnaPath = path.join(dir, 'manual-dna.md');
  if (!fs.existsSync(dnaPath)) throw new Error(`manual-dna.md not found at ${dnaPath}`);
  const content = fs.readFileSync(dnaPath, 'utf8');
  return {
    title:      extractField(content, 'Title')          || 'Untitled Manual',
    subtitle:   extractField(content, 'Subtitle')       || '',
    manualType: extractField(content, 'Manual Type')    || 'Manual',
    ministry:   'Encounter Church',
  };
}

function extractField(content, field) {
  const match = content.match(new RegExp(`\\*\\*${field}:\\*\\*\\s*(.+)`));
  return match ? match[1].trim() : '';
}

// ── Read lesson files ─────────────────────────────────────────────────────────

function readSections(dir) {
  const editedDir = path.join(dir, 'edited');
  if (!fs.existsSync(editedDir)) throw new Error(`edited/ directory not found at ${editedDir}`);
  const files = fs.readdirSync(editedDir)
    .filter(f => f.match(/^s\d+-.*-final\.md$/))
    .sort();
  if (files.length === 0) throw new Error('No edited lesson files found in edited/');
  return files.map(f => ({
    filename: f,
    content: fs.readFileSync(path.join(editedDir, f), 'utf8'),
  }));
}

// ── Inline markdown parser ────────────────────────────────────────────────────

function parseInline(text) {
  const runs = [];
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
    } else if (part.startsWith('*') && part.endsWith('*')) {
      runs.push(new TextRun({ text: part.slice(1, -1), italics: true }));
    } else if (part) {
      runs.push(new TextRun({ text: part }));
    }
  }
  return runs;
}

// Strip markdown emphasis markers (for fully-italic scripture blocks)
function stripEmphasis(text) {
  return text.replace(/\*\*/g, '').replace(/\*/g, '');
}

const SCRIPTURE_INDENT = {
  left: convertInchesToTwip(0.5),
  right: convertInchesToTwip(0.5),
};

function scriptureParagraph(text) {
  return new Paragraph({
    children: [new TextRun({ text: stripEmphasis(text).trim(), italics: true })],
    spacing: { before: 200, after: 200 },
    indent: SCRIPTURE_INDENT,
  });
}

// A bold, uppercase, letter-spaced structural label (Bible Text, Objectives, …)
function sectionLabel(text) {
  return new Paragraph({
    spacing: { before: 360, after: 140 },
    keepNext: true,
    children: [new TextRun({
      text: text.toUpperCase(),
      bold: true,
      size: 22,
      color: '333355',
      characterSpacing: 40,
    })],
  });
}

// ── Lesson markdown parser ──────────────────────────────────────────────────────

function parseSection(rawContent, lessonIndex) {
  const content = rawContent.replace(/<!--.*?-->/gs, '').trim();
  const lines = content.split('\n');
  const elements = [];
  let titleDone = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Lesson title (#) — only the first single-hash heading
    if (line.startsWith('# ') && !titleDone) {
      titleDone = true;
      elements.push(new Paragraph({
        text: `${lessonIndex}.   ${line.replace(/^#\s+/, '')}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 0, after: 360 },
      }));

    // Structural section label (##) — not a heading, so it stays out of the TOC
    } else if (line.startsWith('## ')) {
      elements.push(sectionLabel(line.replace(/^##\s+/, '')));

    // Teaching sub-question (###) — bold
    } else if (line.startsWith('### ')) {
      elements.push(new Paragraph({
        spacing: { before: 260, after: 120 },
        keepNext: true,
        children: [new TextRun({ text: line.replace(/^###\s+/, ''), bold: true, size: 24 })],
      }));

    // Scripture blockquote (>) — indented italic
    } else if (line.startsWith('>')) {
      elements.push(scriptureParagraph(line.replace(/^>\s?/, '')));

    // Numbered teaching point (1. 2. …) — keep the number, bold lead-in via inline parse
    } else if (/^\d+\.\s/.test(line)) {
      elements.push(new Paragraph({
        children: parseInline(line),
        spacing: { before: 120, after: 120 },
        indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.25) },
      }));

    // Bullet (-)
    } else if (line.startsWith('- ')) {
      elements.push(new Paragraph({
        children: parseInline(line.replace(/^- /, '')),
        bullet: { level: 0 },
        spacing: { before: 80, after: 80 },
      }));

    // Legacy standalone scripture line (*"…"*) — indented italic
    } else if (line.startsWith('*"')) {
      elements.push(scriptureParagraph(line));

    } else if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
      elements.push(scriptureParagraph(line));

    // Regular paragraph
    } else {
      elements.push(new Paragraph({
        children: parseInline(line),
        spacing: { before: 140, after: 140 },
      }));
    }
  }

  return { elements };
}

// ── Cover page ────────────────────────────────────────────────────────────────

function buildCoverElements(dna) {
  const els = [];

  els.push(new Paragraph({ text: '', spacing: { before: 2160 } }));

  els.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 240 },
    children: [new TextRun({
      text: dna.ministry.toUpperCase(),
      font: 'Georgia', size: 20, color: '999999', characterSpacing: 280,
    })],
  }));

  els.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 720 },
    children: [new TextRun({
      text: dna.manualType.toUpperCase(),
      font: 'Georgia', size: 18, color: 'bbbbbb', characterSpacing: 360,
    })],
  }));

  els.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 360 },
    children: [new TextRun({
      text: dna.title,
      font: 'Georgia', size: 72, bold: true, color: '1a1a2e',
    })],
  }));

  const subtitle = dna.subtitle && dna.subtitle !== '[Fill in]' ? dna.subtitle.trim() : '';
  if (subtitle) {
    els.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({
        text: subtitle,
        font: 'Georgia', size: 32, italics: true, color: '666666',
      })],
    }));
  }

  return els;
}

// ── Table of contents ─────────────────────────────────────────────────────────

function buildTocElements() {
  return [
    new Paragraph({
      text: 'Contents',
      heading: HeadingLevel.HEADING_1,
      pageBreakBefore: true,
      spacing: { before: 0, after: 400 },
    }),
    new TableOfContents('Contents', {
      hyperlink: true,
      headingStyleRange: '1-1',
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ── Header / Footer ───────────────────────────────────────────────────────────

function makeHeader(ministry) {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text: ministry, font: 'Georgia', size: 17, color: 'bbbbbb' })],
      }),
    ],
  });
}

function makeFooter(title) {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [
          new TextRun({ text: `${title}  ·  `, font: 'Georgia', size: 17, color: 'aaaaaa' }),
          new TextRun({ children: [PageNumber.CURRENT], font: 'Georgia', size: 17, color: 'aaaaaa' }),
        ],
      }),
    ],
  });
}

// ── Build document ────────────────────────────────────────────────────────────

function buildDocument(dna, sections) {
  const contentElements = [];

  contentElements.push(...buildTocElements());

  for (let i = 0; i < sections.length; i++) {
    if (i > 0) contentElements.push(new Paragraph({ children: [new PageBreak()] }));
    const { elements } = parseSection(sections[i].content, i + 1);
    contentElements.push(...elements);
  }

  const pageMargins = { top: 1440, bottom: 1440, left: 1440, right: 1440 };

  return new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Georgia', size: 24 },
          paragraph: { spacing: { line: 336, lineRule: 'auto' } },
        },
        heading1: {
          run: { font: 'Georgia', size: 44, bold: true, color: '1a1a2e' },
          paragraph: { spacing: { before: 600, after: 300 }, keepNext: true },
        },
        heading2: {
          run: { font: 'Georgia', size: 30, bold: true, color: '333355' },
          paragraph: { spacing: { before: 440, after: 200 }, keepNext: true },
        },
        heading3: {
          run: { font: 'Georgia', size: 24, bold: true, italics: true, color: '555566' },
          paragraph: { spacing: { before: 280, after: 120 }, keepNext: true },
        },
      },
    },
    sections: [
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: { margin: pageMargins },
        },
        headers: { default: new Header({ children: [] }) },
        footers: { default: new Footer({ children: [] }) },
        children: buildCoverElements(dna),
      },
      {
        properties: { page: { margin: pageMargins } },
        headers: { default: makeHeader(dna.ministry) },
        footers: { default: makeFooter(dna.title) },
        children: contentElements,
      },
    ],
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const dna = readManualDna(projectDir);
  const sections = readSections(projectDir);

  const outputDir = path.join(projectDir, 'output');
  fs.mkdirSync(outputDir, { recursive: true });

  const doc = buildDocument(dna, sections);
  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(outputDir, `${dna.title}.docx`);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✓ Manual: ${outputPath}`);

  console.log(`\nDone. ${sections.length} lessons formatted.`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
