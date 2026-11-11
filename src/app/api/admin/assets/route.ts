import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getAllAssetsAdmin } from "@/lib/services/admin-service";

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assets = await getAllAssetsAdmin();
  return NextResponse.json({ assets });
}
