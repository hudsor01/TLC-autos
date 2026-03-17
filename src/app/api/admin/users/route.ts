import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const admin = createAdminClient();
    const { data: { users }, error } = await admin.auth.admin.listUsers();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mapped = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.name || "",
      role: u.app_metadata?.role || "staff",
      createdAt: u.created_at,
    }));

    return NextResponse.json(mapped);
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { email, name, password, role } = await req.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: newUser, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: role || "staff" },
      user_metadata: { name },
    });

    if (error) {
      if (error.message.includes("already")) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        id: newUser.user.id,
        email: newUser.user.email,
        name,
        role: role || "staff",
        createdAt: newUser.user.created_at,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
