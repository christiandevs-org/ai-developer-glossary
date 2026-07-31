import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const README_PATH = join(ROOT, "README.md");
const DOCS_DIR = join(__dirname, "docs");

type Section = {
  emoji: string;
  title: string;
  slug: string;
  content: string;
};

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const parseReadme = (markdown: string): Section[] => {
  const lines = markdown.split("\n");
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  let contentLines: string[] = [];
  const sectionHeaderRegex = /^## (.+)$/;
  const emojiRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)\s*/u;

  for (const line of lines) {
    const match = line.match(sectionHeaderRegex);
    if (match) {
      if (currentSection) {
        currentSection.content = contentLines.join("\n").trim();
        sections.push(currentSection);
      }

      const rawTitle = match[1].trim();
      const emojiMatch = rawTitle.match(emojiRegex);
      const emoji = emojiMatch ? emojiMatch[0].trim() : "";
      const title = emojiMatch ? rawTitle.slice(emojiMatch[0].length) : rawTitle;

      currentSection = {
        emoji,
        title,
        slug: slugify(title),
        content: "",
      };
      contentLines = [];
    } else if (currentSection) {
      contentLines.push(line);
    }
  }

  if (currentSection) {
    currentSection.content = contentLines.join("\n").trim();
    sections.push(currentSection);
  }

  return sections;
};

const rewriteRelatedTermLinks = (
  content: string,
  currentSlug: string,
  sectionTermMap: Map<string, string>
): string => {
  // Match markdown links like [Term name](#anchor)
  return content.replace(
    /\[([^\]]+)\]\(#([^)]+)\)/g,
    (_match, linkText: string, anchor: string) => {
      const owningSlug = sectionTermMap.get(anchor);

      if (!owningSlug || owningSlug === currentSlug) {
        // Same section or unknown — keep as-is
        return `[${linkText}](#${anchor})`;
      }

      // Cross-section — rewrite to relative path
      return `[${linkText}](${owningSlug}.md#${anchor})`;
    }
  );
};

const buildTermMap = (sections: Section[]): Map<string, string> => {
  const map = new Map<string, string>();
  const h3Regex = /^### (.+)$/gm;

  for (const section of sections) {
    let match;
    while ((match = h3Regex.exec(section.content)) !== null) {
      const termSlug = slugify(match[1]);
      map.set(termSlug, section.slug);
    }
  }

  return map;
};

const generateDocs = () => {
  const readme = readFileSync(README_PATH, "utf-8");
  const sections = parseReadme(readme);

  if (sections.length === 0) {
    console.error("No sections found in README.md");
    process.exit(1);
  }

  // Clean and recreate docs directory
  rmSync(DOCS_DIR, { recursive: true, force: true });
  mkdirSync(DOCS_DIR, { recursive: true });

  const termMap = buildTermMap(sections);

  // Generate landing page
  const indexContent = [
    "---",
    "sidebar_position: 0",
    'title: "AI Developer Glossary"',
    "slug: /",
    "---",
    "",
    "# AI Developer Glossary & Slang — Field Guide",
    "",
    "> A curated, community-driven guide to modern AI developer slang, LLM jargon, and engineering terminology. Updated continuously for devs, researchers, and builders working on the frontier.",
    "",
    "Use the **search bar** above to find any term, or browse by section:",
    "",
    ...sections.map(
      (s) => `- [${s.emoji} ${s.title}](${s.slug}.md)`
    ),
    "",
  ].join("\n");

  writeFileSync(join(DOCS_DIR, "index.md"), indexContent);
  console.log("  ✓ index.md (landing page)");

  for (const [index, section] of sections.entries()) {
    const rewrittenContent = rewriteRelatedTermLinks(
      section.content,
      section.slug,
      termMap
    );

    const frontmatter = [
      "---",
      `sidebar_position: ${index + 1}`,
      `title: "${section.emoji} ${section.title}"`,
      "---",
      "",
    ].join("\n");

    const fileContent = `${frontmatter}# ${section.emoji} ${section.title}\n\n${rewrittenContent}\n`;
    const filePath = join(DOCS_DIR, `${section.slug}.md`);

    writeFileSync(filePath, fileContent);
    console.log(`  ✓ ${section.slug}.md (${section.title})`);
  }

  console.log(`\nGenerated ${sections.length} doc pages from README.md`);
};

generateDocs();
