import { query, transaction, DbClient } from "../db";
import { revalidatePath } from "next/cache";
import path from "path";
import fs from "fs";

function safeRevalidatePath(targetPath: string, type?: "page" | "layout") {
  try {
    safeRevalidatePath(targetPath, type);
  } catch {
    // Ignored in non-Next.js server contexts (e.g. tests and scripts)
  }
}

export interface DashboardStats {
  counts: {
    publishedResources: number;
    draftResources: number;
    publishedChapters: number;
    draftChapters: number;
    publishedPaths: number;
    draftPaths: number;
    topicsCount: number;
    assetsCount: number;
  };
  recentEdits: Array<{
    id: string;
    type: "resource" | "chapter" | "path" | "topic" | "page";
    title: string;
    status: string;
    updated_at: string;
    has_draft_changes: boolean;
  }>;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    resStats,
    chapStats,
    pathStats,
    topicStats,
    assetStats,
    recentRes,
    recentPaths,
  ] = await Promise.all([
    query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'published') as published,
        COUNT(*) FILTER (WHERE status != 'published' OR has_draft_changes = TRUE) as drafts
      FROM resources
    `),
    query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'published') as published,
        COUNT(*) FILTER (WHERE status != 'published' OR has_draft_changes = TRUE) as drafts
      FROM chapters
    `),
    query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'published') as published,
        COUNT(*) FILTER (WHERE status != 'published' OR has_draft_changes = TRUE) as drafts
      FROM learning_paths
    `),
    query("SELECT COUNT(*) as count FROM topics"),
    query("SELECT COUNT(*) as count FROM assets"),
    query(`
      SELECT id, title, status, updated_at, has_draft_changes 
      FROM resources 
      ORDER BY updated_at DESC LIMIT 5
    `),
    query(`
      SELECT id, title, status, updated_at, has_draft_changes 
      FROM learning_paths 
      ORDER BY updated_at DESC LIMIT 5
    `),
  ]);

  const recentEdits = [
    ...recentRes.rows.map((r) => ({
      id: r.id,
      type: "resource" as const,
      title: r.title,
      status: r.status,
      updated_at: r.updated_at,
      has_draft_changes: Boolean(r.has_draft_changes),
    })),
    ...recentPaths.rows.map((p) => ({
      id: p.id,
      type: "path" as const,
      title: p.title,
      status: p.status,
      updated_at: p.updated_at,
      has_draft_changes: Boolean(p.has_draft_changes),
    })),
  ].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 8);

  return {
    counts: {
      publishedResources: parseInt(resStats.rows[0]?.published || "0", 10),
      draftResources: parseInt(resStats.rows[0]?.drafts || "0", 10),
      publishedChapters: parseInt(chapStats.rows[0]?.published || "0", 10),
      draftChapters: parseInt(chapStats.rows[0]?.drafts || "0", 10),
      publishedPaths: parseInt(pathStats.rows[0]?.published || "0", 10),
      draftPaths: parseInt(pathStats.rows[0]?.drafts || "0", 10),
      topicsCount: parseInt(topicStats.rows[0]?.count || "0", 10),
      assetsCount: parseInt(assetStats.rows[0]?.count || "0", 10),
    },
    recentEdits,
  };
}

/* =========================================================================
   TOPICS
   ========================================================================= */

export async function getAllTopicsAdmin() {
  const res = await query(`
    SELECT t.*, 
           COUNT(r.id) as resource_count,
           COUNT(r.id) FILTER (WHERE r.status = 'published') as published_resource_count
    FROM topics t
    LEFT JOIN resources r ON r.topic_id = t.id
    GROUP BY t.id
    ORDER BY t.display_order ASC
  `);
  return res.rows;
}

export async function createTopicAdmin(data: {
  slug: string;
  name: string;
  description: string;
  icon: string;
  display_order: number;
  is_visible: boolean;
}) {
  const existing = await query("SELECT id FROM topics WHERE slug = $1", [data.slug]);
  if (existing.rows.length > 0) {
    throw new Error(`Topic with slug "${data.slug}" already exists`);
  }

  const id = `topic-${data.slug.replace(/[^a-z0-9]/g, "-")}`;
  await query(
    `INSERT INTO topics (
      id, slug, name, description, icon, display_order, is_visible, status,
      draft_name, draft_description, draft_icon, draft_display_order, draft_is_visible, has_draft_changes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'published', $3, $4, $5, $6, $7, FALSE)`,
    [
      id,
      data.slug,
      data.name,
      data.description,
      data.icon,
      data.display_order || 0,
      data.is_visible !== false,
    ]
  );

  safeRevalidatePath("/");
  safeRevalidatePath(`/topics/${data.slug}`);
  return { id, slug: data.slug };
}

export async function updateTopicAdmin(
  id: string,
  data: {
    slug?: string;
    name?: string;
    description?: string;
    icon?: string;
    display_order?: number;
    is_visible?: boolean;
    publish?: boolean;
  }
) {
  const current = await query("SELECT * FROM topics WHERE id = $1", [id]);
  if (current.rows.length === 0) throw new Error("Topic not found");
  const row = current.rows[0];

  if (data.slug && data.slug !== row.slug) {
    const slugCheck = await query("SELECT id FROM topics WHERE slug = $1 AND id != $2", [data.slug, id]);
    if (slugCheck.rows.length > 0) throw new Error(`Slug "${data.slug}" is already in use`);
  }

  const newSlug = data.slug || row.slug;
  const newName = data.name !== undefined ? data.name : row.draft_name || row.name;
  const newDesc = data.description !== undefined ? data.description : row.draft_description || row.description;
  const newIcon = data.icon !== undefined ? data.icon : row.draft_icon || row.icon;
  const newOrder = data.display_order !== undefined ? data.display_order : row.draft_display_order || row.display_order;
  const newVisible = data.is_visible !== undefined ? data.is_visible : row.draft_is_visible !== null ? row.draft_is_visible : row.is_visible;

  if (data.publish) {
    await query(
      `UPDATE topics SET
        slug = $1, name = $2, description = $3, icon = $4, display_order = $5, is_visible = $6,
        draft_name = $2, draft_description = $3, draft_icon = $4, draft_display_order = $5, draft_is_visible = $6,
        has_draft_changes = FALSE, status = 'published', updated_at = CURRENT_TIMESTAMP
       WHERE id = $7`,
      [newSlug, newName, newDesc, newIcon, newOrder, newVisible, id]
    );
  } else {
    await query(
      `UPDATE topics SET
        slug = $1, draft_name = $2, draft_description = $3, draft_icon = $4, draft_display_order = $5, draft_is_visible = $6,
        has_draft_changes = TRUE, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7`,
      [newSlug, newName, newDesc, newIcon, newOrder, newVisible, id]
    );
  }

  safeRevalidatePath("/");
  safeRevalidatePath(`/topics/${newSlug}`);
  return { id, slug: newSlug };
}

export async function deleteTopicAdmin(id: string) {
  // Check dependencies: published or draft resources using this topic
  const deps = await query("SELECT id, title, status FROM resources WHERE topic_id = $1", [id]);
  if (deps.rows.length > 0) {
    const resourceTitles = deps.rows.map((r) => `"${r.title}" (${r.status})`).join(", ");
    throw new Error(
      `Cannot delete topic because it is referenced by ${deps.rows.length} resource(s): ${resourceTitles}. Reassign or remove these resources first.`
    );
  }

  await query("DELETE FROM topics WHERE id = $1", [id]);
  safeRevalidatePath("/");
}

/* =========================================================================
   RESOURCES
   ========================================================================= */

export async function getAllResourcesAdmin() {
  const res = await query(`
    SELECT r.*, t.name as topic_name, t.slug as topic_slug,
           (SELECT COUNT(*) FROM chapters c WHERE c.resource_id = r.id) as chapter_count,
           a.original_name as asset_name
    FROM resources r
    JOIN topics t ON r.topic_id = t.id
    LEFT JOIN assets a ON r.download_asset_id = a.id
    ORDER BY r.updated_at DESC
  `);
  return res.rows;
}

export async function getResourceAdminById(id: string) {
  const res = await query(
    `SELECT r.*, t.name as topic_name, t.slug as topic_slug,
            a.original_name as asset_name, a.public_url as asset_url
     FROM resources r
     JOIN topics t ON r.topic_id = t.id
     LEFT JOIN assets a ON r.download_asset_id = a.id
     WHERE r.id = $1`,
    [id]
  );
  if (res.rows.length === 0) return null;
  return res.rows[0];
}

export async function createResourceAdmin(data: {
  slug: string;
  title: string;
  summary: string;
  description_markdown: string;
  type: string;
  difficulty: string;
  topic_id: string;
  tags?: string[];
  source_url?: string;
  curation_note?: string;
  download_asset_id?: string | null;
  featured_order?: number | null;
  publishImmediately?: boolean;
}) {
  // Validate duplicate slug
  const existing = await query("SELECT id FROM resources WHERE slug = $1", [data.slug]);
  if (existing.rows.length > 0) {
    throw new Error(`Resource with slug "${data.slug}" already exists`);
  }

  // Validate topic exists
  const topicCheck = await query("SELECT id FROM topics WHERE id = $1", [data.topic_id]);
  if (topicCheck.rows.length === 0) {
    throw new Error("Specified topic does not exist");
  }

  // Validate asset if specified
  if (data.download_asset_id) {
    const assetCheck = await query("SELECT id FROM assets WHERE id = $1", [data.download_asset_id]);
    if (assetCheck.rows.length === 0) {
      throw new Error("Specified download asset does not exist");
    }
  }

  const id = `res-${Date.now()}`;
  const status = data.publishImmediately ? "published" : "draft";
  const publishedAt = data.publishImmediately ? new Date().toISOString() : null;
  const tagsJson = JSON.stringify(data.tags || []);

  await query(
    `INSERT INTO resources (
      id, slug, title, summary, description_markdown, type, difficulty,
      topic_id, tags, source_url, curation_note, download_asset_id, featured_order,
      status, published_at,
      draft_title, draft_summary, draft_description_markdown, draft_type, draft_difficulty,
      draft_topic_id, draft_tags, draft_source_url, draft_curation_note, draft_download_asset_id,
      draft_featured_order, has_draft_changes
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13,
      $14, $15,
      $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13, FALSE
    )`,
    [
      id,
      data.slug,
      data.title,
      data.summary,
      data.description_markdown,
      data.type,
      data.difficulty,
      data.topic_id,
      tagsJson,
      data.source_url || null,
      data.curation_note || null,
      data.download_asset_id || null,
      data.featured_order !== undefined ? data.featured_order : null,
      status,
      publishedAt,
    ]
  );

  safeRevalidatePath("/");
  safeRevalidatePath(`/resources/${data.slug}`);
  return { id, slug: data.slug };
}

export async function saveResourceDraftAdmin(
  id: string,
  data: {
    slug?: string;
    title?: string;
    summary?: string;
    description_markdown?: string;
    type?: string;
    difficulty?: string;
    topic_id?: string;
    tags?: string[];
    source_url?: string;
    curation_note?: string;
    download_asset_id?: string | null;
    featured_order?: number | null;
  }
) {
  const current = await query("SELECT * FROM resources WHERE id = $1", [id]);
  if (current.rows.length === 0) throw new Error("Resource not found");
  const row = current.rows[0];

  if (data.slug && data.slug !== row.slug) {
    const slugCheck = await query("SELECT id FROM resources WHERE slug = $1 AND id != $2", [data.slug, id]);
    if (slugCheck.rows.length > 0) throw new Error(`Slug "${data.slug}" is already in use`);
  }

  const newSlug = data.slug || row.slug;
  const draftTitle = data.title !== undefined ? data.title : row.draft_title || row.title;
  const draftSummary = data.summary !== undefined ? data.summary : row.draft_summary || row.summary;
  const draftDesc = data.description_markdown !== undefined ? data.description_markdown : row.draft_description_markdown || row.description_markdown;
  const draftType = data.type !== undefined ? data.type : row.draft_type || row.type;
  const draftDiff = data.difficulty !== undefined ? data.difficulty : row.draft_difficulty || row.difficulty;
  const draftTopic = data.topic_id !== undefined ? data.topic_id : row.draft_topic_id || row.topic_id;
  const draftTags = data.tags !== undefined ? JSON.stringify(data.tags) : JSON.stringify(row.draft_tags || row.tags || []);
  const draftSource = data.source_url !== undefined ? data.source_url : row.draft_source_url || row.source_url;
  const draftCuration = data.curation_note !== undefined ? data.curation_note : row.draft_curation_note || row.curation_note;
  const draftAsset = data.download_asset_id !== undefined ? data.download_asset_id : row.draft_download_asset_id || row.download_asset_id;
  const draftFeatured = data.featured_order !== undefined ? data.featured_order : row.draft_featured_order || row.featured_order;

  await query(
    `UPDATE resources SET
      slug = $1,
      draft_title = $2,
      draft_summary = $3,
      draft_description_markdown = $4,
      draft_type = $5,
      draft_difficulty = $6,
      draft_topic_id = $7,
      draft_tags = $8,
      draft_source_url = $9,
      draft_curation_note = $10,
      draft_download_asset_id = $11,
      draft_featured_order = $12,
      has_draft_changes = TRUE,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = $13`,
    [
      newSlug,
      draftTitle,
      draftSummary,
      draftDesc,
      draftType,
      draftDiff,
      draftTopic,
      draftTags,
      draftSource,
      draftCuration,
      draftAsset,
      draftFeatured,
      id,
    ]
  );

  return { id, slug: newSlug };
}

export async function publishResourceAdmin(id: string) {
  const current = await query("SELECT * FROM resources WHERE id = $1", [id]);
  if (current.rows.length === 0) throw new Error("Resource not found");
  const row = current.rows[0];

  // Validation before publishing:
  const titleToPublish = row.draft_title || row.title;
  const summaryToPublish = row.draft_summary || row.summary;
  const topicToPublish = row.draft_topic_id || row.topic_id;
  const assetToPublish = row.draft_download_asset_id || row.download_asset_id;

  if (!titleToPublish || !titleToPublish.trim()) throw new Error("Resource title is required before publishing");
  if (!summaryToPublish || !summaryToPublish.trim()) throw new Error("Resource summary is required before publishing");

  // Verify topic is available and published
  const topicCheck = await query("SELECT id, status FROM topics WHERE id = $1", [topicToPublish]);
  if (topicCheck.rows.length === 0 || topicCheck.rows[0].status !== "published") {
    throw new Error("Cannot publish resource because its assigned topic is not published");
  }

  // Verify download asset exists if assigned
  if (assetToPublish) {
    const assetCheck = await query("SELECT id, storage_path FROM assets WHERE id = $1", [assetToPublish]);
    if (assetCheck.rows.length === 0) {
      throw new Error("Cannot publish resource with non-existent download asset");
    }
  }

  // Atomically copy draft fields to live published fields
  await query(
    `UPDATE resources SET
      title = COALESCE(draft_title, title),
      summary = COALESCE(draft_summary, summary),
      description_markdown = COALESCE(draft_description_markdown, description_markdown),
      type = COALESCE(draft_type, type),
      difficulty = COALESCE(draft_difficulty, difficulty),
      topic_id = COALESCE(draft_topic_id, topic_id),
      tags = COALESCE(draft_tags, tags),
      source_url = draft_source_url,
      curation_note = draft_curation_note,
      download_asset_id = draft_download_asset_id,
      featured_order = draft_featured_order,
      has_draft_changes = FALSE,
      status = 'published',
      published_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [id]
  );

  safeRevalidatePath("/");
  safeRevalidatePath(`/resources/${row.slug}`);
  safeRevalidatePath("/paths");
  return { id, slug: row.slug, status: "published" };
}

