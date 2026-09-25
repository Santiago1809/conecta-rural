import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { toggleCommentLike } from "@/lib/db";

// POST /api/comments/[id]/like — toggles a like and moves 15 points to or from
// the comment author. Returns 401 signed out, 403 on a self-like, 404 when the
// comment does not exist.
export async function POST(request: Request, context: RouteContext<"/api/comments/[id]/like">) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Inicia sesión para dar me gusta." }, { status: 401 });
  const { id } = await context.params;
  try {
    const result = await toggleCommentLike(session.user.id, id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.reason === "not_found" ? 404 : 403 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/comments/[id]/like failed", error);
    return NextResponse.json({ error: "No pudimos registrar tu me gusta." }, { status: 503 });
  }
}
