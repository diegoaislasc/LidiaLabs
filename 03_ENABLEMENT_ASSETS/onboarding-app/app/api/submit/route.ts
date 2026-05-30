import { NextResponse } from "next/server";
import { onboardingSchema } from "@/lib/types";
import { buildOnboardingMarkdown, buildFilename } from "@/lib/markdown";
import { uploadMarkdown } from "@/lib/drive";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "El cuerpo de la petición no es JSON válido." },
      { status: 400 }
    );
  }

  const parsed = onboardingSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Datos del formulario inválidos.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const now = new Date();
  const generatedAt = now.toLocaleString("es-MX", { timeZone: "America/Mexico_City" });
  const markdown = buildOnboardingMarkdown(parsed.data, generatedAt);
  const filename = buildFilename(parsed.data, now);

  try {
    const file = await uploadMarkdown({ filename, content: markdown });
    return NextResponse.json({ ok: true, fileId: file.id });
  } catch (err) {
    console.error("[submit] Error subiendo a Drive:", err);
    return NextResponse.json(
      { ok: false, error: "No se pudo guardar la respuesta en Google Drive." },
      { status: 500 }
    );
  }
}