export async function unpublishResourceAdmin(id: string) {
  // Check if any published learning paths depend on this resource
  const deps = await query(
    `SELECT lp.title, lp.slug 
     FROM learning_path_steps lps
     JOIN learning_paths lp ON lps.path_id = lp.id
     WHERE lps.resource_id = $1 AND lp.status = 'published'`,
    [id]
  );

  if (deps.rows.length > 0) {
    const pathsList = deps.rows.map((p) => `"${p.title}"`).join(", ");
    throw new Error(
      `Cannot unpublish this resource because it is required by published learning path(s): ${pathsList}. Unpublish or update those paths first.`
    );
  }

  await query(
    "UPDATE resources SET status = 'draft', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
    [id]
  );

  const row = (await query("SELECT slug FROM resources WHERE id = $1", [id])).rows[0];
  safeRevalidatePath("/");
  if (row?.slug) safeRevalidatePath(`/resources/${row.slug}`);
}

export async function deleteResourceAdmin(id: string) {
  // Check dependencies
  const pathDeps = await query(
    `SELECT lp.title, lp.status FROM learning_path_steps lps
     JOIN learning_paths lp ON lps.path_id = lp.id
     WHERE lps.resource_id = $1`,
    [id]
  );

  if (pathDeps.rows.length > 0) {
    const names = pathDeps.rows.map((p) => `"${p.title}" (${p.status})`).join(", ");
    throw new Error(
      `Cannot delete resource because it is referenced in learning path steps: ${names}. Remove the reference from learning paths first.`
    );
  }

  const row = (await query("SELECT slug FROM resources WHERE id = $1", [id])).rows[0];
  await query("DELETE FROM resources WHERE id = $1", [id]);

  safeRevalidatePath("/");
  if (row?.slug) safeRevalidatePath(`/resources/${row.slug}`);
}

