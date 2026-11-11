import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { deleteNavigationItemAdmin } from "@/lib/services/admin-service";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await deleteNavigationItemAdmin(params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
