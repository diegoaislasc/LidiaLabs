import type { OnboardingData } from "./types";

/** Limpia un valor para Markdown; devuelve guion si está vacío. */
function v(value: string | undefined): string {
  const t = (value ?? "").trim();
  return t.length > 0 ? t : "—";
}

const DIAS: Array<[keyof OnboardingData["horarios"], string]> = [
  ["lunes", "Lunes"],
  ["martes", "Martes"],
  ["miercoles", "Miércoles"],
  ["jueves", "Jueves"],
  ["viernes", "Viernes"],
  ["sabado", "Sábado"],
  ["domingo", "Domingo"],
];

/**
 * Convierte la respuesta del onboarding en un documento Markdown estructurado,
 * listo para usarse como contexto / knowledge base del prompt de Lidia.
 * Función pura: recibe los datos (y opcionalmente la fecha) y devuelve string.
 */
export function buildOnboardingMarkdown(
  data: OnboardingData,
  generatedAt?: string
): string {
  const { negocio, horarios, servicios, faqs, politicas, contacto, personalidad, metaBusiness, recordatorios } = data;

  const lines: string[] = [];

  lines.push(`# ${v(negocio.nombre)} — Onboarding Lidia`);
  lines.push("");
  const meta = [`Giro: ${v(negocio.giro)}`];
  if (generatedAt) meta.unshift(`Generado: ${generatedAt}`);
  lines.push(`> ${meta.join(" · ")}`);
  lines.push("");

  // 1. Negocio
  lines.push("## 1. Negocio");
  lines.push(`- **Nombre:** ${v(negocio.nombre)}`);
  lines.push(`- **Giro:** ${v(negocio.giro)}`);
  lines.push(`- **Dirección:** ${v(negocio.direccion)}`);
  lines.push(`- **Ciudad y estado:** ${v(negocio.ciudad)}`);
  lines.push(`- **Cómo describe Lidia la ubicación:** ${v(negocio.ubicacionLidia)}`);
  lines.push("");

  // 2. Horarios
  lines.push("## 2. Horarios de atención");
  lines.push("| Día | Horario |");
  lines.push("| --- | --- |");
  for (const [key, label] of DIAS) {
    lines.push(`| ${label} | ${v(horarios[key])} |`);
  }
  lines.push("");
  lines.push(`- **Duración de cita típica:** ${v(horarios.duracionCita)}`);
  lines.push(`- **Comidas / descansos:** ${v(horarios.descansos)}`);
  lines.push("");

  // 3. Servicios
  lines.push("## 3. Servicios y precios");
  const serviciosValidos = servicios.filter((s) => (s.servicio ?? "").trim().length > 0);
  if (serviciosValidos.length === 0) {
    lines.push("_Sin servicios capturados._");
  } else {
    for (const s of serviciosValidos) {
      lines.push(`### ${v(s.servicio)}`);
      lines.push(`- **Precio:** ${v(s.precio)}`);
      lines.push(`- **Duración:** ${v(s.duracion)}`);
      lines.push(`- **Notas / requisitos:** ${v(s.notas)}`);
      lines.push("");
    }
  }
  lines.push("");

  // 4. FAQs
  lines.push("## 4. Preguntas frecuentes");
  const faqsValidas = faqs.filter((f) => (f.pregunta ?? "").trim().length > 0);
  if (faqsValidas.length === 0) {
    lines.push("_Sin preguntas frecuentes capturadas._");
  } else {
    for (const f of faqsValidas) {
      lines.push(`**P:** ${v(f.pregunta)}`);
      lines.push("");
      lines.push(`**R:** ${v(f.respuesta)}`);
      lines.push("");
    }
  }
  lines.push("");

  // 5. Políticas
  lines.push("## 5. Políticas del negocio");
  lines.push(`- **Cancelación:** ${v(politicas.cancelacion)}`);
  lines.push(`- **Llegadas tarde:** ${v(politicas.llegadasTarde)}`);
  lines.push(`- **Formas de pago:** ${v(politicas.formasPago)}`);
  lines.push(`- **Requisitos primera cita:** ${v(politicas.requisitosPrimeraCita)}`);
  lines.push(`- **Otras:** ${v(politicas.otras)}`);
  lines.push("");

  // 6. Personalidad de Lidia
  lines.push("## 6. Personalidad de Lidia");
  lines.push(`- **Tono:** ${v(personalidad.tono)}`);
  lines.push(`- **¿Da precios por WhatsApp?:** ${v(personalidad.preciosWhatsApp)}`);
  if ((personalidad.especificaPrecios ?? "").trim()) {
    lines.push(`- **Precios que sí puede dar:** ${v(personalidad.especificaPrecios)}`);
  }
  lines.push(`- **Nunca debe decir/hacer:** ${v(personalidad.nuncaDecir)}`);
  lines.push(`- **Frases clave:** ${v(personalidad.frasesClave)}`);
  lines.push("");

  // 7. Meta Business / WhatsApp
  lines.push("## 7. Meta Business / WhatsApp");
  lines.push(`- **Estado Meta Business:** ${v(metaBusiness.estado)}`);
  lines.push(`- **Número de WhatsApp:** ${v(metaBusiness.numeroWhatsapp)}`);
  lines.push(`- **Acceso a Business Suite:** ${v(metaBusiness.accesoSuite)}`);
  lines.push("");

  // 8. Recordatorios
  lines.push("## 8. Recordatorios automáticos");
  if (recordatorios.length === 0) {
    lines.push("_Ninguno seleccionado._");
  } else {
    for (const r of recordatorios) lines.push(`- ${r}`);
  }
  lines.push("");

  // 9. Contacto de escalación
  lines.push("## 9. Contacto para escalaciones");
  lines.push(`- **Responsable:** ${v(contacto.nombre)}`);
  lines.push(`- **Teléfono WhatsApp:** ${v(contacto.telefono)}`);
  lines.push(`- **Email:** ${v(contacto.email)}`);
  lines.push("");

  return lines.join("\n");
}

/** Nombre de archivo seguro para Drive: "Negocio — YYYY-MM-DD.md". */
export function buildFilename(data: OnboardingData, date = new Date()): string {
  const raw = (data.negocio.nombre ?? "").trim() || "Negocio sin nombre";
  const safe = raw
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 80)
    .trim();
  const iso = date.toISOString().slice(0, 10); // YYYY-MM-DD
  return `${safe} — ${iso}.md`;
}
