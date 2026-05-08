import { readJson, todayIso, writeJson } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import type { ArticleDraft } from "../src/lib/types.js";

async function updateDraft(): Promise<void> {
  const slug = process.argv[2];
  const note = process.argv[3] ?? "Draft updated for editorial review.";

  if (!slug) {
    throw new Error("Usage: tsx scripts/update_article_draft.ts <slug> [review-note]");
  }

  const draft = await readJson<ArticleDraft>(`data/drafts/${slug}.json`);
  const updated: ArticleDraft = {
    ...draft,
    status: "needs_review",
    humanReview: {
      ...draft.humanReview,
      required: true,
      notes: `${draft.humanReview.notes}\n${todayIso()}: ${note}`,
    },
    updatedAt: new Date().toISOString(),
  };

  await writeJson(`data/drafts/updates/${slug}-${todayIso()}.json`, updated);
  logger.info("Article draft update written", { slug });
}

await updateDraft();

