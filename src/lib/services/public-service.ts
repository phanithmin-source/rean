import { query } from "../db";
import { renderMarkdown } from "../markdown";

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  display_order: number;
  position: "header" | "footer" | "both";
}

export interface SiteSettings {
  site_name: string;
  site_description: string;
  logo_url: string;
  favicon_url: string;
  default_social_image: string;
  footer_copy: string;
  meta_titles: Record<string, string>;
  meta_descriptions: Record<string, string>;
}

export interface Topic {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  display_order: number;
  resource_count?: number;
}

export interface ResourceItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description_markdown: string;
  type: "book" | "guide" | "documentation" | "course" | "tool" | "project";
  difficulty: "beginner" | "intermediate" | "advanced";
  topic_id: string;
  topic_name?: string;
  topic_slug?: string;
  tags: string[];
  source_url?: string | null;
  curation_note?: string | null;
  download_asset_id?: string | null;
  download_asset?: {
    id: string;
    filename: string;
    original_name: string;
    byte_size: number;
    mime_type: string;
    public_url: string;
  } | null;
  featured_order?: number | null;
  status: string;
  published_at?: string | null;
  has_chapters?: boolean;
}

export interface ChapterItem {
  id: string;
  resource_id: string;
  slug: string;
  title: string;
  chapter_order: number;
  content_markdown: string;
  rendered_html?: string;
  status: string;
}

export interface LearningPathStep {
  id: string;
  path_id: string;
  step_order: number;
  title: string;
  description: string;
  resource_id?: string | null;
  resource_title?: string | null;
  resource_slug?: string | null;
  resource_type?: string | null;
  external_url?: string | null;
  estimated_minutes: number;
}

export interface LearningPathItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  outcome: string;
  prerequisites: string[];
  final_task_title: string;
  final_task_description: string;
  topic_id?: string | null;
  topic_name?: string | null;
  featured_order?: number | null;
  status: string;
  steps?: LearningPathStep[];
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const res = await query(
    "SELECT site_name, site_description, logo_url, favicon_url, default_social_image, footer_copy, meta_titles, meta_descriptions FROM site_settings WHERE key = 'general'"
  );
  if (res.rows.length === 0) {
    return {
      site_name: "Rean (រៀន)",
      site_description: "Software development learning and resource platform.",
      logo_url: "/images/logo.png",
      favicon_url: "/images/brand-book.png",
      default_social_image: "/images/logo.png",
      footer_copy: "© 2026 Rean (រៀន). Dedicated to software craftsmanship and student empowerment.",
      meta_titles: {},
      meta_descriptions: {},
    };
  }
  const row = res.rows[0];
  return {
    site_name: row.site_name,
    site_description: row.site_description,
    logo_url: row.logo_url || "/images/logo.png",
    favicon_url: row.favicon_url || "/images/brand-book.png",
    default_social_image: row.default_social_image || "/images/logo.png",
    footer_copy: row.footer_copy,
    meta_titles: typeof row.meta_titles === "string" ? JSON.parse(row.meta_titles) : row.meta_titles || {},
    meta_descriptions: typeof row.meta_descriptions === "string" ? JSON.parse(row.meta_descriptions) : row.meta_descriptions || {},
  };
}

export async function getNavigationItems(): Promise<{
  header: NavigationItem[];
  footer: NavigationItem[];
}> {
  const res = await query(
    "SELECT id, label, url, display_order, position FROM navigation_items WHERE is_published = TRUE ORDER BY display_order ASC"
  );

  const header = res.rows.filter(
    (item: NavigationItem) => item.position === "header" || item.position === "both"
  );
  const footer = res.rows.filter(
    (item: NavigationItem) => item.position === "footer" || item.position === "both"
  );

  return { header, footer };
}

export async function getTopics(): Promise<Topic[]> {
  const res = await query(`
    SELECT t.id, t.slug, t.name, t.description, t.icon, t.display_order,
           COUNT(r.id) as resource_count
    FROM topics t
    LEFT JOIN resources r ON r.topic_id = t.id AND r.status = 'published'
    WHERE t.is_visible = TRUE AND t.status = 'published'
    GROUP BY t.id, t.slug, t.name, t.description, t.icon, t.display_order
    ORDER BY t.display_order ASC
  `);

  return res.rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    icon: row.icon,
    display_order: row.display_order,
    resource_count: parseInt(row.resource_count, 10) || 0,
  }));
}

