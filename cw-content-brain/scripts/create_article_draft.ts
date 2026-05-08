import { isDirectRun, readJson, todayIso, writeJson, writeText } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import { slugify } from "../src/lib/text.js";
import type { ArticleDraft, ContentType, RiskRating } from "../src/lib/types.js";

interface Templates {
  [key: string]: {
    sections: string[];
  };
}

interface DraftArgs {
  type: ContentType;
  keyword: string;
  topic: string;
  rating: RiskRating;
  notes: string;
  json: boolean;
}

export async function createArticleDraft(argv = process.argv.slice(2)): Promise<void> {
  const args = parseArgs(argv);
  const templates = await readJson<Templates>("config/article_templates.json");
  const template = templates[args.type] ?? templates.education_post;
  const now = new Date().toISOString();
  const slug = slugify(args.topic || args.keyword || "untitled-draft");

  const draft: ArticleDraft = {
    contentType: args.type,
    status: "needs_review",
    title: `${args.topic || "Untitled topic"}: draft review`,
    slug,
    summary: "Placeholder summary. Add verified evidence before publication.",
    audience: "general_reader",
    riskRating: args.rating,
    confidence: "low",
    keyFindings: ["Placeholder only. No evidence has been verified."],
    sections: template.sections.map((heading) => ({
      heading,
      body: "Placeholder only. Add source-backed analysis before publication.",
    })),
    sourceNotes: [
      {
        label: "Evidence required",
        url: "about:blank",
        retrievedAt: todayIso(),
        claim: "No evidence supplied. Do not publish without source review.",
        confidence: "low",
      },
    ],
    humanReview: {
      required: true,
      reviewer: "",
      notes: args.notes || "Draft only. Human review required.",
    },
    createdAt: now,
    updatedAt: now,
  };

  const markdown = renderMarkdownDraft(draft, args);
  await writeText(`data/drafts/${slug}.md`, markdown);

  if (args.json) {
    await writeJson(`data/drafts/${slug}.json`, draft);
  }

  logger.info("Article draft written", { slug, jsonCompanion: args.json });
}

function parseArgs(argv: string[]): DraftArgs {
  const values = new Map<string, string | boolean>();

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      values.set(key, true);
      continue;
    }

    values.set(key, next);
    index += 1;
  }

  return {
    type: String(values.get("type") ?? "education_post") as ContentType,
    keyword: String(values.get("keyword") ?? ""),
    topic: String(values.get("topic") ?? "Untitled topic"),
    rating: String(values.get("rating") ?? "not_applicable") as RiskRating,
    notes: String(values.get("notes") ?? ""),
    json: values.has("json"),
  };
}

function renderMarkdownDraft(draft: ArticleDraft, args: DraftArgs): string {
  return `# ${draft.title}

Status: ${draft.status}
Type: ${draft.contentType}
Keyword: ${args.keyword || "TBD"}
Risk rating: ${draft.riskRating}
Confidence: ${draft.confidence}

## Summary

${draft.summary}

## Editorial Notes

${args.notes || "Placeholder only. No editorial notes supplied."}

## Key Findings

${draft.keyFindings.map((finding) => `- ${finding}`).join("\n")}

${draft.sections.map((section) => `## ${section.heading}\n\n${section.body}`).join("\n\n")}

## Evidence Required

- Add primary sources, regulator records, platform documentation, or verifiable user evidence.
- Do not invent facts, dates, licenses, wallet addresses, or claims.
- Keep this draft out of publication until human review is complete.

## Human Review

Required: yes
Reviewer: TBD
Notes: ${draft.humanReview.notes}
`;
}

if (isDirectRun(import.meta.url)) {
  await createArticleDraft();
}
