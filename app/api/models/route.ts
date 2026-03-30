import { NextResponse } from "next/server";
import { MODELS } from "@/lib/models";

export async function GET() {
  return NextResponse.json({
    models: MODELS.map((m) => ({ id: m.id, label: m.label, provider: m.provider })),
  });
}
