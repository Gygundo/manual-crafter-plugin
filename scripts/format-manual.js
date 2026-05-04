#!/usr/bin/env node
/**
 * Manual Crafter — .docx formatter
 * Usage: node format-manual.js <project_directory> [--workbook]
 *
 * Reads: manual-dna.md, voice-profile.md, edited/s*-final.md
 * Writes: output/[Manual Title].docx (and optionally output/[Manual Title] — Workbook.docx)
 */

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, PageBreak, TableOfContents, StyleLevel,
  NumberFormat, convertInchesToTwip, PageNumber, Footer,
  Header, SectionType, BorderStyle, Table, TableRow,
  TableCell, WidthType
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
    title: extractField(content, 'Title') || 'Untitled Manual',
    subtitle: extractField(content, 'Subtitle') || '',
    topic: extractField(content, 'Topic') || '',
    audience: extractField(content, 'Target Audience') || '',
    ministry: 'Encounter Church',
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

// ── Parse markdown to docx elements ──────────────────────────────────────────

function parseSection(rawContent, workbook = false) {
  // Strip metadata comments
  const content = rawContent
    .replace(/<!--.*?-->/gs, '')
    .trim();

  const lines = content.split('\n');
  const elements = [];
  let answerKey = [];
  let blankCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('## ')) {
      elements.push(new Paragraph({
        text: line.replace(/^## /, ''),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }));
    } else if (line.startsWith('### ')) {
      elements.push(new Paragraph({
        text: line.replace(/^### /, ''),
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 240, after: 160 },
      }));
    } else if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**') && !line.endsWith('**')) {
      // Italic scripture line
      const text = line.replace(/^\*|\*$/g, '');
      elements.push(new Paragraph({
        children: [new TextRun({ text, italics: true, font: 'Georgia', size: 22 })],
        spacing: { before: 160, after: 160 },
        indent: { left: convertInchesToTwip(0.4) },
      }));
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(new Paragraph({
        text: line.replace(/^[-*] /, ''),
        bullet: { level: 0 },
        spacing: { before: 80, after: 80 },
      }));
    } else {
      // Regular paragraph — handle workbook blanks
      if (workbook) {
        const { para, keys } = applyBlanks(line, blankCounter);
        blankCounter += keys.length;
        answerKey = answerKey.concat(keys);
        elements.push(para);
      } else {
        elements.push(new Paragraph({
          children: parseInline(line),
          spacing: { before: 120, after: 120 },
        }));
      }
    }
  }

  return { elements, answerKey };
}

function parseInline(text) {
  const runs = [];
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true, font: 'Georgia', size: 24 }));
    } else if (part.startsWith('*') && part.endsWith('*')) {
      runs.push(new TextRun({ text: part.slice(1, -1), italics: true, font: 'Georgia', size: 24 }));
    } else if (part) {
      runs.push(new TextRun({ text: part, font: 'Georgia', size: 24 }));
    }
  }
  return runs;
}

// Workbook blank insertion — replaces theologically significant phrases
function applyBlanks(text, startCounter) {
  // Target: words/phrases in bold (**term**) become blanks in workbook mode
  const keys = [];
  let counter = startCounter + 1;
  const result = text.replace(/\*\*([^*]+)\*\*/g, (_, term) => {
    keys.push({ number: counter, answer: term });
    return `_______________ ${counter++}`;
  });
  const children = parseInline(result);
  return {
    para: new Paragraph({ children, spacing: { before: 120, after: 120 } }),
    keys,
  };
}

// ── Build document ────────────────────────────────────────────────────────────

function buildDocument(dna, sections, workbook = false) {
  const allElements = [];
  const allAnswers = [];

  // Cover page
  allElements.push(
    new Paragraph({
      text: dna.ministry,
      alignment: AlignmentType.CENTER,
      spacing: { before: 1800, after: 400 },
      children: [new TextRun({ text: dna.ministry, font: 'Georgia', size: 28, color: '666666' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 200 },
      children: [new TextRun({ text: dna.title, font: 'Georgia', size: 56, bold: true })],
    }),
    ...(dna.subtitle ? [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 800 },
      children: [new TextRun({ text: dna.subtitle, font: 'Georgia', size: 32, italics: true })],
    })] : []),
    new Paragraph({ children: [new PageBreak()] }),
  );

  // Introduction heading
  allElements.push(
    new Paragraph({
      text: 'Introduction',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 300 },
    }),
    new Paragraph({
      children: [new TextRun({
        text: `This manual provides foundational teaching on the subject of ${dna.topic}. It is intended for ${dna.audience || 'believers'} seeking to grow in theological understanding and practical application.`,
        font: 'Georgia',
        size: 24,
      })],
      spacing: { before: 120, after: 400 },
    }),
    new Paragraph({ children: [new PageBreak()] }),
  );

  // Sections
  for (const section of sections) {
    const { elements, answerKey } = parseSection(section.content, workbook);
    allElements.push(...elements);
    allElements.push(new Paragraph({ children: [new PageBreak()] }));
    allAnswers.push(...answerKey);
  }

  // Answer key (workbook only)
  if (workbook && allAnswers.length > 0) {
    allElements.push(
      new Paragraph({
        text: 'Answer Key',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 600, after: 300 },
      }),
      ...allAnswers.map(({ number, answer }) =>
        new Paragraph({
          children: [
            new TextRun({ text: `${number}.  `, bold: true, font: 'Georgia', size: 22 }),
            new TextRun({ text: answer, font: 'Georgia', size: 22 }),
          ],
          spacing: { before: 80, after: 80 },
        })
      ),
    );
  }

  return new Document({
    styles: {
      default: {
        document: { run: { font: 'Georgia', size: 24 } },
      },
    },
    sections: [{
      properties: {
        page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
      },
      children: allElements,
    }],
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const dna = readManualDna(projectDir);
  const sections = readSections(projectDir);

  const outputDir = path.join(projectDir, 'output');
  fs.mkdirSync(outputDir, { recursive: true });

  // Reading version
  const doc = buildDocument(dna, sections, false);
  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(outputDir, `${dna.title}.docx`);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✓ Reading version: ${outputPath}`);

  // Workbook version
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