/* =========================================================================
   CHAPTERS
   ========================================================================= */

export async function getChaptersForResourceAdmin(resourceId: string) {
  const res = await query(
    "SELECT * FROM chapters WHERE resource_id = $1 ORDER BY chapter_order ASC",
    [resourceId]
  );
  return res.rows;
}

export async function createChapterAdmin(data: {
  resource_id: string;
  slug: string;
  title: string;
  chapter_order: number;
  content_markdown: string;
  publishImmediately?: boolean;
}) {
  const existing = await query(
    "SELECT id FROM chapters WHERE resource_id = $1 AND slug = $2",
    [data.resource_id, data.slug]
  );
  if (existing.rows.length > 0) {
    throw new Error(`Chapter slug "${data.slug}" already exists for this resource`);
  }

  const id = `ch-${Date.now()}`;
  const status = data.publishImmediately ? "published" : "draft";

  await query(
    `INSERT INTO chapters (
      id, resource_id, slug, title, chapter_order, content_markdown,
      status, draft_title, draft_content_markdown, draft_chapter_order, has_draft_changes
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $4, $6, $5, FALSE
    )`,
    [
      id,
      data.resource_id,
      data.slug,
      data.title,
      data.chapter_order,
      data.content_markdown,
      status,
    ]
  );

  const res = await query("SELECT slug FROM resources WHERE id = $1", [data.resource_id]);
  if (res.rows.length > 0) {
    safeRevalidatePath(`/resources/${res.rows[0].slug}`);
    safeRevalidatePath(`/resources/${res.rows[0].slug}/${data.slug}`);
  }

  return { id, slug: data.slug };
}

