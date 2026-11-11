import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  getAllLearningPathsAdmin,
} from "@/lib/services/admin-service";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const paths = await getAllLearningPathsAdmin();
  return NextResponse.json({ paths });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { slug, title, summary, outcome, final_task_title, final_task_description, topic_id } = body;

    const existing = await query("SELECT id FROM learning_paths WHERE slug = $1", [slug]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: `Slug "${slug}" already exists` }, { status: 400 });
    }

    const id = `path-${Date.now()}`;
    await query(
      `INSERT INTO learning_paths (
        id, slug, title, summary, outcome, prerequisites,
        final_task_title, final_task_description, topic_id,
        status, draft_title, draft_summary, draft_outcome, draft_prerequisites,
        draft_final_task_title, draft_final_task_description, draft_topic_id,
        has_draft_changes
      ) VALUES (
        $1, $2, $3, $4, $5, '[]'::jsonb,
        $6, $7, $8,
        'draft', $3, $4, $5, '[]'::jsonb,
        $6, $7, $8, FALSE
      )`,
      [id, slug, title, summary, outcome, final_task_title, final_task_description, topic_id || null]
    );

    return NextResponse.json({ success: true, id, slug });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