export async function getTopicBySlug(slug: string): Promise<{
  topic: Topic | null;
  resources: ResourceItem[];
  learningPaths: LearningPathItem[];
}> {
  const topicRes = await query(
    "SELECT id, slug, name, description, icon, display_order FROM topics WHERE slug = $1 AND is_visible = TRUE AND status = 'published'",
    [slug]
  );

  if (topicRes.rows.length === 0) {
    return { topic: null, resources: [], learningPaths: [] };
  }

  const topic = topicRes.rows[0];

  const resourcesRes = await query(
    `SELECT r.id, r.slug, r.title, r.summary, r.description_markdown, r.type, r.difficulty,
            r.topic_id, r.tags, r.source_url, r.curation_note, r.download_asset_id,
            r.featured_order, r.status, r.published_at,
            (SELECT COUNT(*) FROM chapters c WHERE c.resource_id = r.id AND c.status = 'published') as chapter_count
     FROM resources r
     WHERE r.topic_id = $1 AND r.status = 'published'
     ORDER BY r.featured_order ASC NULLS LAST, r.title ASC`,
    [topic.id]
  );

  const resources: ResourceItem[] = resourcesRes.rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    description_markdown: r.description_markdown,
    type: r.type,
    difficulty: r.difficulty,
    topic_id: r.topic_id,
    topic_name: topic.name,
    topic_slug: topic.slug,
    tags: Array.isArray(r.tags) ? r.tags : typeof r.tags === "string" ? JSON.parse(r.tags) : [],
    source_url: r.source_url,
    curation_note: r.curation_note,
    download_asset_id: r.download_asset_id,
    featured_order: r.featured_order,
    status: r.status,
    published_at: r.published_at,
    has_chapters: parseInt(r.chapter_count, 10) > 0,
  }));

  const pathsRes = await query(
    `SELECT id, slug, title, summary, outcome, prerequisites, final_task_title, final_task_description, topic_id, featured_order, status
     FROM learning_paths
     WHERE topic_id = $1 AND status = 'published'
     ORDER BY featured_order ASC NULLS LAST`,
    [topic.id]
  );

  const learningPaths: LearningPathItem[] = pathsRes.rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    outcome: p.outcome,
    prerequisites: Array.isArray(p.prerequisites) ? p.prerequisites : typeof p.prerequisites === "string" ? JSON.parse(p.prerequisites) : [],
    final_task_title: p.final_task_title,
    final_task_description: p.final_task_description,
    topic_id: p.topic_id,
    topic_name: topic.name,
    featured_order: p.featured_order,
    status: p.status,
  }));

  return { topic, resources, learningPaths };
}

export async function searchResources(options: {
  searchQuery?: string;
  topic?: string;
  type?: string;
  difficulty?: string;
  featuredOnly?: boolean;
}): Promise<{ resources: ResourceItem[]; totalCount: number }> {
  let sql = `
    SELECT r.id, r.slug, r.title, r.summary, r.description_markdown, r.type, r.difficulty,
           r.topic_id, t.name as topic_name, t.slug as topic_slug,
           r.tags, r.source_url, r.curation_note, r.download_asset_id,
           r.featured_order, r.status, r.published_at,
           (SELECT COUNT(*) FROM chapters c WHERE c.resource_id = r.id AND c.status = 'published') as chapter_count
    FROM resources r
    JOIN topics t ON r.topic_id = t.id
    WHERE r.status = 'published' AND t.is_visible = TRUE
  `;
  const params: any[] = [];

  if (options.topic && options.topic !== "all") {
    params.push(options.topic);
    sql += ` AND t.slug = $${params.length}`;
  }

  if (options.type && options.type !== "all") {
    params.push(options.type);
    sql += ` AND r.type = $${params.length}`;
  }

  if (options.difficulty && options.difficulty !== "all") {
    params.push(options.difficulty);
    sql += ` AND r.difficulty = $${params.length}`;
  }

  if (options.featuredOnly) {
    sql += ` AND r.featured_order IS NOT NULL`;
  }

  if (options.searchQuery && options.searchQuery.trim().length > 0) {
    params.push(`%${options.searchQuery.trim().toLowerCase()}%`);
    const pIdx = params.length;
    sql += ` AND (
      LOWER(r.title) LIKE $${pIdx} OR
      LOWER(r.summary) LIKE $${pIdx} OR
      LOWER(r.description_markdown) LIKE $${pIdx} OR
      LOWER(t.name) LIKE $${pIdx} OR
      LOWER(r.tags::text) LIKE $${pIdx}
    )`;
  }

  sql += ` ORDER BY r.featured_order ASC NULLS LAST, r.title ASC`;

  const res = await query(sql, params);

  const resources: ResourceItem[] = res.rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    description_markdown: r.description_markdown,
    type: r.type,
    difficulty: r.difficulty,
    topic_id: r.topic_id,
    topic_name: r.topic_name,
    topic_slug: r.topic_slug,
    tags: Array.isArray(r.tags) ? r.tags : typeof r.tags === "string" ? JSON.parse(r.tags) : [],
    source_url: r.source_url,
    curation_note: r.curation_note,
    download_asset_id: r.download_asset_id,
    featured_order: r.featured_order,
    status: r.status,
    published_at: r.published_at,
    has_chapters: parseInt(r.chapter_count, 10) > 0,
  }));

  return { resources, totalCount: resources.length };
}