export async function updateChapterDraftAdmin(
  id: string,
  data: {
    slug?: string;
    title?: string;
    chapter_order?: number;
    content_markdown?: string;
    publish?: boolean;
  }
) {
  const current = await query("SELECT * FROM chapters WHERE id = $1", [id]);
  if (current.rows.length === 0) throw new Error("Chapter not found");
  const row = current.rows[0];

  const newSlug = data.slug || row.slug;
  const newTitle = data.title !== undefined ? data.title : row.draft_title || row.title;
  const newOrder = data.chapter_order !== undefined ? data.chapter_order : row.draft_chapter_order || row.chapter_order;
  const newContent = data.content_markdown !== undefined ? data.content_markdown : row.draft_content_markdown || row.content_markdown;

  if (data.publish) {
    await query(
      `UPDATE chapters SET
        slug = $1, title = $2, chapter_order = $3, content_markdown = $4,
        draft_title = $2, draft_chapter_order = $3, draft_content_markdown = $4,
        has_draft_changes = FALSE, status = 'published', updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [newSlug, newTitle, newOrder, newContent, id]
    );
  } else {
    await query(
      `UPDATE chapters SET
        slug = $1, draft_title = $2, draft_chapter_order = $3, draft_content_markdown = $4,
        has_draft_changes = TRUE, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [newSlug, newTitle, newOrder, newContent, id]
    );
  }

  const res = await query("SELECT slug FROM resources WHERE id = $1", [row.resource_id]);
  if (res.rows.length > 0) {
    safeRevalidatePath(`/resources/${res.rows[0].slug}`);
    safeRevalidatePath(`/resources/${res.rows[0].slug}/${newSlug}`);
  }

  return { id, slug: newSlug };
}

