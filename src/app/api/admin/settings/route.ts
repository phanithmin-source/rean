import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  getSiteSettingsAdmin,
  updateSiteSettingsAdmin,
} from "@/lib/services/admin-service";

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getSiteSettingsAdmin();
  return NextResponse.json({ settings });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const res = await updateSiteSettingsAdmin(body);
    return NextResponse.json({ ...res, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
