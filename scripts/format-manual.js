#!/usr/bin/env node
/**
 * Manual Crafter — .docx formatter (v2)
 * Usage: node format-manual.js <project_directory> [--workbook]
 *
 * Reads: manual-dna.md, edited/s*-final.md
 * Writes: output/[Manual Title].docx (and optionally output/[Manual Title] — Workbook.docx)
 *
 * Layout:
 *   Section 1 — Cover page (no header/footer)
 *   Section 2 — Table of Contents + all chapters (header: ministry name, footer: title · page number)
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
const workbookMode = process.argv.includes('--workbook');

if (!projectDir) {
  console.error('Usage: node format-manual.js <project_directory> [--workbook]');
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

// ── Read section files ────────────────────────────────────────────────────────

function readSections(dir) {
  const editedDir = path.join(dir, 'edited');
  if (!fs.existsSync(editedDir)) throw new Error(`edited/ directory not found at ${editedDir}`);
  const files = fs.readdirSync(editedDir)
    .filter(f => f.match(/^s\d+-.*-final\.md$/))
    .sort();
  if (files.length === 0) throw new Error('No edited section files found in edited/');
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

// ── Workbook blank insertion ──────────────────────────────────────────────────

function applyBlanks(text, startCounter) {
  const keys = [];
  let counter = startCounter + 1;
  const result = text.replace(/\*\*([^*]+)\*\*/g, (_, term) => {
    keys.push({ number: counter, answer: term });
    return `_______________ ${counter++}`;
  });
  return {
    para: new Paragraph({ children: parseInline(result), spacing: { before: 140, after: 140 } }),
    keys,
  };
}

// ── Section markdown parser ───────────────────────────────────────────────────

function parseSection(rawContent, sectionIndex, workbook = false) {
  const content = rawContent.replace(/<!--.*?-->/gs, '').trim();
  const lines = content.split('\n');
  const elements = [];
  const answerKey = [];
  let blankCounter = 0;
  let firstHeading = true;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('## ')) {
      const titleText = line.replace(/^## /, '');
      if (firstHeading) {
        // First ## = chapter title → H1 with section number
        firstHeading = false;
        elements.push(new Paragraph({
          text: `${sectionIndex}.   ${titleText}`,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 0, after: 400 },
        }));
      } else {
        elements.push(new Paragraph({
          text: titleText,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        }));
      }

    } else if (line.startsWith('### ')) {
      elements.push(new Paragraph({
        text: line.replace(/^### /, ''),
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 280, after: 140 },
      }));

    } else if (line.startsWith('- ')) {
      elements.push(new Paragraph({
        text: line.replace(/^- /, ''),
        bullet: { level: 0 },
        spacing: { before: 80, after: 80 },
      }));

    } else if (line.startsWith('*"')) {
      // Standalone scripture block — indented, italic formatting preserved
      elements.push(new Paragraph({
        children: parseInline(line),
        spacing: { before: 240, after: 240 },
        indent: {
          left: convertInchesToTwip(0.5),
          right: convertInchesToTwip(0.5),
        },
      }));

    } else if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
      // Short single-line italic (scripture without a reference appendage)
      elements.push(new Paragraph({
        children: [new TextRun({ text: line.replace(/^\*|\*$/g, ''), italics: true })],
        spacing: { before: 240, after: 240 },
        indent: {
          left: convertInchesToTwip(0.5),
          right: convertInchesToTwip(0.5),
        },
      }));

    } else {
      // Regular paragraph with inline formatting
      if (workbook) {
        const { para, keys } = applyBlanks(line, blankCounter);
        blankCounter += keys.length;
        answerKey.push(...keys);
        elements.push(para);
      } else {
        elements.push(new Paragraph({
          children: parseInline(line),
          spacing: { before: 140, after: 140 },
        }));
      }
    }
  }

  return { elements, answerKey };
}

// ── Cover page ────────────────────────────────────────────────────────────────

function buildCoverElements(dna) {
  const els = [];

  els.push(new Paragraph({ text: '', spacing: { before: 2160 } }));

  // Ministry name — small, spaced, muted
  els.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 240 },
    children: [new TextRun({
      text: dna.ministry.toUpperCase(),
      font: 'Georgia',
      size: 20,
      color: '999999',
      characterSpacing: 280,
    })],
  }));

  // Manual type label
  els.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 720 },
    children: [new TextRun({
      text: dna.manualType.toUpperCase(),
      font: 'Georgia',
      size: 18,
      color: 'bbbbbb',
      characterSpacing: 360,
    })],
  }));

  // Title — large and bold
  els.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 360 },
    children: [new TextRun({
      text: dna.title,
      font: 'Georgia',
      size: 72,
      bold: true,
      color: '1a1a2e',
    })],
  }));

  // Subtitle if meaningful
  const subtitle = dna.subtitle && dna.subtitle !== '[Fill in]' ? dna.subtitle.trim() : '';
  if (subtitle) {
    els.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({
        text: subtitle,
        font: 'Georgia',
        size: 32,
        italics: true,
        color: '666666',
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

function buildDocument(dna, sections, workbook = false) {
  const contentElements = [];
  const allAnswers = [];

  contentElements.push(...buildTocElements());

  for (let i = 0; i < sections.length; i++) {
    if (i > 0) contentElements.push(new Paragraph({ children: [new PageBreak()] }));
    const { elements, answerKey } = parseSection(sections[i].content, i + 1, workbook);
    contentElements.push(...elements);
    allAnswers.push(...answerKey);
  }

  if (workbook && allAnswers.length > 0) {
    contentElements.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        text: 'Answer Key',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 0, after: 360 },
      }),
      ...allAnswers.map(({ number, answer }) =>
        new Paragraph({
          children: [
            new TextRun({ text: `${number}.  `, bold: true, size: 22 }),
            new TextRun({ text: answer, size: 22 }),
          ],
          spacing: { before: 80, after: 80 },
        })
      ),
    );
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
      // Cover — clean page, no header/footer
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: { margin: pageMargins },
        },
        headers: { default: new Header({ children: [] }) },
        footers: { default: new Footer({ children: [] }) },
        children: buildCoverElements(dna),
      },
      // TOC + chapters — ministry header, title·page footer
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

  const doc = buildDocument(dna, sections, false);
  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(outputDir, `${dna.title}.docx`);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✓ Reading version: ${outputPath}`);

  if (workbookMode) {
    const workbookDoc = buildDocument(dna, sections, true);
    const workbookBuffer = await Packer.toBuffer(workbookDoc);
    const workbookPath = path.join(outputDir, `${dna.title} — Workbook.docx`);
    fs.writeFileSync(workbookPath, workbookBuffer);
    console.log(`✓ Workbook version: ${workbookPath}`);
  }

  console.log(`\nDone. ${sections.length} sections formatted.`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
