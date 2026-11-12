import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
async function retired(req: NextRequest) {
  if (!await getAdminSession(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ error: "Learning paths have been retired. Manage resources and categories instead." }, { status: 410 });
}
export const GET = retired;
export const PUT = retired;
export const DELETE = retired;
