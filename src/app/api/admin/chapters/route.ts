import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  getChaptersForResourceAdmin,
  createChapterAdmin,
} from "@/lib/services/admin-service";

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resourceId = req.nextUrl.searchParams.get("resourceId");
  if (!resourceId) {
    return NextResponse.json({ error: "resourceId required" }, { status: 400 });
  }

  const chapters = await getChaptersForResourceAdmin(resourceId);
  return NextResponse.json({ chapters });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const res = await createChapterAdmin(body);
    return NextResponse.json({ success: true, ...res });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
