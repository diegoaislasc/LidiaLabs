import { z } from "zod";

// Cada campo es string-lenient (el formulario permite dejar campos vacíos).
const str = z.string().trim().default("");

export const servicioSchema = z.object({
  servicio: str,
  precio: str,
  duracion: str,
  notas: str,
});

export const faqSchema = z.object({
  pregunta: str,
  respuesta: str,
});

export const onboardingSchema = z.object({
  negocio: z.object({
    nombre: str,
    giro: str,
    direccion: str,
    ciudad: str,
    ubicacionLidia: str,
  }),
  horarios: z.object({
    lunes: str,
    martes: str,
    miercoles: str,
    jueves: str,
    viernes: str,
    sabado: str,
    domingo: str,
    duracionCita: str,
    descansos: str,
  }),
  servicios: z.array(servicioSchema).default([]),
  faqs: z.array(faqSchema).default([]),
  politicas: z.object({
    cancelacion: str,
    llegadasTarde: str,
    formasPago: str,
    requisitosPrimeraCita: str,
    otras: str,
  }),
  contacto: z.object({
    nombre: str,
    telefono: str,
    email: str,
  }),
  personalidad: z.object({
    tono: str,
    preciosWhatsApp: str,
    especificaPrecios: str,
    nuncaDecir: str,
    frasesClave: str,
  }),
  metaBusiness: z.object({
    estado: str,
    numeroWhatsapp: str,
    accesoSuite: str,
  }),
  recordatorios: z.array(z.string()).default([]),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
