# Contributing

The glossary lives in `README.md`. It's a living document — it grows organically, there is no target term count and no cap.

## Format rules

These are settled. Please don't relitigate them in a PR; they were tried the other way and rejected.

**Structure**

- Terms live under themed `##` sections, grouped by where you'd actually hear them (🛠️ Building & Ops, 📈 Business & Strategy, 🔥 Culture & Vibes, 🤖 Model Behavior, 💬 Prompting & Context, 🔒 Security & Trust).
- Each `##` section heading carries one leading emoji, then a space, then the name: `## 🔥 Culture & Vibes`. Sections only — never on a `###` term heading.
- One `###` heading per term, followed by a prose definition. No bullet-list definitions.
- No numbering. Terms are never referred to by position.
- **Every term gets a `>` blockquote usage line**, showing the term used in a real sentence — how someone would actually say it in a standup, a PR comment, or a thread. Required, not optional. Write dialogue, not a textbook example.

Entry order is always: heading, definition, usage blockquote, related terms.

**Ordering**

Everything is alphabetical. `##` sections are sorted A–Z against each other, and `###` terms are sorted A–Z within their section. Adding a term means inserting it in the right slot, not appending to the end of a section.

Sort on the full heading text, case-insensitively, ignoring punctuation and the section emoji:

- `Churn (code)` before `Churn (customer)` — the parenthetical decides the tie.
- `Cook / "let him cook"` before `Cooked` — the shorter string wins at the point where one runs out.
- `e/acc vs. doomer (decel)` files under E, not after Z.

Because ordering is mechanical, an entry can't refer to another by position. Never write "the sense above" or "see the previous entry" — name the term, since sorting will move it.

**Cross-references**

**Cross-references live in the `Related terms:` row, and nowhere else.** A definition may not name another glossary term — not as a link, not by number, not in plain prose. If the connection is worth making, it is worth a link in the row.

The row is a bold `**Related terms:**` line at the end of the entry, listing markdown anchor links, comma-separated. Required, with at least one link. Two to four is the usual range; past four it reads as a tag line.

This is enforced (`definition/reference`), which means writing around the reference rather than through it:

| Instead of | Write |
|---|---|
| "Retrieval layer under RAG." | "The retrieval layer underneath most grounding setups." |
| "a direct cause of context rot" | "the most common way to poison your own answer quality" |
| "The current answer to prompt injection." | "the only dependable defense against untrusted input steering an agent" |

The one exception is the deliberate traps below, where naming the other term *is* the entry. Those are exempt by name in `TRAP_EXEMPT` in `scripts/lint.ts`, and extending that list needs a reason in the PR.

**Load-bearing terms must already exist.** A definition may not lean on undefined jargon. `Frontier model` once read "distinct from open-weight" while `Open-weight` had no entry — a reader hits a wall. If your definition needs a term the glossary doesn't have, write that entry in the same change. The linter enforces this against a curated watchlist (`LOAD_BEARING` in `scripts/lint.ts`); add to that list whenever you catch a new case.

**No duplicate terms.** Two entries cannot share a heading or resolve to the same anchor. Two entries *may* share a bare name when each is disambiguated — `Churn (code)` and `Churn (customer)` are correct; a second bare `Churn` is not.

```markdown
**Related terms:** [Context rot](#context-rot), [Token burn](#token-burn)
```

Anchor slugs follow GitHub's rules: lowercase, punctuation stripped, spaces to hyphens. A ` / ` in a heading collapses to a double hyphen — `### Ship / shipped` → `#ship--shipped`. Check your links render before opening the PR.

**Rejected — do not add**

- Per-entry tag lines (`Tags: agents, ops`).
- Prose "See also:" sentences trailing a definition — the `Related terms:` row replaced these.
- A collapsible header / details-summary table of contents.

**Disambiguation**

Same word, different meanings = separate entries, disambiguated in the heading itself:

```markdown
### Churn (code)
### Churn (customer)
```

**Contribution guidance in the glossary itself**

None. `README.md` opens with the description blockquote and goes straight into terms — no contributor section, no badges, no template block inside the glossary. All contribution guidance lives in this file.

## Deliberate traps

Some entries exist specifically to flag a confusion. Keep the contrast explicit in the definition; don't "clean it up":

