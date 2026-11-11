import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import { setAdminSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const res = await query(
      "SELECT id, email, password_hash, display_name, role FROM admins WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    if (res.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const admin = res.rows[0];
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const sessionPayload = {
      id: admin.id,
      email: admin.email,
      displayName: admin.display_name,
      role: admin.role,
    };

    await setAdminSessionCookie(sessionPayload);

    return NextResponse.json({
      success: true,
      admin: sessionPayload,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication error" },
      { status: 500 }
    );
  }
}
