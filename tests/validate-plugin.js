#!/usr/bin/env node
/**
 * Plugin structure validation — run after any structural change.
 * Usage: node tests/validate-plugin.js
 * Exit 0 = all pass. Exit 1 = failures found.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let failures = 0;

function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✓ ${label}`);
  } else {
    console.error(`  ✗ ${label}${detail ? ': ' + detail : ''}`);
    failures++;
  }
}

function fileExists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function readJson(rel) {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')); }
  catch { return null; }
}

function readFile(rel) {
  try { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
  catch { return null; }
}

console.log('\n── Manifest ──');
const manifest = readJson('plugin.json');
check('plugin.json exists', !!manifest);
check('plugin.json has name', manifest?.name === 'manual-crafter');
check('plugin.json has version', !!manifest?.version);
check('plugin.json has description', !!manifest?.description);

console.log('\n── Skills ──');
const expectedSkills = ['orchestrator', 'dna-builder', 'ingester', 'outliner', 'writer', 'editor', 'formatter'];
for (const skill of expectedSkills) {
  const skillPath = `skills/${skill}/SKILL.md`;
  check(`${skill}/SKILL.md exists`, fileExists(skillPath));
  const content = readFile(skillPath);
  check(`${skill}/SKILL.md has frontmatter`, content?.startsWith('---'));
  check(`${skill}/SKILL.md has name field`, content?.includes('name:'));
  check(`${skill}/SKILL.md has description field`, content?.includes('description:'));
  check(`${skill}/SKILL.md has allowed-tools field`, content?.includes('allowed-tools:'));
}

console.log('\n── References ──');
check('theological-dna-template.md exists', fileExists('references/theological-dna-template.md'));
check('manual-dna-template.md exists', fileExists('references/manual-dna-template.md'));
check('pipeline-stages.md exists', fileExists('references/pipeline-stages.md'));
check('voice-profile-spec.md exists', fileExists('references/voice-profiles/voice-profile-spec.md'));
check('encounter-default.md exists', fileExists('references/voice-profiles/encounter-default.md'));

console.log('\n── Scripts ──');
check('format-manual.js exists', fileExists('scripts/format-manual.js'));
const script = readFile('scripts/format-manual.js');
check('format-manual.js requires docx', script?.includes("require('docx')"));
check('format-manual.js has buildDocument function', script?.includes('function buildDocument'));
check('format-manual.js has readManualDna function', script?.includes('function readManualDna'));
check('format-manual.js has readSections function', script?.includes('function readSections'));
check('format-manual.js has parseSection function', script?.includes('function parseSection'));
check('format-manual.js has parseInline function', script?.includes('function parseInline'));

console.log('\n── Fixtures ──');
check('tiny-manual fixture exists', fileExists('fixtures/tiny-manual'));
check('fixture manual-dna.md exists', fileExists('fixtures/tiny-manual/manual-dna.md'));
check('fixture outline.md exists', fileExists('fixtures/tiny-manual/outline.md'));
check('fixture edited section exists',
  fs.existsSync(path.join(ROOT, 'fixtures/tiny-manual/edited')) &&
  fs.readdirSync(path.join(ROOT, 'fixtures/tiny-manual/edited')).some(f => f.endsWith('-final.md')));

console.log(`\n── Result: ${failures === 0 ? 'ALL PASS' : failures + ' FAILURE(S)'} ──\n`);
process.exit(failures > 0 ? 1 : 0);
