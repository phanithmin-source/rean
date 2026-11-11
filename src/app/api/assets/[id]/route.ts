import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import path from "path";
import fs from "fs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const assetRes = await query(
    "SELECT id, filename, original_name, mime_type, byte_size, storage_path, is_draft_only FROM assets WHERE id = $1",
    [params.id]
  );

  if (assetRes.rows.length === 0) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const asset = assetRes.rows[0];

  // Protect draft-only assets from public unauthenticated access
  if (asset.is_draft_only) {
    const admin = await getAdminSession(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Forbidden: Draft asset is protected from public access" },
        { status: 403 }
      );
    }
  }

  const relativePath = asset.storage_path.replace(/^\//, "");
  const fullDiskPath = path.join(process.cwd(), "public", relativePath);

  if (!fs.existsSync(fullDiskPath)) {
    return NextResponse.json(
      { error: "Asset file not found on storage" },
      { status: 404 }
    );
  }

  const fileBuffer = fs.readFileSync(fullDiskPath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": asset.mime_type || "application/octet-stream",
      "Content-Disposition": `inline; filename="${encodeURIComponent(asset.original_name)}"`,
      "Content-Length": asset.byte_size.toString(),
    },
  });
}