export async function getResourceBySlug(
  slug: string,
  options?: { preview?: boolean }
): Promise<{
  resource: ResourceItem | null;
  chapters: ChapterItem[];
}> {
  const isPreview = !!options?.preview;

  let resSql = `
    SELECT r.id, r.slug, r.title, r.summary, r.description_markdown, r.type, r.difficulty,
           r.topic_id, t.name as topic_name, t.slug as topic_slug,
           r.tags, r.source_url, r.curation_note, r.download_asset_id,
           r.featured_order, r.status, r.published_at,
           r.draft_title, r.draft_summary, r.draft_description_markdown,
           r.draft_type, r.draft_difficulty, r.draft_tags, r.draft_source_url,
           r.draft_curation_note, r.draft_download_asset_id,
           a.id as asset_id, a.filename as asset_filename, a.original_name as asset_original_name,
           a.byte_size as asset_byte_size, a.mime_type as asset_mime_type, a.public_url as asset_public_url
    FROM resources r
    JOIN topics t ON r.topic_id = t.id
    LEFT JOIN assets a ON a.id = (CASE WHEN ${isPreview} THEN COALESCE(r.draft_download_asset_id, r.download_asset_id) ELSE r.download_asset_id END)
    WHERE r.slug = $1
  `;

  if (!isPreview) {
    resSql += " AND r.status = 'published'";
  }

  const res = await query(resSql, [slug]);
  if (res.rows.length === 0) {
    return { resource: null, chapters: [] };
  }

  const row = res.rows[0];

  const resource: ResourceItem = {
    id: row.id,
    slug: row.slug,
    title: isPreview ? row.draft_title || row.title : row.title,
    summary: isPreview ? row.draft_summary || row.summary : row.summary,
    description_markdown: isPreview
      ? row.draft_description_markdown || row.description_markdown
      : row.description_markdown,
    type: isPreview ? row.draft_type || row.type : row.type,
    difficulty: isPreview ? row.draft_difficulty || row.difficulty : row.difficulty,
    topic_id: row.topic_id,
    topic_name: row.topic_name,
    topic_slug: row.topic_slug,
    tags: isPreview
      ? Array.isArray(row.draft_tags) ? row.draft_tags : typeof row.draft_tags === "string" ? JSON.parse(row.draft_tags) : []
      : Array.isArray(row.tags) ? row.tags : typeof row.tags === "string" ? JSON.parse(row.tags) : [],
    source_url: isPreview ? row.draft_source_url || row.source_url : row.source_url,
    curation_note: isPreview ? row.draft_curation_note || row.curation_note : row.curation_note,
    download_asset_id: isPreview ? row.draft_download_asset_id || row.download_asset_id : row.download_asset_id,
    download_asset: row.asset_id
      ? {
          id: row.asset_id,
          filename: row.asset_filename,
          original_name: row.asset_original_name,
          byte_size: parseInt(row.asset_byte_size, 10),
          mime_type: row.asset_mime_type,
          public_url: row.asset_public_url,
        }
      : null,
    featured_order: row.featured_order,
    status: row.status,
    published_at: row.published_at,
  };

  let chapSql = `
    SELECT id, resource_id, slug, title, chapter_order, content_markdown, status,
           draft_title, draft_content_markdown, draft_chapter_order
    FROM chapters
    WHERE resource_id = $1
  `;
  if (!isPreview) {
    chapSql += " AND status = 'published'";
  }
  chapSql += " ORDER BY chapter_order ASC";

  const chapRes = await query(chapSql, [row.id]);
  const chapters: ChapterItem[] = chapRes.rows.map((ch) => ({
    id: ch.id,
    resource_id: ch.resource_id,
    slug: ch.slug,
    title: isPreview ? ch.draft_title || ch.title : ch.title,
    chapter_order: isPreview ? ch.draft_chapter_order || ch.chapter_order : ch.chapter_order,
    content_markdown: isPreview ? ch.draft_content_markdown || ch.content_markdown : ch.content_markdown,
    status: ch.status,
  }));

  resource.has_chapters = chapters.length > 0;

  return { resource, chapters };
}