export async function deleteChapterAdmin(id: string) {
  const ch = await query("SELECT resource_id, slug FROM chapters WHERE id = $1", [id]);
  if (ch.rows.length === 0) return;
  const { resource_id, slug } = ch.rows[0];

  await query("DELETE FROM chapters WHERE id = $1", [id]);

  const res = await query("SELECT slug FROM resources WHERE id = $1", [resource_id]);
  if (res.rows.length > 0) {
    safeRevalidatePath(`/resources/${res.rows[0].slug}`);
    safeRevalidatePath(`/resources/${res.rows[0].slug}/${slug}`);
  }
}

/* =========================================================================
   LEARNING PATHS
   ========================================================================= */

export async function getAllLearningPathsAdmin() {
  const res = await query(`
    SELECT lp.*, t.name as topic_name,
           (SELECT COUNT(*) FROM learning_path_steps s WHERE s.path_id = lp.id) as step_count
    FROM learning_paths lp
    LEFT JOIN topics t ON lp.topic_id = t.id
    ORDER BY lp.featured_order ASC NULLS LAST, lp.updated_at DESC
  `);
  return res.rows;
}

export async function getLearningPathAdminById(id: string) {
  const res = await query(
    `SELECT lp.*, t.name as topic_name
     FROM learning_paths lp
     LEFT JOIN topics t ON lp.topic_id = t.id
     WHERE lp.id = $1`,
    [id]
  );
  if (res.rows.length === 0) return null;

  const steps = await query(
    `SELECT s.*, r.title as resource_title, r.slug as resource_slug
     FROM learning_path_steps s
     LEFT JOIN resources r ON s.resource_id = r.id
     WHERE s.path_id = $1
     ORDER BY s.step_order ASC`,
    [id]
  );

  return { ...res.rows[0], steps: steps.rows };
}

