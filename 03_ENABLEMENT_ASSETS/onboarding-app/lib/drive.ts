// Entrega el .md a una carpeta de Google Drive a través de un Web App de
// Google Apps Script (que escribe el archivo como el dueño de la cuenta).
// Llamada server-to-server desde el Route Handler: sin CORS, con respuesta real.

export interface UploadResult {
  id: string;
  webViewLink?: string | null;
}

export async function uploadMarkdown(params: {
  filename: string;
  content: string;
}): Promise<UploadResult> {
  const url = process.env.APPS_SCRIPT_URL;
  const token = process.env.APPS_SCRIPT_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Faltan variables de entorno (APPS_SCRIPT_URL, APPS_SCRIPT_TOKEN)."
    );
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      filename: params.filename,
      markdown: params.content,
    }),
    redirect: "follow",
  });

  const text = await res.text();
  let data: { ok?: boolean; fileId?: string; url?: string; error?: string };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Respuesta no-JSON de Apps Script (HTTP ${res.status}).`);
  }

  if (!res.ok || !data.ok || !data.fileId) {
    throw new Error(data.error || `Apps Script falló (HTTP ${res.status}).`);
  }

  return { id: data.fileId, webViewLink: data.url ?? null };
}
