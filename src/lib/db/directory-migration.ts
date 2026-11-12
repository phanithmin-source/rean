import type { DbClient } from "./index";
import { DIRECTORY_COPY } from "../directory-content";

/** Retire the path UI and refresh only known starter copy; preserve editorial changes. */
export async function migrateDirectoryContent(db: DbClient) {
  const version = "20261112_002_resource_directory";
  if (
    (
      await db.query(
        "SELECT version FROM schema_migrations WHERE version = $1",
        [version],
      )
    ).rows.length
  )
    return;
  await db.transaction(async (tx) => {
    const originals: Record<string, Record<string, string>> = {
      explore: {
        heroTitle: "Build Real Software with Rean (រៀន)",
        heroSubtitle:
          "A calm, distraction-free discovery hub for Cambodian students and software engineers. Curated books, guides, guided learning paths, and hands-on practice projects.",
        featuredTopicsHeading: "Core Learning Domains",
        curatedPicksHeading: "Curated Launch Resources",
        catalogHeading: "Software Development Catalog",
      },
      about: {
        mission:
          "Rean (រៀន — Khmer for 'Learn') was founded to provide accessible, structured, and practical software engineering education. Our mission is to bridge the gap between academic theory and the daily realities of production software engineering.",
        audience:
          "Rean is designed specifically for high school and university students, self-taught developers, and early-career software engineers who seek clear, disciplined learning pathways rather than fragmented tutorials.",
        learningApproach:
          "We believe in project-driven mastery. Every concept is explained with direct code examples, and every learning path culminates in a real practice project. We prioritize fundamentals over fleeting hype.",
        selectionCriteria:
          "Every book, guide, and tool included in the Rean catalog is vetted against rigorous criteria: clarity of explanation, adherence to modern industry standards, zero marketing fluff, and open accessibility.",
        ctaExploreLabel: "Explore Resource Catalog",
      },
    };
    for (const key of ["explore", "about"] as const) {
      const row = (
        await tx.query(
          "SELECT published_content, draft_content FROM pages WHERE key = $1",
          [key],
        )
      ).rows[0];
      if (!row) continue;
      const update = (raw: any) => {
        if (raw == null) return null;
        const content = typeof raw === "string" ? JSON.parse(raw) : { ...raw };
        for (const [field, value] of Object.entries(DIRECTORY_COPY[key])) {
          if (
            content[field] === undefined ||
            content[field] === originals[key][field]
          )
            content[field] = value;
        }
        delete content.pathsHeading;
        delete content.ctaPathsLabel;
        return JSON.stringify(content);
      };
      await tx.query(
        "UPDATE pages SET published_content = $1::jsonb, draft_content = $2::jsonb WHERE key = $3",
        [update(row.published_content), update(row.draft_content), key],
      );
    }
    await tx.query(
      "UPDATE navigation_items SET label = 'Categories', url = '/topics' WHERE url = '/paths'",
    );
    await tx.query(
      "UPDATE learning_paths SET status = 'draft' WHERE status = 'published'",
    );
    const oldNote =
      "Essential reading before beginning the Backend Foundations learning path. Based on production API guidelines.";
    const newNote =
      "A practical introduction to API design, based on production API guidelines.";
    await tx.query(
      "UPDATE resources SET curation_note = $1 WHERE curation_note = $2",
      [newNote, oldNote],
    );
    await tx.query(
      "UPDATE resources SET draft_curation_note = $1 WHERE draft_curation_note = $2",
      [newNote, oldNote],
    );
    await tx.query(
      "UPDATE site_settings SET site_description = $1 WHERE site_description = $2",
      [
        "A curated directory of developer tools, books, practical guides, and programming resources.",
        "Public software development learning and resource platform with guided paths and practical projects.",
      ],
    );
    await tx.query(
      "INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT (version) DO NOTHING",
      [version],
    );
  });
}
