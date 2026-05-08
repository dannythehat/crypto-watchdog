import { readJson, todayIso, writeJson } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import { slugify } from "../src/lib/text.js";
import type { ArticleDraft, ContentType } from "../src/lib/types.js";

interface Templates {
  [key: string]: {
    sections: string[];
  };
}

async function createDraft(): Promise<void> {
  const title = process.argv[2] ?? "Untitled CryptoWatchdog Draft";
  const contentType = (process.argv[3] ?? "education_post") as ContentType;
  const templates = await readJson<Templates>("config/article_templates.json");
  const template = templates[contentType] ?? templates.education_post;
  const now = new Date().toISOString();
  const slug = slugify(title);

  const draft: ArticleDraft = {
    contentType,
    status: "needs_review",
    title,
    slug,
    summary: "Draft summary pending human research and source review.",
    audience: "general_reader",
    riskRating: contentType === "education_post" ? "not_applicable" : "orange",
    confidence: "low",
    keyFindings: ["Add evidence-led findings before publication."],
    sections: template.sections.map((heading) => ({
      heading,
      body: "Draft section pending research.",
    })),
    sourceNotes: [
      {
        label: "Research needed",
        url: "about:blank",
        retrievedAt: todayIso(),
        claim: "No external source has been attached yet.",
        confidence: "low",
      },
    ],
    humanReview: {
      required: true,
      reviewer: "",
      notes: "Created by Phase 1 draft tool. Requires research, source review, and editorial approval.",
    },
    createdAt: now,
    updatedAt: now,
  };

  await writeJson(`data/drafts/${slug}.json`, draft);
  logger.info("Article draft written", { slug, contentType });
}

await createDraft();