export async function saveLearningPathDraftAdmin(
  id: string,
  data: {
    slug?: string;
    title?: string;
    summary?: string;
    outcome?: string;
    prerequisites?: string[];
    final_task_title?: string;
    final_task_description?: string;
    topic_id?: string;
    featured_order?: number | null;
    steps?: Array<{
      id?: string;
      step_order: number;
      title: string;
      description: string;
      resource_id?: string | null;
      external_url?: string | null;
      estimated_minutes?: number;
    }>;
  }
) {
  const current = await query("SELECT * FROM learning_paths WHERE id = $1", [id]);
  if (current.rows.length === 0) throw new Error("Learning path not found");
  const row = current.rows[0];

  const newSlug = data.slug || row.slug;
  const draftTitle = data.title !== undefined ? data.title : row.draft_title || row.title;
  const draftSummary = data.summary !== undefined ? data.summary : row.draft_summary || row.summary;
  const draftOutcome = data.outcome !== undefined ? data.outcome : row.draft_outcome || row.outcome;
  const draftPrereq = data.prerequisites !== undefined ? JSON.stringify(data.prerequisites) : JSON.stringify(row.draft_prerequisites || row.prerequisites || []);
  const draftTaskTitle = data.final_task_title !== undefined ? data.final_task_title : row.draft_final_task_title || row.final_task_title;
  const draftTaskDesc = data.final_task_description !== undefined ? data.final_task_description : row.draft_final_task_description || row.final_task_description;
  const draftTopic = data.topic_id !== undefined ? data.topic_id : row.draft_topic_id || row.topic_id;
  const draftFeatured = data.featured_order !== undefined ? data.featured_order : row.draft_featured_order || row.featured_order;

  await query(
    `UPDATE learning_paths SET
      slug = $1,
      draft_title = $2,
      draft_summary = $3,
      draft_outcome = $4,
      draft_prerequisites = $5,
      draft_final_task_title = $6,
      draft_final_task_description = $7,
      draft_topic_id = $8,
      draft_featured_order = $9,
      has_draft_changes = TRUE,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = $10`,
    [
      newSlug,
      draftTitle,
      draftSummary,
      draftOutcome,
      draftPrereq,
      draftTaskTitle,
      draftTaskDesc,
      draftTopic,
      draftFeatured,
      id,
    ]
  );

  // If steps were supplied, update steps
  if (data.steps) {
    await query("DELETE FROM learning_path_steps WHERE path_id = $1", [id]);
    for (const step of data.steps) {
      await query(
        `INSERT INTO learning_path_steps (
          id, path_id, step_order, title, description, resource_id, external_url, estimated_minutes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          step.id || `step-${Date.now()}-${step.step_order}`,
          id,
          step.step_order,
          step.title,
          step.description,
          step.resource_id || null,
          step.external_url || null,
          step.estimated_minutes || 30,
        ]
      );
    }
  }

  return { id, slug: newSlug };
}

export async function publishLearningPathAdmin(id: string) {
  const current = await query("SELECT * FROM learning_paths WHERE id = $1", [id]);
  if (current.rows.length === 0) throw new Error("Learning path not found");
  const row = current.rows[0];

  // Validation: ensure steps exist
  const steps = await query("SELECT id, resource_id FROM learning_path_steps WHERE path_id = $1", [id]);
  if (steps.rows.length === 0) {
    throw new Error("Cannot publish a learning path without at least one step");
  }

  // Ensure any attached resource is published
  for (const step of steps.rows) {
    if (step.resource_id) {
      const r = await query("SELECT status, title FROM resources WHERE id = $1", [step.resource_id]);
      if (r.rows.length === 0 || r.rows[0].status !== "published") {
        throw new Error(
          `Cannot publish path because step references an unpublished resource "${r.rows[0]?.title || step.resource_id}". Publish the resource first.`
        );
      }
    }
  }

  await query(
    `UPDATE learning_paths SET
      title = COALESCE(draft_title, title),
      summary = COALESCE(draft_summary, summary),
      outcome = COALESCE(draft_outcome, outcome),
      prerequisites = COALESCE(draft_prerequisites, prerequisites),
      final_task_title = COALESCE(draft_final_task_title, final_task_title),
      final_task_description = COALESCE(draft_final_task_description, final_task_description),
      topic_id = COALESCE(draft_topic_id, topic_id),
      featured_order = draft_featured_order,
      has_draft_changes = FALSE,
      status = 'published',
      updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [id]
  );

  safeRevalidatePath("/");
  safeRevalidatePath("/paths");
  safeRevalidatePath(`/paths/${row.slug}`);
  return { id, slug: row.slug, status: "published" };
}

export async function unpublishLearningPathAdmin(id: string) {
  await query("UPDATE learning_paths SET status = 'draft', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [id]);
  const row = (await query("SELECT slug FROM learning_paths WHERE id = $1", [id])).rows[0];
  safeRevalidatePath("/");
  safeRevalidatePath("/paths");
  if (row?.slug) safeRevalidatePath(`/paths/${row.slug}`);
}

/* =========================================================================
   PAGES (Explore Homepage & About Page)
   ========================================================================= */

export async function getPageAdmin(key: string) {
  const res = await query("SELECT * FROM pages WHERE key = $1", [key]);
  if (res.rows.length === 0) return null;
  const row = res.rows[0];
  return {
    key: row.key,
    title: row.title,
    published_content: typeof row.published_content === "string" ? JSON.parse(row.published_content) : row.published_content,
    draft_content: typeof row.draft_content === "string" ? JSON.parse(row.draft_content) : row.draft_content,
    has_draft_changes: Boolean(row.has_draft_changes),
    status: row.status,
    updated_at: row.updated_at,
  };
}

export async function savePageDraftAdmin(key: string, draftContent: any) {
  const contentJson = JSON.stringify(draftContent);
  await query(
    `UPDATE pages SET
      draft_content = $1,
      has_draft_changes = TRUE,
      updated_at = CURRENT_TIMESTAMP
     WHERE key = $2`,
    [contentJson, key]
  );
  return { key, success: true };
}

export async function publishPageAdmin(key: string) {
  const current = await query("SELECT draft_content FROM pages WHERE key = $1", [key]);
  if (current.rows.length === 0) throw new Error("Page not found");

  // Keep last published live until publish button is pressed
  await query(
    `UPDATE pages SET
      published_content = draft_content,
      has_draft_changes = FALSE,
      status = 'published',
      updated_at = CURRENT_TIMESTAMP
     WHERE key = $1`,
    [key]
  );

  if (key === "explore") safeRevalidatePath("/");
  if (key === "about") safeRevalidatePath("/about");
  return { key, status: "published" };
}

export async function discardPageDraftAdmin(key: string) {
  await query(
    `UPDATE pages SET
      draft_content = published_content,
      has_draft_changes = FALSE,
      updated_at = CURRENT_TIMESTAMP
     WHERE key = $1`,
    [key]
  );
  return { key, success: true };
}

/* =========================================================================
   NAVIGATION & FOOTER
   ========================================================================= */

export async function getAllNavigationAdmin() {
  const res = await query("SELECT * FROM navigation_items ORDER BY display_order ASC");
  return res.rows;
}

export async function saveNavigationItemAdmin(data: {
  id?: string;
  label: string;
  url: string;
  display_order: number;
  position: "header" | "footer" | "both";
  is_published?: boolean;
}) {
  if (data.id) {
    await query(
      `UPDATE navigation_items SET
        label = $1, url = $2, display_order = $3, position = $4,
        is_published = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [data.label, data.url, data.display_order, data.position, data.is_published !== false, data.id]
    );
    safeRevalidatePath("/", "layout");
    return { id: data.id };
  } else {
    const id = `nav-${Date.now()}`;
    await query(
      `INSERT INTO navigation_items (id, label, url, display_order, position, is_published)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, data.label, data.url, data.display_order, data.position, data.is_published !== false]
    );
    safeRevalidatePath("/", "layout");
    return { id };
  }
}

export async function deleteNavigationItemAdmin(id: string) {
  await query("DELETE FROM navigation_items WHERE id = $1", [id]);
  safeRevalidatePath("/", "layout");
}

/* =========================================================================
   MEDIA & DOWNLOAD ASSETS
   ========================================================================= */

export async function getAllAssetsAdmin() {
  const res = await query(`
    SELECT a.*,
      (SELECT COUNT(*) FROM resources r WHERE r.download_asset_id = a.id) as used_in_published_resources,
      (SELECT COUNT(*) FROM resources r WHERE r.draft_download_asset_id = a.id) as used_in_draft_resources
    FROM assets a
    ORDER BY a.created_at DESC
  `);
  return res.rows;
}

export async function checkAssetDependencies(assetId: string): Promise<{
  canDelete: boolean;
  usedInPublished: Array<{ id: string; title: string; slug: string }>;
  usedInDraft: Array<{ id: string; title: string; slug: string }>;
}> {
  const publishedRes = await query(
    "SELECT id, title, slug FROM resources WHERE download_asset_id = $1 AND status = 'published'",
    [assetId]
  );
  const draftRes = await query(
    "SELECT id, title, slug FROM resources WHERE draft_download_asset_id = $1 OR (download_asset_id = $1 AND status != 'published')",
    [assetId]
  );

  const canDelete = publishedRes.rows.length === 0 && draftRes.rows.length === 0;
  return {
    canDelete,
    usedInPublished: publishedRes.rows,
    usedInDraft: draftRes.rows,
  };
}

export async function deleteAssetAdmin(assetId: string) {
  const { canDelete, usedInPublished, usedInDraft } = await checkAssetDependencies(assetId);

  if (!canDelete) {
    const pubNames = usedInPublished.map((r) => `"${r.title}" (published)`).join(", ");
    const draftNames = usedInDraft.map((r) => `"${r.title}" (draft)`).join(", ");
    const all = [pubNames, draftNames].filter(Boolean).join("; ");
    throw new Error(
      `Cannot delete asset because it is currently used by resources: ${all}. Detach or replace this asset before deleting.`
    );
  }

  const assetRow = await query("SELECT storage_path FROM assets WHERE id = $1", [assetId]);
  if (assetRow.rows.length > 0) {
    const relativePath = assetRow.rows[0].storage_path.replace(/^\//, "");
    const fullDiskPath = path.join(process.cwd(), "public", relativePath);
    if (fs.existsSync(fullDiskPath)) {
      try {
        fs.unlinkSync(fullDiskPath);
      } catch (err) {
        console.warn("Could not delete physical file:", fullDiskPath);
      }
    }
  }

  await query("DELETE FROM assets WHERE id = $1", [assetId]);
}

/* =========================================================================
   SITE SETTINGS & SEO
   ========================================================================= */

export async function getSiteSettingsAdmin() {
  const res = await query("SELECT * FROM site_settings WHERE key = 'general'");
  if (res.rows.length === 0) return null;
  const row = res.rows[0];
  return {
    site_name: row.site_name,
    site_description: row.site_description,
    logo_url: row.logo_url,
    favicon_url: row.favicon_url,
    default_social_image: row.default_social_image,
    footer_copy: row.footer_copy,
    meta_titles: typeof row.meta_titles === "string" ? JSON.parse(row.meta_titles) : row.meta_titles || {},
    meta_descriptions: typeof row.meta_descriptions === "string" ? JSON.parse(row.meta_descriptions) : row.meta_descriptions || {},
  };
}

export async function updateSiteSettingsAdmin(data: {
  site_name: string;
  site_description: string;
  logo_url?: string;
  favicon_url?: string;
  default_social_image?: string;
  footer_copy?: string;
  meta_titles?: Record<string, string>;
  meta_descriptions?: Record<string, string>;
}) {
  await query(
    `UPDATE site_settings SET
      site_name = $1,
      site_description = $2,
      logo_url = COALESCE($3, logo_url),
      favicon_url = COALESCE($4, favicon_url),
      default_social_image = COALESCE($5, default_social_image),
      footer_copy = COALESCE($6, footer_copy),
      meta_titles = COALESCE($7, meta_titles),
      meta_descriptions = COALESCE($8, meta_descriptions),
      updated_at = CURRENT_TIMESTAMP
     WHERE key = 'general'`,
    [
      data.site_name,
      data.site_description,
      data.logo_url || null,
      data.favicon_url || null,
      data.default_social_image || null,
      data.footer_copy || null,
      data.meta_titles ? JSON.stringify(data.meta_titles) : null,
      data.meta_descriptions ? JSON.stringify(data.meta_descriptions) : null,
    ]
  );

  safeRevalidatePath("/", "layout");
  return { success: true };
}
