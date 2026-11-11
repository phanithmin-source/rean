import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  getLearningPathAdminById,
  saveLearningPathDraftAdmin,
  publishLearningPathAdmin,
  unpublishLearningPathAdmin,
} from "@/lib/services/admin-service";
import { query } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = await getLearningPathAdminById(params.id);
  if (!path) {
    return NextResponse.json({ error: "Path not found" }, { status: 404 });
  }

  return NextResponse.json({ path });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, ...data } = body;

    if (action === "publish") {
      if (Object.keys(data).length > 0) {
        await saveLearningPathDraftAdmin(params.id, data);
      }
      const res = await publishLearningPathAdmin(params.id);
      return NextResponse.json({ success: true, ...res });
    } else if (action === "unpublish") {
      await unpublishLearningPathAdmin(params.id);
      return NextResponse.json({ success: true, status: "draft" });
    } else {
      const res = await saveLearningPathDraftAdmin(params.id, data);
      return NextResponse.json({ success: true, ...res });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await query("DELETE FROM learning_paths WHERE id = $1", [params.id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
