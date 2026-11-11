import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  getAllTopicsAdmin,
  createTopicAdmin,
} from "@/lib/services/admin-service";

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const topics = await getAllTopicsAdmin();
  return NextResponse.json({ topics });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const res = await createTopicAdmin(body);
    return NextResponse.json({ success: true, ...res });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
