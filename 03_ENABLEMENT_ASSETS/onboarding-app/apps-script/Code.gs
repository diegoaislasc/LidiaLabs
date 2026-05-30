/**
 * LidiaLabs Onboarding — receptor de Apps Script.
 *
 * Recibe el formulario ya convertido a Markdown desde la app Next.js y crea
 * un archivo .md dentro de una carpeta de Google Drive. El archivo queda como
 * propiedad de TU cuenta (la que despliega el script), así que no hay problema
 * de cuota ni de políticas de Service Account.
 *
 * === CONFIGURACIÓN (edita estos dos valores) ===
 */
const FOLDER_ID = "PEGA_AQUI_EL_ID_DE_TU_CARPETA_DE_DRIVE";
const SHARED_TOKEN = "PEGA_AQUI_UN_TOKEN_SECRETO_LARGO"; // el mismo que pondrás en Vercel (APPS_SCRIPT_TOKEN)

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json_({ ok: false, error: "Sin cuerpo en la petición." });
    }

    const body = JSON.parse(e.postData.contents);

    // Seguridad: solo aceptamos peticiones con el token correcto.
    if (!SHARED_TOKEN || body.token !== SHARED_TOKEN) {
      return json_({ ok: false, error: "No autorizado." });
    }

    const filename = String(body.filename || "onboarding.md");
    const content = String(body.markdown || "");

    const folder = DriveApp.getFolderById(FOLDER_ID);
    const file = folder.createFile(filename, content, "text/markdown");

    return json_({ ok: true, fileId: file.getId(), url: file.getUrl() });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