- **Cook vs. cooked vs. cracked** — same rough sound, three unrelated meanings. "Let it cook" = trending good, "we're cooked" = doomed, "she's cracked" = unfairly talented.
- **One-shotted** — the "nailed it first try" sense, unrelated to the example-count sense of "shot" in zero-shot / few-shot.
- **Model collapse vs. mode collapse** — a lineage degrading across training generations vs. one model's output range narrowing. Near-identical names, unrelated failures. Both entries state the contrast, and both are in `TRAP_EXEMPT`.

## Commit messages

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): subject`.

```
feat: add "context rot" term
fix(lint): correct anchor slug check for slash headings
chore(ci): bump actions/checkout to v7
```

Common types: `feat`, `fix`, `docs`, `chore`, `ci`, `refactor`, `test`. Scope is optional. PRs are checked by [commitlint](commitlint.config.cjs) in CI — every commit on the branch must pass, not just the PR title.

## Linting

```
node scripts/lint.ts          # lint README.md
node --test scripts/lint.test.ts   # run the test suite
```

Runs on Node >=23.6 with no install step — native TypeScript type-stripping, zero dependencies. **Errors** fail the run (exit 1); **warnings** report and pass. Current baseline: 0 errors, 5 warnings, all of them definitions sitting at the 4-sentence ceiling.

What it enforces:

| | |
|---|---|
| Structure | exactly three blocks per entry — definition, blockquote, related row — in that order and nothing after |
| Definition | one paragraph of prose, no lists, no links, ≤4 sentences (warn at 4) |
| Definition | names no other glossary term (`definition/reference`); leans on no undefined watchlist jargon (`definition/undefined`) |
| Blockquote | exactly one, single line, opens and closes with `"` |
| Related row | present, ≥1 link, `[Text](#anchor)` form, anchors resolve, link text matches its target heading, no repeats, no self-links (warn above 4 links) |
| Ordering | sections and terms both alphabetical; section must be one of the six |
| Headings | no emoji on `###`, no duplicate headings, no two entries claiming the same name |
| Banned | `Tags:` lines, `See also`, `<details>`, positional references, numbered references |

Two rules are deliberately imprecise in your favour:

- Positional references match as *phrases* (`sense above`, `previous entry`, `see below`). Bare "above" is fine — `System prompt` legitimately reads "sitting above user turns."
- A parenthetical counts as an alias only when it's an acronym (`HITL`, `CoT`), never a disambiguator. `Churn (code)` does not claim the word "code".

What it deliberately does **not** check: which section is right, whether the voice fits, whether the blockquote sounds like a person, whether related links are meaningful, link reciprocity, orphans. A green run means well-formed, not good.

The suite in `scripts/lint.test.ts` runs each rule against a fixture in `scripts/fixtures/`, and asserts README.md itself stays error-free. Add a fixture case with any new rule.

Adding a seventh section means editing `SECTIONS` in `scripts/lint.ts` — a deliberate speed bump.

## Adding a term with Claude Code

The repo ships a skill at `.claude/skills/add-term/` that does the whole insertion. In Claude Code:

```
/add-term slopsquatting
```

Or just describe it — "add workslop to the glossary" triggers the same thing. It takes several terms at once.

It picks the section, drafts the definition and usage blockquote in house voice, chooses the related terms, inserts at the alphabetical slot, runs the linter, and reports what it did. You review the diff.

The skill knows the rules on this page, so it is the fastest way to get a well-formed entry. It cannot tell whether the entry is *good* — whether the section is right, the attribution real, or the blockquote something a person would actually say. Read what it wrote. A green lint means well-formed, not correct.

If you'd rather write by hand, or you're not using Claude Code, follow the checklist below — it's the same process.

## Adding a term by hand

1. Pick the section where the term is actually used, not where it technically belongs.
2. Check it isn't already there, under any name. Same word with a genuinely different meaning gets its own entry, disambiguated in the heading.
3. Write 2–3 sentences; 4 is the ceiling. Say what it means, then what it signals — tone, who says it, whether it's an insult. Name no other glossary term.
4. Add origin/attribution when it's known and short (coiner, paper, year).
5. Write the usage blockquote. Required for every term: one line, opening and closing double quote.
6. Add a `Related terms:` row with at least one link. This is where every cross-reference goes. A backlink from those entries is welcome but not required.
7. If the definition needs a term the glossary lacks, write that entry too, in the same change.
8. Insert the entry at its alphabetical position in the section. Don't append to the bottom.
9. Run `node scripts/lint.ts` and clear every error.
