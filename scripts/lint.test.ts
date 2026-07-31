/**
 * Tests for the glossary linter.
 *
 *   node --test scripts/
 *
 * Fixtures live in scripts/fixtures/. Each one is a small glossary that isolates
 * a rule or two. Assertions check which rule codes fire, not exact wording, so
 * message copy can be reworded without breaking the suite.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { lint, slugify, sortKey, aliases, isDisambiguated, countSentences } from "./lint.ts";
import type { Finding } from "./lint.ts";

const here = dirname(fileURLToPath(import.meta.url));

function run(fixture: string): Finding[] {
  return lint(readFileSync(join(here, "fixtures", `${fixture}.md`), "utf8"));
}

function rules(findings: Finding[]): string[] {
  return [...new Set(findings.map((f) => f.rule))].sort();
}

function errorRules(findings: Finding[]): string[] {
  return rules(findings.filter((f) => f.severity === "error"));
}

// --- helpers ----------------------------------------------------------------

test("slugify follows GitHub anchor rules", () => {
  assert.equal(slugify("Ship / shipped"), "ship--shipped");
  assert.equal(slugify('Cook / "let him cook"'), "cook--let-him-cook");
  assert.equal(slugify("e/acc vs. doomer (decel)"), "eacc-vs-doomer-decel");
  assert.equal(slugify("Human in the loop (HITL)"), "human-in-the-loop-hitl");
  assert.equal(slugify("LLM-as-judge"), "llm-as-judge");
});

test("sortKey ignores case, punctuation and emoji", () => {
  assert.equal(sortKey("🔥 Culture & Vibes"), "culture  vibes");
  // The documented tie-breaks from CONTRIBUTING.md.
  assert.ok(sortKey("Churn (code)") < sortKey("Churn (customer)"));
  assert.ok(sortKey('Cook / "let him cook"') < sortKey("Cooked"));
  assert.ok(sortKey("Cooked") < sortKey("Cracked"));
  assert.ok(sortKey("e/acc vs. doomer (decel)") < sortKey("Foot-gun"));
});

test("aliases split compound headings and keep acronyms only", () => {
  assert.deepEqual(aliases("Zero-shot / few-shot"), ["Zero-shot", "few-shot"]);
  assert.deepEqual(aliases("Human in the loop (HITL)"), ["HITL", "Human in the loop"]);
  assert.deepEqual(aliases("Chain of thought (CoT)"), ["CoT", "Chain of thought"]);
  // A disambiguator is not an alias — `Churn (code)` must not claim "code".
  assert.deepEqual(aliases("Churn (code)"), ["Churn"]);
  assert.deepEqual(aliases("Churn (customer)"), ["Churn"]);
});

test("isDisambiguated distinguishes disambiguators from acronyms", () => {
  assert.equal(isDisambiguated("Churn (code)"), true);
  assert.equal(isDisambiguated("e/acc vs. doomer (decel)"), true);
  assert.equal(isDisambiguated("Human in the loop (HITL)"), false);
  assert.equal(isDisambiguated("Moat"), false);
});

test("countSentences ignores abbreviation periods", () => {
  assert.equal(countSentences("One sentence."), 1);
  assert.equal(countSentences("Bender/Gebru et al. (2021). Two total."), 2);
  assert.equal(countSentences("Mollick et al. (2023). Capability is uneven. Third."), 3);
  assert.equal(countSentences("No terminator at all"), 1);
});

// --- fixtures ---------------------------------------------------------------

test("a well-formed glossary produces nothing", () => {
  const findings = run("clean");
  assert.deepEqual(findings, [], `expected clean, got ${JSON.stringify(findings, null, 2)}`);
});

test("clean fixture: disambiguated headings may share a bare name", () => {
  // Churn (code) / Churn (customer) is the sanctioned pattern, not a duplicate,
  // and each saying "churn" is not a reference to the other.
  const found = errorRules(run("clean"));
  assert.ok(!found.includes("heading/duplicate-alias"));
  assert.ok(!found.includes("definition/reference"));
});

test("structural defects are caught", () => {
  const found = errorRules(run("shape"));
  assert.ok(found.includes("definition/link"), "inline link in definition");
  assert.ok(found.includes("definition/bullets"), "bulleted definition");
  assert.ok(found.includes("quote/unquoted"), "blockquote is not a quoted utterance");
  assert.ok(found.includes("entry/shape"), "entry missing its blockquote");
  assert.ok(found.includes("related/anchor"), "anchor resolves to nothing");
  assert.ok(found.includes("related/label"), "link text does not match target");
  assert.ok(found.includes("related/self"), "entry links to itself");
  assert.ok(found.includes("related/duplicate"), "same anchor listed twice");
});

test("banned patterns fire, and only on real positional phrases", () => {
  const findings = run("banned");
  const found = errorRules(findings);
  assert.ok(found.includes("banned/positional"), '"sense above" must be caught');
  assert.ok(found.includes("banned/see-also"), '"See also" must be caught');

  // "sitting above user turns" is legitimate prose and must not trip the rule.
  const positional = findings.filter((f) => f.rule === "banned/positional");
  assert.equal(positional.length, 1, "only Alpha should be flagged, not Beta");
});

test("banned patterns are not masked by a shape failure", () => {
  // Beta in the shape fixture has no blockquote AND would otherwise be checked
  // for banned content; a shape error must not swallow the rest.
  const beta = run("shape").filter((f) => f.message.includes('"Beta"'));
  assert.ok(beta.some((f) => f.rule === "entry/shape"));
});

test("ordering violations are caught for both terms and sections", () => {
  const found = errorRules(run("ordering"));
  assert.ok(found.includes("order/term"), "Alpha sorts before Zebra");
  assert.ok(found.includes("order/section"), "Building & Ops sorts before Culture & Vibes");
});

test("duplicate headings are caught", () => {
  const found = errorRules(run("duplicates"));
  assert.ok(found.includes("heading/duplicate"), "two entries named Drift");
});

test("cross-references in definitions are caught, traps exempted", () => {
  const findings = run("reference");
  const found = errorRules(findings);
  assert.ok(found.includes("definition/reference"), "Alpha names Beta in prose");
  assert.ok(found.includes("definition/undefined"), "Beta leans on undefined RLHF");

  // Cooked is a documented trap: naming another term IS the entry.
  const trapped = findings.filter(
    (f) => f.rule === "definition/reference" && f.message.includes('"Cooked"'),
  );
  assert.deepEqual(trapped, [], "trap entries are exempt from definition/reference");
});

test("emoji placement is enforced in both directions", () => {
  const found = errorRules(run("emoji"));
  assert.ok(found.includes("section/emoji"), "section heading lost its emoji");
  assert.ok(found.includes("heading/emoji"), "term heading gained one");
  assert.ok(found.includes("section/unknown"), "section is not one of the six");
});

// --- the real thing ---------------------------------------------------------

test("README.md has no errors", () => {
  const findings = lint(readFileSync(join(here, "..", "README.md"), "utf8"));
  const errors = findings.filter((f) => f.severity === "error");
  assert.deepEqual(
    errors,
    [],
    `README.md must stay clean:\n${errors.map((e) => `  ${e.line} [${e.rule}] ${e.message}`).join("\n")}`,
  );
});
