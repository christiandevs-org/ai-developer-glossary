# TODO

## Lint rules — done

- ~~No related references in definition~~ → `definition/reference`, gating, with `TRAP_EXEMPT` for the documented traps. 22 existing definitions rewritten to comply.
- ~~Definition cannot use any undefined load-bearing term~~ → `definition/undefined`, gating, against the curated `LOAD_BEARING` watchlist in `scripts/lint.ts`. Extend that list as cases turn up.
- ~~No duplicate terms~~ → `heading/duplicate` and `heading/duplicate-alias`. Disambiguated headings (`Churn (code)` / `Churn (customer)`) share a bare name by design and are allowed., blast radius, green, scratchpad

## Docusaurus site is not generated yet

`README.md` is canonical. `website/docs/*.md` is meant to be **generated** from it — split one file per section, with frontmatter and cross-section links rewritten from `#anchor` into `section-file.md#anchor`.

That generator doesn't exist. Right now:

- `website/docs/building-and-ops.md` is hand-made and will drift from README as terms are added.
- The other five section pages are missing entirely: business-and-strategy, culture-and-vibes, model-behavior, prompting-and-context, security-and-trust.

Needed:

- [ ] `scripts/generate.ts` — README → `website/docs/*.md`, zero-dependency like `scripts/lint.ts`
- [ ] Rewrite cross-section anchors to `file.md#anchor`, leave same-section anchors bare
- [ ] Emit frontmatter: `sidebar_position`, `title` (with section emoji), `description`
- [ ] Backfill the five missing pages, replace the hand-made one
- [ ] Have `/add-term` run the generator after lint
- [ ] Consider a lint rule that fails when `website/docs` is out of sync with README

## Glossary

- [ ] Terms proposed and not yet written: Alignment, Subagent / multi-agent, Tracing / observability, Tool poisoning, Workslop
- [x] Mode collapse, Agent washing, Clanker — added 2026-07-31 via `/add-term`
- [ ] Decide whether `e/acc vs. doomer (decel)` should split into two entries — it's the one heading that packs two opposed terms into a single entry, against the disambiguation rule

## Follow-ups from the cross-reference change

- [ ] Re-read the 22 rewritten definitions with fresh eyes. Each dropped a cross-reference it used to lean on; most got tighter, but check `Lost in the middle` and `Overrefusal`, which lost their framing sentence ("specific failure inside context rot", "opposite failure mode of a jailbreak") rather than just a phrase.
- [ ] `LOAD_BEARING` is seeded with jargon that doesn't appear yet — it only fires on future writing. Add entries as real cases turn up, rather than trying to guess the list.
