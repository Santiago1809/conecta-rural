import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createComment, listComments, type ResourceType } from "@/lib/db";

const resourceTypes = new Set<ResourceType>(["destination", "provider", "package", "experience", "lodging"]);

function getResource(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("resourceType") as ResourceType | null;
  const id = request.nextUrl.searchParams.get("resourceId")?.trim();
  if (!type || !resourceTypes.has(type) || !id) return null;
  return { type, id };
}

export async function GET(request: NextRequest) {
  const resource = getResource(request);
  if (!resource) return NextResponse.json({ error: "Recurso inválido." }, { status: 400 });
  try {
    return NextResponse.json({ comments: await listComments(resource.type, resource.id) });
  } catch {
    return NextResponse.json({ error: "La base de datos no está configurada." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Inicia sesión para comentar." }, { status: 401 });
  const body = await request.json() as { resourceType?: ResourceType; resourceId?: string; body?: string };
  if (!body.resourceType || !resourceTypes.has(body.resourceType) || !body.resourceId || !body.body || body.body.trim().length < 10 || body.body.trim().length > 1000) {
    return NextResponse.json({ error: "El comentario debe tener entre 10 y 1000 caracteres." }, { status: 400 });
  }
  try {
    const result = await createComment(session.user.id, body.resourceType, body.resourceId, body.body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/comments failed", error);
    return NextResponse.json({ error: "No pudimos publicar el comentario." }, { status: 503 });
  }
}