export async function getChapterDetails(
  resourceSlug: string,
  chapterSlug: string,
  options?: { preview?: boolean }
): Promise<{
  resource: ResourceItem | null;
  chapter: (ChapterItem & { rendered_html: string }) | null;
  chapters: ChapterItem[];
  previousChapter: ChapterItem | null;
  nextChapter: ChapterItem | null;
}> {
  const { resource, chapters } = await getResourceBySlug(resourceSlug, options);
  if (!resource || chapters.length === 0) {
    return {
      resource: null,
      chapter: null,
      chapters: [],
      previousChapter: null,
      nextChapter: null,
    };
  }

  const currentIdx = chapters.findIndex((c) => c.slug === chapterSlug);
  if (currentIdx === -1) {
    return {
      resource,
      chapter: null,
      chapters,
      previousChapter: null,
      nextChapter: null,
    };
  }

  const currentChapter = chapters[currentIdx];
  const rendered_html = renderMarkdown(currentChapter.content_markdown);

  const previousChapter = currentIdx > 0 ? chapters[currentIdx - 1] : null;
  const nextChapter = currentIdx < chapters.length - 1 ? chapters[currentIdx + 1] : null;

  return {
    resource,
    chapter: { ...currentChapter, rendered_html },
    chapters,
    previousChapter,
    nextChapter,
  };
}

export async function getLearningPaths(options?: { preview?: boolean }): Promise<LearningPathItem[]> {
  const isPreview = !!options?.preview;

  let sql = `
    SELECT lp.id, lp.slug, lp.title, lp.summary, lp.outcome, lp.prerequisites,
           lp.final_task_title, lp.final_task_description, lp.topic_id, t.name as topic_name,
           lp.featured_order, lp.status,
           lp.draft_title, lp.draft_summary, lp.draft_outcome, lp.draft_prerequisites,
           lp.draft_final_task_title, lp.draft_final_task_description
    FROM learning_paths lp
    LEFT JOIN topics t ON lp.topic_id = t.id
  `;
  if (!isPreview) {
    sql += " WHERE lp.status = 'published'";
  }
  sql += " ORDER BY lp.featured_order ASC NULLS LAST, lp.title ASC";

  const res = await query(sql);

  const paths: LearningPathItem[] = [];
  for (const row of res.rows) {
    const stepsRes = await query(
      `SELECT s.id, s.path_id, s.step_order, s.title, s.description, s.resource_id,
              s.external_url, s.estimated_minutes, r.title as resource_title,
              r.slug as resource_slug, r.type as resource_type
       FROM learning_path_steps s
       LEFT JOIN resources r ON s.resource_id = r.id
       WHERE s.path_id = $1
       ORDER BY s.step_order ASC`,
      [row.id]
    );

    paths.push({
      id: row.id,
      slug: row.slug,
      title: isPreview ? row.draft_title || row.title : row.title,
      summary: isPreview ? row.draft_summary || row.summary : row.summary,
      outcome: isPreview ? row.draft_outcome || row.outcome : row.outcome,
      prerequisites: isPreview
        ? Array.isArray(row.draft_prerequisites) ? row.draft_prerequisites : typeof row.draft_prerequisites === "string" ? JSON.parse(row.draft_prerequisites) : []
        : Array.isArray(row.prerequisites) ? row.prerequisites : typeof row.prerequisites === "string" ? JSON.parse(row.prerequisites) : [],
      final_task_title: isPreview ? row.draft_final_task_title || row.final_task_title : row.final_task_title,
      final_task_description: isPreview ? row.draft_final_task_description || row.final_task_description : row.final_task_description,
      topic_id: row.topic_id,
      topic_name: row.topic_name,
      featured_order: row.featured_order,
      status: row.status,
      steps: stepsRes.rows.map((s) => ({
        id: s.id,
        path_id: s.path_id,
        step_order: s.step_order,
        title: s.title,
        description: s.description,
        resource_id: s.resource_id,
        resource_title: s.resource_title,
        resource_slug: s.resource_slug,
        resource_type: s.resource_type,
        external_url: s.external_url,
        estimated_minutes: s.estimated_minutes,
      })),
    });
  }

  return paths;
}

