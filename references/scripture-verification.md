# Scripture Verification

> Lets the editor (Stage 3) **look up actual verse text** and check every scripture
> quote in a manual against a real translation, instead of only flagging "please
> verify" (the old MANUAL-12 limitation). Source: **API.Bible**.

## Data source

- **Provider:** API.Bible (`https://rest.api.bible/v1`)
- **Default translation:** NKJV — bible id `63097d2a0a2f7db3-01`
- **Other English ids** (from the Bible-app whitelist): KJV `de4e12af7f28f599-01`,
  AMP `a81b73293d3080c9-01`, NIV `78a9f6124f344018-01`, ASV `06125adad2d5898a-01`,
  WEB `9879dbb7cfe39e4d-01`, LSV `01b29f4b342acc35-01`.
- Endpoints used: `/bibles/{id}/verses/{BOOK.C.V}` and `/bibles/{id}/passages/{BOOK.C.V1-BOOK.C.V2}`
  with `content-type=text`.

## API key (never stored in this plugin)

The verifier resolves the key in this order and stores nothing:

1. env `API_BIBLE_KEY`
2. env `BIBLE_API_KEY`
3. `~/Development/bible-app/server/.env` (David's Bible app — line `API_BIBLE_KEY=…`)
4. env `BIBLE_APP_ENV` → a path to any `.env` containing `API_BIBLE_KEY=…`

If no key is found, verification is **skipped** (never a hard failure) and the report
says so. Get a free key at https://scripture.api.bible.

## How to run

```bash
node "<plugin>/scripts/verify-scripture.mjs" "<project_directory>" [--translation NKJV]
```

Reads `edited/s*-final.md` (falls back to `sections/s*-draft.md`), extracts every
scripture blockquote (`> *"…"* — Reference (NKJV)`), fetches the verse, and writes
`reports/scripture-verification.md`.

## Result categories

- **FAITHFUL** — matches the translation. British/SA spelling is normalised before
  comparison (honour↔honor, odour↔odor, splendour↔splendor, …), so house-style
  spelling never counts as an error.
- **FAITHFUL_EXCERPT** — an accurate partial quote of a longer verse (with or without
  an ellipsis).
- **CHECK** — differs enough that a human should eyeball it (wrong words, a clause that
  belongs to a different verse, a mismatched reference).
- A `_TAG(XXX)` suffix means the quote was labelled `XXX` but was verified against the
  requested translation (e.g. a quote tagged KJV — "unction" — checked against NKJV
  which reads "anointing").

## Notes on translation accuracy

- The NKJV official text uses **American** spelling. Manuals set to SA/British English
  keep British spelling in quotes for consistency; this is intentional and the verifier
  normalises it. If you need verbatim NKJV, switch the manual's spelling convention.
- A quote tagged `(NKJV)` that only matches the KJV wording is a real error — fix the
  wording or change the tag.
