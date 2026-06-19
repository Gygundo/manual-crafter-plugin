#!/usr/bin/env node
/**
 * verify-scripture.mjs — Stage 3 scripture checker for manual-crafter.
 *
 * Verifies every scripture blockquote in a manual's lessons against the live
 * NKJV text from API.Bible, and writes reports/scripture-verification.md.
 *
 * This is what makes MANUAL-12 enforceable instead of advisory: the editor can
 * now look up verse text rather than only flagging "please verify".
 *
 * Usage:
 *   node verify-scripture.mjs "<project_directory>" [--translation NKJV]
 *
 * Reads lessons from <project>/edited/s*-final.md (falls back to
 * <project>/sections/s*-draft.md if no edited files exist yet).
 *
 * API KEY RESOLUTION (no secret is stored in this plugin):
 *   1. env API_BIBLE_KEY
 *   2. env BIBLE_API_KEY
 *   3. ~/Development/bible-app/server/.env   (David's Bible app — key line API_BIBLE_KEY=...)
 *   4. env BIBLE_APP_ENV  (a path to any .env file containing API_BIBLE_KEY=...)
 *
 * If no key is found the script exits 0 and writes a report noting that
 * verification was skipped (so the pipeline never hard-fails on a missing key).
 *
 * See references/scripture-verification.md for the data source details.
 */

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

// ── Translation registry (API.Bible English IDs, from the Bible app whitelist) ──
const TRANSLATIONS = {
  NKJV: '63097d2a0a2f7db3-01',
  KJV:  'de4e12af7f28f599-01',
  AMP:  'a81b73293d3080c9-01',
  NIV:  '78a9f6124f344018-01',
  ASV:  '06125adad2d5898a-01',
  WEB:  '9879dbb7cfe39e4d-01',
  LSV:  '01b29f4b342acc35-01',
}
const API_BASE = 'https://rest.api.bible/v1'

const BOOKS = {
  'genesis':'GEN','exodus':'EXO','leviticus':'LEV','numbers':'NUM','deuteronomy':'DEU',
  'joshua':'JOS','judges':'JDG','ruth':'RUT','1 samuel':'1SA','2 samuel':'2SA','1 kings':'1KI',
  '2 kings':'2KI','1 chronicles':'1CH','2 chronicles':'2CH','ezra':'EZR','nehemiah':'NEH','esther':'EST',
  'job':'JOB','psalm':'PSA','psalms':'PSA','proverbs':'PRO','ecclesiastes':'ECC','song of solomon':'SNG',
  'isaiah':'ISA','jeremiah':'JER','lamentations':'LAM','ezekiel':'EZK','daniel':'DAN','hosea':'HOS',
  'joel':'JOL','amos':'AMO','obadiah':'OBA','jonah':'JON','micah':'MIC','nahum':'NAM','habakkuk':'HAB',
  'zephaniah':'ZEP','haggai':'HAG','zechariah':'ZEC','malachi':'MAL','matthew':'MAT','mark':'MRK',
  'luke':'LUK','john':'JHN','acts':'ACT','romans':'ROM','1 corinthians':'1CO','2 corinthians':'2CO',
  'galatians':'GAL','ephesians':'EPH','philippians':'PHP','colossians':'COL','1 thessalonians':'1TH',
  '2 thessalonians':'2TH','1 timothy':'1TI','2 timothy':'2TI','titus':'TIT','philemon':'PHM',
  'hebrews':'HEB','james':'JAS','1 peter':'1PE','2 peter':'2PE','1 john':'1JN','2 john':'2JN',
  '3 john':'3JN','jude':'JUD','revelation':'REV',
}

// ── Args ──────────────────────────────────────────────────────────────────────
const projectDir = process.argv[2]
if (!projectDir) {
  console.error('Usage: node verify-scripture.mjs "<project_directory>" [--translation NKJV]')
  process.exit(1)
}
const tflag = process.argv.indexOf('--translation')
const transName = tflag !== -1 ? (process.argv[tflag + 1] || 'NKJV').toUpperCase() : 'NKJV'
const bibleId = TRANSLATIONS[transName]
if (!bibleId) {
  console.error(`Unknown translation "${transName}". Known: ${Object.keys(TRANSLATIONS).join(', ')}`)
  process.exit(1)
}

