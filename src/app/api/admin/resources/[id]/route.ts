import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  getResourceAdminById,
  saveResourceDraftAdmin,
  publishResourceAdmin,
  unpublishResourceAdmin,
  deleteResourceAdmin,
} from "@/lib/services/admin-service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resource = await getResourceAdminById(params.id);
  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  return NextResponse.json({ resource });
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
      // First save any incoming draft edits if provided
      if (Object.keys(data).length > 0) {
        await saveResourceDraftAdmin(params.id, data);
      }
      const res = await publishResourceAdmin(params.id);
      return NextResponse.json({ success: true, ...res });
    } else if (action === "unpublish") {
      await unpublishResourceAdmin(params.id);
      return NextResponse.json({ success: true, status: "draft" });
    } else {
      // Default: save draft
      const res = await saveResourceDraftAdmin(params.id, data);
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
    await deleteResourceAdmin(params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
