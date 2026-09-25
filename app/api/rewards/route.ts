import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPointsSummary, redeemDiscount } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Inicia sesión para ver tus puntos." }, { status: 401 });
  try {
    return NextResponse.json(await getPointsSummary(session.user.id));
  } catch {
    return NextResponse.json({ error: "La base de datos no está configurada." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Inicia sesión para canjear puntos." }, { status: 401 });
  const { discountId } = await request.json() as { discountId?: string };
  if (!discountId) return NextResponse.json({ error: "Descuento inválido." }, { status: 400 });
  try {
    await redeemDiscount(session.user.id, discountId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No pudimos hacer el canje." }, { status: 400 });
  }
}
