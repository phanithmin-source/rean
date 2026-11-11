import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  getAllResourcesAdmin,
  createResourceAdmin,
} from "@/lib/services/admin-service";

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resources = await getAllResourcesAdmin();
  return NextResponse.json({ resources });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = await createResourceAdmin(body);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
