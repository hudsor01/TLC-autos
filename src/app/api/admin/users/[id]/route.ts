import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { id } = await params;
    const body = await req.json();
    const admin = createAdminClient();

    const updates: Record<string, unknown> = {};
    const userMeta: Record<string, unknown> = {};
    const appMeta: Record<string, unknown> = {};

    if (body.email) updates.email = body.email;
    if (body.password) updates.password = body.password;
    if (body.name) userMeta.name = body.name;
    if (body.role) appMeta.role = body.role;

    if (Object.keys(userMeta).length > 0) {
      updates.user_metadata = userMeta;
    }
    if (Object.keys(appMeta).length > 0) {
      updates.app_metadata = appMeta;
    }

    const { data: updated, error } = await admin.auth.admin.updateUserById(id, updates);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      id: updated.user.id,
      email: updated.user.email,
      name: updated.user.user_metadata?.name || "",
      role: updated.user.app_metadata?.role || "staff",
      createdAt: updated.user.created_at,
    });
  } catch {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { user, error: authError } = await requireAdmin();
    if (authError) return authError;

    const { id } = await params;

    if (user.id === id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
