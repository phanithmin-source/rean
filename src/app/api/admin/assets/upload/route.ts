import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { query } from "@/lib/db";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const isDraftOnly = formData.get("isDraftOnly") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate mime type and extension
    const allowedMimePrefixes = ["image/", "application/pdf", "application/zip", "application/x-zip-compressed", "application/x-tar", "application/gzip"];
    const isAllowedMime = allowedMimePrefixes.some((p) => file.type.startsWith(p));
    const allowedExts = [".png", ".jpg", ".jpeg", ".webp", ".svg", ".pdf", ".zip", ".tar.gz", ".tar"];
    const ext = path.extname(file.name).toLowerCase();

    if (!isAllowedMime && !allowedExts.includes(ext)) {
      return NextResponse.json(
        { error: `File type "${file.type || ext}" is not allowed. Only images, PDFs, and source archives (.zip, .tar) are permitted.` },
        { status: 400 }
      );
    }

    // 50MB Limit
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File exceeds maximum size of 50MB" },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeBase = file.name
      .replace(ext, "")
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .toLowerCase();
    const diskFilename = `${safeBase}-${timestamp}${ext}`;
    const destinationPath = path.join(uploadsDir, diskFilename);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(destinationPath, buffer);

    const assetId = `asset-${timestamp}`;
    const publicUrl = `/uploads/${diskFilename}`;
    const storagePath = `/uploads/${diskFilename}`;

    await query(
      `INSERT INTO assets (
        id, filename, original_name, mime_type, byte_size, storage_path, public_url, is_draft_only
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        assetId,
        diskFilename,
        file.name,
        file.type || "application/octet-stream",
        file.size,
        storagePath,
        publicUrl,
        isDraftOnly,
      ]
    );

    return NextResponse.json({
      success: true,
      asset: {
        id: assetId,
        filename: diskFilename,
        original_name: file.name,
        mime_type: file.type,
        byte_size: file.size,
        public_url: publicUrl,
        is_draft_only: isDraftOnly,
      },
    });
  } catch (err: any) {
    console.error("Asset upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
