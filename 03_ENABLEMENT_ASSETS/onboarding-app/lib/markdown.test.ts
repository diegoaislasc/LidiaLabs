import { test } from "node:test";
import assert from "node:assert/strict";
import { buildOnboardingMarkdown, buildFilename } from "./markdown.ts";
import type { OnboardingData } from "./types.ts";

const sample: OnboardingData = {
  negocio: {
    nombre: "Barbería El Corte",
    giro: "barbería",
    direccion: "Av. Reforma 100",
    ciudad: "CDMX",
    ubicacionLidia: "Frente al parque",
  },
  horarios: {
    lunes: "9-18", martes: "9-18", miercoles: "9-18", jueves: "9-18",
    viernes: "9-20", sabado: "9-14", domingo: "Cerrado",
    duracionCita: "30 min", descansos: "14-15",
  },
  servicios: [
    { servicio: "Corte", precio: "$150", duracion: "30 min", notas: "Incluye lavado" },
    { servicio: "", precio: "", duracion: "", notas: "" }, // vacío: debe filtrarse
  ],
  faqs: [{ pregunta: "¿Aceptan tarjeta?", respuesta: "Sí" }],
  politicas: {
    cancelacion: "2h antes", llegadasTarde: "15 min tolerancia",
    formasPago: "Efectivo y tarjeta", requisitosPrimeraCita: "Ninguno", otras: "",
  },
  contacto: { nombre: "Juan", telefono: "555", email: "juan@corte.mx" },
  personalidad: {
    tono: "Casual y amigable", preciosWhatsApp: "Sí, todos",
    especificaPrecios: "", nuncaDecir: "No prometer descuentos", frasesClave: "¡Va!",
  },
  metaBusiness: { estado: "Sí tengo Meta Business", numeroWhatsapp: "5566", accesoSuite: "Sí" },
  recordatorios: ["24 horas antes de la cita"],
};

test("incluye título con nombre del negocio", () => {
  const md = buildOnboardingMarkdown(sample);
  assert.match(md, /^# Barbería El Corte — Onboarding Lidia/);
});

test("filtra servicios vacíos", () => {
  const md = buildOnboardingMarkdown(sample);
  assert.match(md, /### Corte/);
  // solo un encabezado de servicio (### Corte), no uno vacío
  assert.equal((md.match(/^### /gm) || []).length, 1);
});

test("renderiza recordatorios seleccionados", () => {
  const md = buildOnboardingMarkdown(sample);
  assert.match(md, /- 24 horas antes de la cita/);
});

test("muestra guion en campos vacíos", () => {
  const empty = { ...sample, politicas: { ...sample.politicas, otras: "" } };
  const md = buildOnboardingMarkdown(empty);
  assert.match(md, /\*\*Otras:\*\* —/);
});

test("buildFilename produce nombre seguro con fecha", () => {
  const name = buildFilename(sample, new Date("2026-05-29T12:00:00Z"));
  assert.equal(name, "Barbería El Corte — 2026-05-29.md");
});

test("buildFilename sanea caracteres inválidos", () => {
  const data = { ...sample, negocio: { ...sample.negocio, nombre: "A/B:C*?" } };
  const name = buildFilename(data, new Date("2026-05-29T12:00:00Z"));
  assert.equal(name, "ABC — 2026-05-29.md");
});