export async function getLearningPathBySlug(
  slug: string,
  options?: { preview?: boolean }
): Promise<LearningPathItem | null> {
  const isPreview = !!options?.preview;

  let sql = `
    SELECT lp.id, lp.slug, lp.title, lp.summary, lp.outcome, lp.prerequisites,
           lp.final_task_title, lp.final_task_description, lp.topic_id, t.name as topic_name,
           lp.featured_order, lp.status,
           lp.draft_title, lp.draft_summary, lp.draft_outcome, lp.draft_prerequisites,
           lp.draft_final_task_title, lp.draft_final_task_description
    FROM learning_paths lp
    LEFT JOIN topics t ON lp.topic_id = t.id
    WHERE lp.slug = $1
  `;
  if (!isPreview) {
    sql += " AND lp.status = 'published'";
  }

  const res = await query(sql, [slug]);
  if (res.rows.length === 0) return null;
  const row = res.rows[0];

  const stepsRes = await query(
    `SELECT s.id, s.path_id, s.step_order, s.title, s.description, s.resource_id,
            s.external_url, s.estimated_minutes, r.title as resource_title,
            r.slug as resource_slug, r.type as resource_type
     FROM learning_path_steps s
     LEFT JOIN resources r ON s.resource_id = r.id
     WHERE s.path_id = $1
     ORDER BY s.step_order ASC`,
    [row.id]
  );

  return {
    id: row.id,
    slug: row.slug,
    title: isPreview ? row.draft_title || row.title : row.title,
    summary: isPreview ? row.draft_summary || row.summary : row.summary,
    outcome: isPreview ? row.draft_outcome || row.outcome : row.outcome,
    prerequisites: isPreview
      ? Array.isArray(row.draft_prerequisites) ? row.draft_prerequisites : typeof row.draft_prerequisites === "string" ? JSON.parse(row.draft_prerequisites) : []
      : Array.isArray(row.prerequisites) ? row.prerequisites : typeof row.prerequisites === "string" ? JSON.parse(row.prerequisites) : [],
    final_task_title: isPreview ? row.draft_final_task_title || row.final_task_title : row.final_task_title,
    final_task_description: isPreview ? row.draft_final_task_description || row.final_task_description : row.final_task_description,
    topic_id: row.topic_id,
    topic_name: row.topic_name,
    featured_order: row.featured_order,
    status: row.status,
    steps: stepsRes.rows.map((s) => ({
      id: s.id,
      path_id: s.path_id,
      step_order: s.step_order,
      title: s.title,
      description: s.description,
      resource_id: s.resource_id,
      resource_title: s.resource_title,
      resource_slug: s.resource_slug,
      resource_type: s.resource_type,
      external_url: s.external_url,
      estimated_minutes: s.estimated_minutes,
    })),
  };
}

export async function getPageCopy(
  key: string,
  options?: { preview?: boolean }
): Promise<any> {
  const isPreview = !!options?.preview;
  const res = await query(
    "SELECT published_content, draft_content, status FROM pages WHERE key = $1",
    [key]
  );
  if (res.rows.length === 0) return null;
  const row = res.rows[0];

  const content = isPreview ? row.draft_content || row.published_content : row.published_content;
  return typeof content === "string" ? JSON.parse(content) : content;
}