// ── Key resolution ──────────────────────────────────────────────────────────
function readKeyFromEnvFile(p) {
  try {
    const txt = fs.readFileSync(p, 'utf8')
    const m = txt.match(/^\s*API_BIBLE_KEY\s*=\s*(.+)\s*$/m)
    if (m) return m[1].trim().replace(/^["']|["']$/g, '')
  } catch { /* ignore */ }
  return ''
}
function resolveKey() {
  if (process.env.API_BIBLE_KEY) return process.env.API_BIBLE_KEY.trim()
  if (process.env.BIBLE_API_KEY) return process.env.BIBLE_API_KEY.trim()
  const candidates = [
    process.env.BIBLE_APP_ENV,
    path.join(os.homedir(), 'Development', 'bible-app', 'server', '.env'),
  ].filter(Boolean)
  for (const c of candidates) {
    const k = readKeyFromEnvFile(c)
    if (k) return k
  }
  return ''
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const cache = new Map()
async function apiFetch(id, key, passage) {
  const ck = `${passage ? 'p' : 'v'}:${id}`
  if (cache.has(ck)) return cache.get(ck)
  const kind = passage ? 'passages' : 'verses'
  const url = `${API_BASE}/bibles/${bibleId}/${kind}/${encodeURIComponent(id)}` +
    `?content-type=text&include-verse-numbers=false&include-notes=false` +
    `&include-titles=false&include-chapter-numbers=false`
  try {
    const res = await fetch(url, { headers: { 'api-key': key } })
    if (!res.ok) { const t = `__ERROR__ ${res.status}`; cache.set(ck, t); return t }
    const json = await res.json()
    const text = json?.data?.content ?? ''
    cache.set(ck, text)
    return text
  } catch (e) {
    const t = `__ERROR__ ${e.message}`; cache.set(ck, t); return t
  }
}

const BRIT2AM = { honour:'honor', odour:'odor', splendour:'splendor', colour:'color',
  favour:'favor', saviour:'savior', neighbour:'neighbor', behaviour:'behavior', labour:'labor' }
function deAmer(s) {
  s = s.toLowerCase()
  for (const [b, a] of Object.entries(BRIT2AM)) s = s.split(b).join(a)
  return s.split('ise').join('ize')
}
function norm(s) {
  s = deAmer(s)
  s = s.replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/[—–]/g, ' ')
  s = s.replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
  return s
}

function parseRef(ref) {
  const m = ref.trim().match(/^([1-3]?\s?[A-Za-z ]+?)\s+(\d+):([\d,–\-\s]+)$/)
  if (!m) return null
  const book = m[1].trim().toLowerCase()
  const bid = BOOKS[book]
  if (!bid) return null
  const vpart = m[3].replace(/–/g, '-').replace(/\s/g, '')
  return { bid, ch: m[2], vpart }
}
function buildIds(bid, ch, vpart) {
  if (vpart.includes(',')) return { ids: vpart.split(',').map(v => `${bid}.${ch}.${v}`), passage: false }
  if (vpart.includes('-')) { const [a, b] = vpart.split('-'); return { ids: [`${bid}.${ch}.${a}-${bid}.${ch}.${b}`], passage: true } }
  return { ids: [`${bid}.${ch}.${vpart}`], passage: false }
}

function classify(quote, apitext, partial) {
  if (apitext.startsWith('__ERROR__') || !apitext) return 'CHECK'
  const a = norm(apitext)
  const q = norm(quote.replace(/\.\.\.|…/g, ' '))
  if (q === a) return 'FAITHFUL'
  if (a.includes(q)) return 'FAITHFUL_EXCERPT'
  const frags = quote.split(/\.\.\.|…/).map(norm).filter(Boolean)
  if (frags.length && frags.every(f => a.includes(f))) return partial ? 'FAITHFUL_EXCERPT_PARTIAL' : 'FAITHFUL_EXCERPT'
  return 'CHECK'
}

// ── Collect lessons ─────────────────────────────────────────────────────────
function lessonFiles() {
  const ed = path.join(projectDir, 'edited')
  const se = path.join(projectDir, 'sections')
  let dir = ed, suffix = '-final.md'
  if (!fs.existsSync(ed) || fs.readdirSync(ed).filter(f => f.endsWith('-final.md')).length === 0) {
    dir = se; suffix = '-draft.md'
  }
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter(f => /^s\d+.*\.md$/.test(f) && f.endsWith(suffix))
    .sort().map(f => path.join(dir, f))
}

const QUOTE_RE = /^\s*>\s*\*"([\s\S]+?)"\*\s*[—-]+\s*(.+?)\s*\(([A-Z]+)\)\s*$/

async function main() {
  const key = resolveKey()
  const reportPath = path.join(projectDir, 'reports', 'scripture-verification.md')
  fs.mkdirSync(path.dirname(reportPath), { recursive: true })

  const files = lessonFiles()
  const rows = []
  for (const f of files) {
    const lesson = path.basename(f)
    for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
      const m = line.match(QUOTE_RE)
      if (!m) continue
      const [, quote, ref, tag] = m
      rows.push({ lesson, quote, ref, tag })
    }
  }

  if (!key) {
    const md = `# Scripture Verification Report\n\n**Status:** SKIPPED — no API.Bible key found.\n\n` +
      `Set \`API_BIBLE_KEY\` in the environment (or point \`BIBLE_APP_ENV\` at an .env containing it) ` +
      `and re-run \`scripts/verify-scripture.mjs\`. See references/scripture-verification.md.\n\n` +
      `Quotes detected (unverified): ${rows.length}\n`
    fs.writeFileSync(reportPath, md)
    console.log(`Scripture verification SKIPPED (no API key). ${rows.length} quotes left unverified. Report: ${reportPath}`)
    process.exit(0)
  }

  const counts = {}
  for (const r of rows) {
    const pr = parseRef(r.ref)
    if (!pr) { r.cat = 'CHECK'; r.nkjv = '(could not parse reference)'; counts[r.cat] = (counts[r.cat]||0)+1; continue }
    const { ids, passage } = buildIds(pr.bid, pr.ch, pr.vpart)
    let text = ''
    if (passage) text = await apiFetch(ids[0], key, true)
    else { const parts = []; for (const id of ids) parts.push(await apiFetch(id, key, false)); text = parts.join(' ') }
    const partial = r.quote.includes('...') || r.quote.includes('…')
    // wrong-translation tag check: if tag !== transName, still verify against requested translation but note
    r.cat = classify(r.quote, text, partial)
    if (r.tag !== transName) r.cat = r.cat === 'CHECK' ? 'CHECK' : r.cat + `_TAG(${r.tag})`
    r.nkjv = (text || '').replace(/\s+/g, ' ').trim()
    counts[r.cat] = (counts[r.cat]||0)+1
  }

  // ── Write report ──
  const today = new Date().toISOString().slice(0, 10)
  const L = []
  L.push('# Scripture Verification Report', '')
  L.push(`**Verified:** ${today} against the live **${transName}** (API.Bible \`${bibleId}\`).`)
  L.push(`**Quotes checked:** ${rows.length}`, '')
  L.push('## Summary')
  for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) L.push(`- **${k}:** ${v}`)
  L.push('')
  L.push('> `FAITHFUL` = matches the translation (British/SA spelling normalised). `FAITHFUL_EXCERPT` = an accurate partial quote of a longer verse. `CHECK` = differs enough to eyeball. A `_TAG(XXX)` suffix means the quote was labelled XXX but verified against ' + transName + '.', '')
  const checks = rows.filter(r => r.cat.startsWith('CHECK'))
  L.push('## Needs a glance', '')
  if (!checks.length) L.push('- None — every quote is verbatim or a faithful excerpt.')
  for (const r of checks) {
    L.push(`- **${r.ref}** (${r.lesson})`)
    L.push(`  - manual: ${r.quote}`)
    L.push(`  - ${transName}: ${r.nkjv.slice(0, 400)}`)
  }
  L.push('', '## Full table', '', '| Lesson | Reference | Tag | Result |', '|---|---|---|---|')
  for (const r of rows) L.push(`| ${r.lesson.replace(/^s(\d+).*/, 'L$1')} | ${r.ref} | ${r.tag} | ${r.cat} |`)
  L.push('', '<!-- SCRIPTURE VERIFICATION COMPLETE -->')
  fs.writeFileSync(reportPath, L.join('\n'))

  const flagged = checks.length
  console.log(`Scripture verification complete. ${rows.length} quotes; ${flagged} need a glance. Report: ${reportPath}`)
}

main().catch(e => { console.error('verify-scripture failed:', e.message); process.exit(1) })
