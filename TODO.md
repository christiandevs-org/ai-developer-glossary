# TODO

## Lint rules — done

- ~~No related references in definition~~ → `definition/reference`, gating, with `TRAP_EXEMPT` for the documented traps. 22 existing definitions rewritten to comply.
- ~~Definition cannot use any undefined load-bearing term~~ → `definition/undefined`, gating, against the curated `LOAD_BEARING` watchlist in `scripts/lint.ts`. Extend that list as cases turn up.
- ~~No duplicate terms~~ → `heading/duplicate` and `heading/duplicate-alias`. Disambiguated headings (`Churn (code)` / `Churn (customer)`) share a bare name by design and are allowed.

## Docusaurus site

`README.md` is canonical. `website/generate-docs.ts` splits it into one page per section, rewrites cross-section anchors into `section-file.md#anchor`, and emits frontmatter plus a landing page. Output under `website/docs` is gitignored build output — never hand-edit it.

### Suspected bug: the two slugify functions disagree

**Unverified — read from the code, not reproduced. Confirm before fixing.**

`scripts/lint.ts` and `website/generate-docs.ts` each define their own `slugify`, and they differ on whitespace runs:

|                  | `lint.ts`              | `generate-docs.ts`             |
| ---------------- | ---------------------- | ------------------------------ |
| implementation   | `.replace(/\s/g, "-")` | `.trim().replace(/\s+/g, "-")` |
| `Ship / shipped` | `ship--shipped`        | `ship-shipped`                 |

Any heading containing `/` produces a different slug in each. The generator builds its term map with its own `slugify`, then looks up anchors taken verbatim from README — which carry GitHub's double-hyphen form. Those lookups should miss, hit the `!owningSlug` branch, and be left alone as "unknown", so **cross-section links to slash-headed terms silently never get rewritten** and 404 on the site.

Roughly a fifth of entries have a slash heading, including heavily-linked ones: `Agentic / agent loop`, `Fine-tune / distill / quantize`, `Thin wrapper / GPT wrapper`, `Zero-shot / few-shot`, `Slop / AI slop`.

- [ ] Reproduce: run the generator, grep the output for `](#agentic--agent-loop)` appearing in a file other than `building-and-ops.md`
- [ ] Fix by sharing one `slugify` rather than patching the copy — export it from `scripts/lint.ts` and import it in the generator, so the anchor rule has exactly one definition
- [ ] Add a lint rule, or a generator assertion, that fails when a rewritten link points at a file/anchor pair that doesn't exist
- [ ] Have `/add-term` run the generator after lint

## Glossary

- [ ] Terms proposed and not yet written: Alignment, Subagent / multi-agent, Tracing / observability, Tool poisoning, Workslop
- [x] Mode collapse, Agent washing, Clanker — added 2026-07-31 via `/add-term`
- [ ] Decide whether `e/acc vs. doomer (decel)` should split into two entries — it's the one heading that packs two opposed terms into a single entry, against the disambiguation rule

## Follow-ups from the cross-reference change

- [ ] Re-read the 22 rewritten definitions with fresh eyes. Each dropped a cross-reference it used to lean on; most got tighter, but check `Lost in the middle` and `Overrefusal`, which lost their framing sentence ("specific failure inside context rot", "opposite failure mode of a jailbreak") rather than just a phrase.
- [ ] `LOAD_BEARING` is seeded with jargon that doesn't appear yet — it only fires on future writing. Add entries as real cases turn up, rather than trying to guess the list.

- [ ] Add domain: rosetta.christiandevs.org
- [ ] Setup Github Page
- [ ] Wire up page generation
- [ ] Add new terms
- [ ] Delete TODO
- [ ] Re-write commits
- [ ] Add convention commits to CONTRIBUTING
- [ ] Combine churn using "doubles" - update docs.
- [ ] Add red to green.
- [ ] brand docusaurus
