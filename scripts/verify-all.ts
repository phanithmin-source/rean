import { query } from "../src/lib/db";
import { seedDatabase } from "../src/lib/db/seed";
import {
  searchResources,
  getResourceBySlug,
  getChapterDetails,
  getLearningPathBySlug,
  getPageCopy,
  getNavigationItems,
  getSiteSettings,
} from "../src/lib/services/public-service";
import {
  createResourceAdmin,
  saveResourceDraftAdmin,
  publishResourceAdmin,
  unpublishResourceAdmin,
  savePageDraftAdmin,
  publishPageAdmin,
  saveNavigationItemAdmin,
  checkAssetDependencies,
  deleteAssetAdmin,
  deleteTopicAdmin,
} from "../src/lib/services/admin-service";
import { createSessionToken, verifySessionToken } from "../src/lib/auth";
import fs from "fs";
import path from "path";

let passedCount = 0;
let totalCount = 0;

function assert(condition: boolean, message: string) {
  totalCount++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedCount++;
  console.log(`✅ PASSED: ${message}`);
}

async function runAllVerifications() {
  console.log("\n=======================================================");
  console.log("🚀 Starting Rean Platform Comprehensive Verification");
  console.log("=======================================================\n");

  // 1. Initial Seeding and Database Content
  console.log("--- 1. Verifying Database Seed & Content Integrity ---");
  await seedDatabase();

  const topicsRes = await query("SELECT COUNT(*) as count FROM topics");
  assert(parseInt(topicsRes.rows[0].count, 10) >= 5, "All 5 core topics seeded in PostgreSQL");

  const javaRes = await query("SELECT id, slug, title FROM resources WHERE slug = 'java-programming'");
  assert(javaRes.rows.length === 1, "Flagship Java resource exists");

  const chaptersRes = await query("SELECT COUNT(*) as count FROM chapters WHERE resource_id = $1", [javaRes.rows[0].id]);
  assert(parseInt(chaptersRes.rows[0].count, 10) === 5, "Java resource contains 5 rich Markdown chapters");

  const pathsRes = await query("SELECT COUNT(*) as count FROM learning_paths");
  assert(parseInt(pathsRes.rows[0].count, 10) >= 2, "Both Programming and Backend Foundations learning paths seeded");

  // 2. Reader Search & Filter Workflow
  console.log("\n--- 2. Verifying Reader Search, Filtering & URL Workflow ---");
  // Search for "REST API"
  const searchResult = await searchResources({ searchQuery: "REST API" });
  assert(searchResult.totalCount > 0, "Reader can search for 'REST API' and find results");
  assert(
    searchResult.resources.some((r) => r.slug === "restful-api-design-guide" || r.title.includes("REST")),
    "Search returns RESTful API guide"
  );

  // Filter to beginner resources
  const beginnerResult = await searchResources({
    searchQuery: "REST API",
    difficulty: "beginner",
  });
  assert(beginnerResult.totalCount > 0, "Reader can filter search results to 'beginner' difficulty");

  // Chapter reader with Markdown and syntax highlighting
  const chapterData = await getChapterDetails("java-programming", "01-modern-java-and-oop-foundations");
  assert(chapterData.chapter !== null, "Chapter reader loads chapter data");
  assert(chapterData.chapter!.rendered_html.includes("<code"), "Markdown rendered with code highlighting tags");
  assert(chapterData.nextChapter !== null, "Sequential next chapter link resolved");

  // Following a learning path to practice project
  const backendPath = await getLearningPathBySlug("backend-foundations");
  assert(backendPath !== null, "Learning path 'backend-foundations' loaded");
  assert(backendPath!.final_task_title.includes("Study Session Tracker"), "Path includes capstone practice task");
  assert(backendPath!.steps!.length === 4, "Path has 4 ordered progression steps");

  // 3. Admin Content Management Workflow
  console.log("\n--- 3. Verifying Admin Editorial Workflow & Mutations ---");
  const testUniqueSuffix = Date.now();
  const testTitle = `Automated Pipeline Test ${testUniqueSuffix}`;
  const testResourceSlug = `test-res-${testUniqueSuffix}`;
  const created = await createResourceAdmin({
    title: testTitle,
    slug: testResourceSlug,
    summary: "Automating tests and docker builds.",
    description_markdown: "## CI/CD Pipeline\nAutomated workflow verification.",
    type: "guide",
    difficulty: "intermediate",
    topic_id: "topic-developer-tools",
    publishImmediately: false,
  });
  assert(created.id !== undefined, "Admin created new resource as draft");

  // Verify draft is NOT visible in public search
  const pubSearchDraft = await searchResources({ searchQuery: testTitle });
  assert(pubSearchDraft.totalCount === 0, "Draft resource is NOT visible on public catalog");

  // Publish resource
  await publishResourceAdmin(created.id);
  const pubSearchLive = await searchResources({ searchQuery: testTitle });
  assert(pubSearchLive.totalCount === 1, "Published resource is immediately discoverable in public catalog");

  // 4. Draft Isolation: Last Published Version Stays Live
  console.log("\n--- 4. Verifying Draft Isolation & Private Editorial State ---");
  // Get initial live About page copy
  const liveAboutBefore = await getPageCopy("about");
  const initialMission = liveAboutBefore.mission;

  // Editor saves a draft modification to About
  await savePageDraftAdmin("about", {
    ...liveAboutBefore,
    mission: "MODIFIED DRAFT MISSION: Empowering the next generation of engineers.",
  });

  // Verify public site STILL serves the original published copy
  const liveAboutDuringDraft = await getPageCopy("about", { preview: false });
  assert(
    liveAboutDuringDraft.mission === initialMission,
    "Unpublished About draft edit stays private; previous version remains live!"
  );

  // Verify preview mode with admin authentication serves draft
  const previewAbout = await getPageCopy("about", { preview: true });
  assert(
    previewAbout.mission.includes("MODIFIED DRAFT MISSION"),
    "Admin preview mode serves the updated draft copy"
  );

  // Check no founder/developer profile in About content
  const aboutText = JSON.stringify(liveAboutDuringDraft).toLowerCase();
  assert(
    !aboutText.includes("founder") && !aboutText.includes("creator profile") && !aboutText.includes("author profile"),
    "About page focuses strictly on Rean and contains no personal founder or developer profiles"
  );

  // Publish About page and verify live update
  await publishPageAdmin("about");
  const liveAboutAfter = await getPageCopy("about", { preview: false });
  assert(
    liveAboutAfter.mission.includes("MODIFIED DRAFT MISSION"),
    "Publishing About page updates public live version"
  );

  // Clean up About page back to canonical
  await savePageDraftAdmin("about", {
    ...liveAboutBefore,
    mission: initialMission,
  });
  await publishPageAdmin("about");

  // 5. Navigation Management from Browser
  console.log("\n--- 5. Verifying Navigation Management ---");
  const testNavLabel = `Special Hub ${Date.now()}`;
  const navItem = await saveNavigationItemAdmin({
    label: testNavLabel,
    url: "/paths",
    display_order: 99,
    position: "header",
    is_published: true,
  });
  const navAfter = await getNavigationItems();
  assert(
    navAfter.header.some((n) => n.label === testNavLabel),
    "Admin can update navigation links dynamically"
  );

  // 6. Security, Authentication & Access Control
  console.log("\n--- 6. Verifying Security & Authorization Enforcements ---");
  const adminSession = {
    id: "admin-01",
    email: "admin@rean.dev",
    displayName: "Lead Editor",
    role: "admin",
  };
  const token = await createSessionToken(adminSession);
  const verified = await verifySessionToken(token);
  assert(verified !== null && verified.email === "admin@rean.dev", "Admin JWT session verification succeeds");

  const invalidVerified = await verifySessionToken("tampered.jwt.token");
  assert(invalidVerified === null, "Tampered/invalid tokens rejected");

  // 7. Integrity & Dependency Guard Checks
  console.log("\n--- 7. Verifying Integrity & Dependency Blocking ---");
  // Try deleting topic-programming which has active resources
  let topicDeleteBlocked = false;
  try {
    await deleteTopicAdmin("topic-programming");
  } catch (err: any) {
    topicDeleteBlocked = true;
    assert(
      err.message.includes("Cannot delete topic because it is referenced by"),
      "Deleting topic with dependent resources is blocked with dependency explanation"
    );
  }
  assert(topicDeleteBlocked, "Topic deletion block enforced");

  // Try deleting an asset in use
  let assetDeleteBlocked = false;
  try {
    await deleteAssetAdmin("asset-pdf-java-handbook");
  } catch (err: any) {
    assetDeleteBlocked = true;
    assert(
      err.message.includes("Cannot delete asset because it is currently used"),
      "Deleting in-use asset is blocked with dependency details"
    );
  }
  assert(assetDeleteBlocked, "Asset deletion block enforced");

  // 8. Physical Downloads & Assets Verification
  console.log("\n--- 8. Verifying Physical Downloads ---");
  const pdfDisk = path.join(process.cwd(), "public", "uploads", "practical-java-handbook.pdf");
  const zipDisk = path.join(process.cwd(), "public", "uploads", "study-session-tracker.zip");
  assert(fs.existsSync(pdfDisk), "Physical Java handbook PDF exists in uploads storage");
  assert(fs.existsSync(zipDisk), "Physical Study Session Tracker ZIP source archive exists in uploads storage");

  const pdfBytes = fs.readFileSync(pdfDisk);
  assert(pdfBytes.toString("ascii", 0, 5) === "%PDF-", "PDF file has valid PDF format signature");

  const zipBytes = fs.readFileSync(zipDisk);
  assert(zipBytes[0] === 0x50 && zipBytes[1] === 0x4b, "ZIP file has valid PK archive signature");

  // 9. Seed Idempotency Check
  console.log("\n--- 9. Verifying Seed Script Idempotency ---");
  const topicsBeforeRerun = (await query("SELECT COUNT(*) as c FROM topics")).rows[0].c;
  await seedDatabase();
  const topicsAfterRerun = (await query("SELECT COUNT(*) as c FROM topics")).rows[0].c;
  assert(topicsBeforeRerun === topicsAfterRerun, "Rerunning seed script does NOT duplicate or overwrite data");

  console.log("\n=======================================================");
  console.log(`🎉 ALL ${passedCount}/${totalCount} PLATFORM VERIFICATIONS PASSED!`);
  console.log("=======================================================\n");
}

runAllVerifications()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Verification suite failed:", err);
    process.exit(1);
  });
