---
name: add-term
description: Add a new term to the AI developer glossary in README.md — drafts the definition, usage blockquote and related-terms row in house voice, inserts it at the correct alphabetical slot, and validates with scripts/lint.ts. Use when the user asks to add, write, or draft a glossary term or entry, invokes /add-term, or names a piece of AI/dev slang they want captured.
---

# Add a glossary term

Draft the entry, place it, lint it, report. The user reviews the diff afterwards and corrects — do not interview them before writing unless the term is genuinely ambiguous (a real homonym, or you cannot tell which section it belongs in).

Accepts one term or several in a single invocation.

## Workflow

1. **Read `CONTRIBUTING.md`** if it isn't already in context. It is the source of truth for format; this file is the source of truth for voice and process.
2. **Check the term isn't already there**, under any of its names. `grep -i '^### ' README.md`. Duplicates are a lint error. A term with a genuinely different second meaning gets its own entry, disambiguated in the heading (`Churn (code)` / `Churn (customer)`) — not a merged definition.
3. **Pick the section** — where the term is actually *heard*, not where it technically belongs. `Slopsquatting` is an attack, so it goes in Security & Trust even though it's about hallucination.
4. **Draft the entry** in the shape below.
5. **Check for undefined jargon.** If the definition leans on a term the glossary doesn't have, write that entry too, in the same change. Don't ship a definition a reader can't follow.
6. **Insert at the alphabetical slot.** Sort key is case-insensitive with punctuation and emoji stripped. Insert, never append.
7. **Run `node scripts/lint.ts`.** Fix every error. Warnings are judgment — usually fix, occasionally justify.
8. **Report**: section, slot, and the lint result. Show the entry.

## Entry shape

Exactly three blocks, blank-line separated, always in this order:

```markdown
### Term name

Prose definition. Two or three sentences. Four is the ceiling.

> "A quoted line of speech using the term."

**Related terms:** [Other term](#other-term), [Another](#another)
```

## Writing the definition

Two or three sentences. First says what it means; the rest says what it *signals* — tone, who says it, whether it's an insult, whether it's contested.

Include origin when it's short and known: coiner, paper, year. `Vibe coding` credits Karpathy, `Stochastic parrot` credits Bender/Gebru et al., `GPU-poor` credits the SemiAnalysis piece.

House voice is compressed and opinionated. It takes a position:

- Good: *"'Agentic' as adjective is doing enormous marketing work; ask what the loop actually does."*
- Good: *"Worth it for math, multi-step planning, and gnarly debugging; wasteful for 'rename this variable.'"*
- Bad: *"Optimized for complex math, coding, and multi-step logic by default."* — vendor copy. Reads generated. This exact sentence was in the file and got rewritten.

Never hedge with "can be used to", "is often considered", "generally refers to". State it.

**Do not name another glossary term in the definition.** Not as a link, not in plain prose. Every cross-reference belongs in the related terms row. This is a lint error (`definition/reference`), and it means writing around the connection rather than through it:

| Instead of | Write |
|---|---|
| "Retrieval layer under RAG." | "The retrieval layer underneath most grounding setups." |
| "a direct cause of context rot" | "the most common way to poison your own answer quality" |
| "The current answer to prompt injection." | "the only dependable defense against untrusted input steering an agent" |
| "Harsher 'nerfed'" | "Harsher than claiming a routine regression" |

The rewrite is usually better prose anyway — it forces the definition to stand on its own instead of borrowing meaning from a neighbour.

Two escape hatches, both narrow. The documented traps below are exempt, listed by name in `TRAP_EXEMPT` in `scripts/lint.ts`. And a term may use its *own* names freely — `Churn (code)` saying "rising churn" is fine.

**Don't lean on jargon the glossary doesn't define.** If the definition needs a term with no entry, write that entry in the same change. `Frontier model` once said "distinct from open-weight" while `Open-weight` didn't exist. The linter catches this against a watchlist (`LOAD_BEARING` in `scripts/lint.ts`) — extend that list when you hit a case it missed.

## Writing the usage blockquote

Required. One line, opening and closing double quote. Something a person would actually say in a standup, a PR comment, or a thread — not a definition wearing quote marks.

- Good: *"Tests are green because it deleted the assertion. Textbook reward hacking."*
- Good: *"It was SOTA for about nine days."*
- Bad: *"This term is used when a model produces incorrect output."* — that's the definition again.

Specifics carry it: a number, a tool, a concrete failure. Dollar figures, turn counts, line numbers.

## Choosing related terms

Two to four links. Pick genuine neighbours — a term that clarifies this one by contrast, the thing it causes, the thing it's confused with. Not a topic dump.

Link text must exactly match the target heading, and the anchor is its GitHub slug: lowercase, punctuation dropped, spaces to hyphens. A ` / ` in a heading becomes a double hyphen — `### Ship / shipped` → `#ship--shipped`. The linter checks both, so get them from the actual heading rather than typing from memory.

No repeats, no self-links — both are errors. Backlinks from the terms you cite are **not** required and not linted. Add one when it genuinely helps a reader going the other direction; skip it otherwise.

Since the definition can't name other terms, this row carries the entire cross-reference load. If something felt essential to say in the prose and you cut it, it belongs here.

## Traps

Some entries exist to flag a confusion, and they are the one exemption from the no-references rule — for these, naming the other term *is* the definition. Keep the contrast explicit rather than smoothing it over. Adding a new trap means adding its heading to `TRAP_EXEMPT` in `scripts/lint.ts`, and that list is not a convenience hatch for a sentence that read better with a reference in it.

- **cook / cooked / cracked** — same rough sound, three unrelated meanings.
- **one-shotted** vs the example-count sense of "shot" in zero-shot / few-shot.
- **model collapse** vs **mode collapse** — if you add the latter, state the contrast in both.

## What the linter does not check

`scripts/lint.ts` covers structure, ordering, anchors, cross-references, and banned patterns. Its own suite is `node --test scripts/lint.test.ts`; if you change a rule, add a fixture in `scripts/fixtures/`.

It cannot judge, and will happily pass, a bad entry:

- whether the section is the right one
- whether the definition is accurate or the attribution real
- whether the blockquote sounds like a person
- whether the related terms are meaningful

Those are yours. A green lint means well-formed, not good.
