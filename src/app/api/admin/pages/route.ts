import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  getPageAdmin,
  savePageDraftAdmin,
  publishPageAdmin,
  discardPageDraftAdmin,
} from "@/lib/services/admin-service";

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = req.nextUrl.searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "key parameter required" }, { status: 400 });
  }

  const page = await getPageAdmin(key);
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json({ page });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { key, action, draftContent } = body;

    if (!key) {
      return NextResponse.json({ error: "Page key is required" }, { status: 400 });
    }

    if (action === "publish") {
      if (draftContent) {
        await savePageDraftAdmin(key, draftContent);
      }
      const res = await publishPageAdmin(key);
      return NextResponse.json({ ...res, success: true });
    } else if (action === "discard") {
      const res = await discardPageDraftAdmin(key);
      return NextResponse.json({ ...res, success: true });
    } else {
      // Save draft
      const res = await savePageDraftAdmin(key, draftContent);
      return NextResponse.json({ ...res, success: true });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
