"use client";

import { useState, useRef, useEffect } from "react";
import type { OnboardingData } from "@/lib/types";

const WHATSAPP_NOTIFY = "526622335208"; // número de LidiaLabs para el aviso final

const DIAS: Array<[keyof OnboardingData["horarios"], string]> = [
  ["lunes", "Lunes"],
  ["martes", "Martes"],
  ["miercoles", "Miércoles"],
  ["jueves", "Jueves"],
  ["viernes", "Viernes"],
  ["sabado", "Sábado"],
  ["domingo", "Domingo"],
];

const HORA_DEFAULT_DESDE = "09:00";
const HORA_DEFAULT_HASTA = "18:00";

// Horas comunes cada 30 min, de 5:00am a 12:00am (medianoche).
// value = formato 24h "HH:MM" (lo que se guarda); label = 12h am/pm.
function buildTimeOptions(): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  for (let m = 300; m <= 1440; m += 30) {
    const h24 = Math.floor(m / 60) % 24;
    const min = m % 60;
    const value = `${String(h24).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    const period = h24 < 12 ? "am" : "pm";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    const label = `${h12}:${String(min).padStart(2, "0")}${period}`;
    out.push({ value, label });
  }
  return out;
}

const TIME_OPTIONS = buildTimeOptions();

type HoursState = { state: "unset" | "open" | "closed"; from: string; to: string };

function parseHours(value: string): HoursState {
  const v = value.trim();
  if (v === "") return { state: "unset", from: HORA_DEFAULT_DESDE, to: HORA_DEFAULT_HASTA };
  if (/^cerrado$/i.test(v)) return { state: "closed", from: HORA_DEFAULT_DESDE, to: HORA_DEFAULT_HASTA };
  const m = v.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (m) {
    return { state: "open", from: m[1].padStart(5, "0"), to: m[2].padStart(5, "0") };
  }
  return { state: "open", from: HORA_DEFAULT_DESDE, to: HORA_DEFAULT_HASTA };
}

function TimeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const current = TIME_OPTIONS.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    // centra la opción seleccionada al abrir
    menuRef.current?.querySelector(".selected")?.scrollIntoView({ block: "center" });
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="timeselect" ref={ref}>
      <button type="button" className="timeselect-trigger" onClick={() => setOpen((o) => !o)}>
        <span>{current ? current.label : value}</span>
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="timeselect-menu" role="listbox" ref={menuRef}>
          {TIME_OPTIONS.map((o) => (
            <button
              type="button"
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              className={`timeselect-option${o.value === value ? " selected" : ""}`}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DayHours({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const parsed = parseHours(value);

  const setOpen = () => {
    const from = parsed.state === "open" ? parsed.from : HORA_DEFAULT_DESDE;
    const to = parsed.state === "open" ? parsed.to : HORA_DEFAULT_HASTA;
    onChange(`${from} - ${to}`);
  };
  const setClosed = () => onChange("Cerrado");
  const setFrom = (from: string) => onChange(`${from || HORA_DEFAULT_DESDE} - ${parsed.to}`);
  const setTo = (to: string) => onChange(`${parsed.from} - ${to || HORA_DEFAULT_HASTA}`);

  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      <label className="form-label">{label}</label>
      <div className="hours-toggle">
        <button type="button" className={parsed.state === "open" ? "active" : ""} onClick={setOpen}>
          Abierto
        </button>
        <button type="button" className={parsed.state === "closed" ? "active" : ""} onClick={setClosed}>
          Cerrado
        </button>
      </div>
      {parsed.state === "open" && (
        <div className="time-range">
          <TimeSelect value={parsed.from} onChange={setFrom} />
          <span>a</span>
          <TimeSelect value={parsed.to} onChange={setTo} />
        </div>
      )}
    </div>
  );
}

const emptyForm: OnboardingData = {
  negocio: { nombre: "", giro: "", direccion: "", ciudad: "", ubicacionLidia: "" },
  horarios: {
    lunes: "", martes: "", miercoles: "", jueves: "", viernes: "", sabado: "", domingo: "",
    duracionCita: "", descansos: "",
  },
  servicios: [{ servicio: "", precio: "", duracion: "", notas: "" }],
  faqs: [{ pregunta: "", respuesta: "" }],
  politicas: { cancelacion: "", llegadasTarde: "", formasPago: "", requisitosPrimeraCita: "", otras: "" },
  contacto: { nombre: "", telefono: "", email: "" },
  personalidad: {
    tono: "Formal y profesional",
    preciosWhatsApp: "Sí, todos",
    especificaPrecios: "",
    nuncaDecir: "",
    frasesClave: "",
  },
  metaBusiness: { estado: "Sí tengo Meta Business", numeroWhatsapp: "", accesoSuite: "Sí" },
  recordatorios: [],
};

type Section = keyof OnboardingData;
type ArraySection = "servicios" | "faqs";

export default function OnboardingForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<OnboardingData>(emptyForm);

  const handleNestedChange = <S extends Exclude<Section, ArraySection | "recordatorios">>(
    section: S,
    field: keyof OnboardingData[S],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleArrayChange = (
    section: ArraySection,
    index: number,
    field: string,
    value: string
  ) => {
    setFormData((prev) => {
      const newArray = [...prev[section]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [section]: newArray };
    });
  };

  const addArrayItem = (section: ArraySection, defaultItem: Record<string, string>) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...prev[section], defaultItem],
    }));
  };

  const removeArrayItem = (section: ArraySection, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const applyMondayToAll = () => {
    setFormData((prev) => {
      const v = prev.horarios.lunes.trim();
      if (!v) return prev;
      return {
        ...prev,
        horarios: {
          ...prev.horarios,
          martes: v, miercoles: v, jueves: v, viernes: v, sabado: v, domingo: v,
        },
      };
    });
  };

  const toggleRecordatorio = (valor: string) => {
    setFormData((prev) => {
      const current = prev.recordatorios;
      return current.includes(valor)
        ? { ...prev, recordatorios: current.filter((r) => r !== valor) }
        : { ...prev, recordatorios: [...current, valor] };
    });
  };

  const nextStep = () => {
    window.scrollTo(0, 0);
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    window.scrollTo(0, 0);
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "No se pudo enviar el formulario.");
      }
      setIsSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hubo un error al enviar el formulario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    const waText = encodeURIComponent("He terminado el formulario");
    const waUrl = `https://wa.me/${WHATSAPP_NOTIFY}?text=${waText}`;
    return (
      <div className="app-container" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="success-container">
          <div className="success-icon">✓</div>
          <h2 className="form-title">¡Formulario Completado!</h2>
          <p className="form-subtitle">LidiaLabs está listo para inicializar tu infraestructura de crecimiento.</p>
          <a
            href={waUrl}
            className="btn btn-primary"
            style={{ display: "inline-block", textDecoration: "none" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Avisar a LidiaLabs que ya terminé
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="header">
        <div className="header-left">LidiaLabs</div>
        <div className="header-right">Onboarding</div>
      </div>

      <div className="form-content">
        {step === 1 && (
          <>
            <div className="step-indicator">Paso 1 de 5</div>
            <h2 className="form-title">Tu Negocio</h2>
            <p className="form-subtitle">Comencemos con lo básico para que Lidia entienda quiénes son.</p>

            <div className="form-group">
              <label className="form-label">Nombre del negocio</label>
              <input className="form-input" value={formData.negocio.nombre} onChange={(e) => handleNestedChange("negocio", "nombre", e.target.value)} placeholder="Ej. LidiaLabs" />
            </div>
            <div className="form-group">
              <label className="form-label">Giro <span>(Ej. inmobiliaria, clínica médica, etc.)</span></label>
              <input className="form-input" value={formData.negocio.giro} onChange={(e) => handleNestedChange("negocio", "giro", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Dirección / Ubicación</label>
              <input className="form-input" value={formData.negocio.direccion} onChange={(e) => handleNestedChange("negocio", "direccion", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Ciudad y Estado</label>
              <input className="form-input" value={formData.negocio.ciudad} onChange={(e) => handleNestedChange("negocio", "ciudad", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">¿Cómo quieres que Lidia describa tu ubicación?</label>
              <textarea className="form-textarea" value={formData.negocio.ubicacionLidia} onChange={(e) => handleNestedChange("negocio", "ubicacionLidia", e.target.value)} placeholder="Ej. Estamos en Av. Revolución 400, a 2 cuadras del metro." />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="step-indicator">Paso 2 de 5</div>
            <h2 className="form-title">Horarios y Servicios</h2>
            <p className="form-subtitle">Define cuándo operan y qué ofrecen.</p>

            <h3>Horarios de Atención</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px", marginTop: "16px" }}>
              {DIAS.map(([key, label]) => (
                <DayHours
                  key={key}
                  label={label}
                  value={formData.horarios[key]}
                  onChange={(v) => handleNestedChange("horarios", key, v)}
                />
              ))}
            </div>
            <button type="button" className="ghost-btn" onClick={applyMondayToAll} style={{ marginBottom: "24px" }}>
              Copiar el horario del lunes a toda la semana
            </button>

            <div className="form-group">
              <label className="form-label">Duración de una cita típica</label>
              <input className="form-input" value={formData.horarios.duracionCita} onChange={(e) => handleNestedChange("horarios", "duracionCita", e.target.value)} placeholder="Ej. 30 minutos, 1 hora" />
            </div>
            <div className="form-group">
              <label className="form-label">Horarios de comida o descanso</label>
              <input className="form-input" value={formData.horarios.descansos} onChange={(e) => handleNestedChange("horarios", "descansos", e.target.value)} />
            </div>

            <h3 style={{ marginTop: "48px", marginBottom: "16px" }}>Servicios o Productos y Precios</h3>
            <div className="dynamic-list">
              {formData.servicios.map((s, i) => (
                <div key={i} className="dynamic-item">
                  {formData.servicios.length > 1 && (
                    <button className="remove-btn" onClick={() => removeArrayItem("servicios", i)}>Eliminar</button>
                  )}
                  <div className="form-group">
                    <label className="form-label">Nombre del servicio o producto</label>
                    <input className="form-input" value={s.servicio} onChange={(e) => handleArrayChange("servicios", i, "servicio", e.target.value)} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="form-group">
                      <label className="form-label">Precio</label>
                      <input className="form-input" value={s.precio} onChange={(e) => handleArrayChange("servicios", i, "precio", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Duración</label>
                      <input className="form-input" value={s.duracion} onChange={(e) => handleArrayChange("servicios", i, "duracion", e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Notas / Requisitos</label>
                    <input className="form-input" value={s.notas} onChange={(e) => handleArrayChange("servicios", i, "notas", e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
            <button className="add-btn" onClick={() => addArrayItem("servicios", { servicio: "", precio: "", duracion: "", notas: "" })}>+ Agregar otro servicio o producto</button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="step-indicator">Paso 3 de 5</div>
            <h2 className="form-title">Preguntas Frecuentes y Políticas</h2>
            <p className="form-subtitle">Entrena a Lidia para que responda exactamente como tú quieres.</p>

            <h3>Preguntas Frecuentes</h3>
            <div className="dynamic-list" style={{ marginTop: "16px" }}>
              {formData.faqs.map((f, i) => (
                <div key={i} className="dynamic-item">
                  {formData.faqs.length > 1 && (
                    <button className="remove-btn" onClick={() => removeArrayItem("faqs", i)}>Eliminar</button>
                  )}
                  <div className="form-group">
                    <label className="form-label">Pregunta del cliente</label>
                    <input className="form-input" value={f.pregunta} onChange={(e) => handleArrayChange("faqs", i, "pregunta", e.target.value)} placeholder="Ej. ¿Tienen estacionamiento?" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Respuesta de Lidia</label>
                    <textarea className="form-textarea" value={f.respuesta} onChange={(e) => handleArrayChange("faqs", i, "respuesta", e.target.value)} placeholder="Ej. Sí, contamos con valet parking gratuito." />
                  </div>
                </div>
              ))}
            </div>
            <button className="add-btn" onClick={() => addArrayItem("faqs", { pregunta: "", respuesta: "" })}>+ Agregar otra pregunta</button>

            <h3 style={{ marginTop: "48px", marginBottom: "16px" }}>Políticas del Negocio</h3>
            <div className="form-group">
              <label className="form-label">Cancelación de citas</label>
              <input className="form-input" value={formData.politicas.cancelacion} onChange={(e) => handleNestedChange("politicas", "cancelacion", e.target.value)} placeholder="Ej. Se puede cancelar hasta 2 horas antes" />
            </div>
            <div className="form-group">
              <label className="form-label">Llegadas tarde</label>
              <input className="form-input" value={formData.politicas.llegadasTarde} onChange={(e) => handleNestedChange("politicas", "llegadasTarde", e.target.value)} placeholder="Ej. Tolerancia de 15 minutos" />
            </div>
            <div className="form-group">
              <label className="form-label">Formas de pago aceptadas</label>
              <input className="form-input" value={formData.politicas.formasPago} onChange={(e) => handleNestedChange("politicas", "formasPago", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Requisitos para primera cita</label>
              <input className="form-input" value={formData.politicas.requisitosPrimeraCita} onChange={(e) => handleNestedChange("politicas", "requisitosPrimeraCita", e.target.value)} />
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="step-indicator">Paso 4 de 5</div>
            <h2 className="form-title">Personalidad de Lidia</h2>
            <p className="form-subtitle">Calibra el tono del agente para tu negocio.</p>

            <div className="form-group">
              <label className="form-label">Tono de conversación</label>
              <div className="radio-group">
                {[
                  { id: "Formal y profesional", desc: "Seria, clara y respetuosa. Trato muy profesional." },
                  { id: "Cálida y profesional", desc: "Amabilidad y cercanía, sin perder profesionalismo." },
                  { id: "Casual y amigable", desc: "Natural, relajada y muy cercana." },
                ].map((opt) => (
                  <label key={opt.id} className={`radio-card ${formData.personalidad.tono === opt.id ? "selected" : ""}`}>
                    <input type="radio" name="tono" checked={formData.personalidad.tono === opt.id} onChange={() => handleNestedChange("personalidad", "tono", opt.id)} />
                    <div className="radio-content">
                      <span className="radio-title">{opt.id}</span>
                      <span className="radio-desc">{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">¿Lidia puede dar precios por WhatsApp?</label>
              <select className="form-select" value={formData.personalidad.preciosWhatsApp} onChange={(e) => handleNestedChange("personalidad", "preciosWhatsApp", e.target.value)}>
                <option>Sí, todos</option>
                <option>Solo algunos</option>
                <option>No</option>
              </select>
            </div>

            {formData.personalidad.preciosWhatsApp === "Solo algunos" && (
              <div className="form-group">
                <label className="form-label">Especifica cuáles precios sí puede dar</label>
                <input className="form-input" value={formData.personalidad.especificaPrecios} onChange={(e) => handleNestedChange("personalidad", "especificaPrecios", e.target.value)} />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Algo que Lidia NUNCA debe decir o hacer</label>
              <textarea className="form-textarea" value={formData.personalidad.nuncaDecir} onChange={(e) => handleNestedChange("personalidad", "nuncaDecir", e.target.value)} placeholder="Ej. No mencionar a la competencia, no dar diagnósticos." />
            </div>

            <div className="form-group">
              <label className="form-label">Frases clave que quieres que use</label>
              <input className="form-input" value={formData.personalidad.frasesClave} onChange={(e) => handleNestedChange("personalidad", "frasesClave", e.target.value)} placeholder="Ej. ¡Con gusto!, Aquí te esperamos" />
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <div className="step-indicator">Paso 5 de 5</div>
            <h2 className="form-title">Operación y Conexión</h2>
            <p className="form-subtitle">Configuración final de Meta Business y contacto de soporte.</p>

            <h3>Meta Business</h3>
            <div className="form-group" style={{ marginTop: "16px" }}>
              <div className="radio-group">
                {["Sí tengo Meta Business", "No tengo Meta Business", "No sé qué es"].map((opt) => (
                  <label key={opt} className={`radio-card ${formData.metaBusiness.estado === opt ? "selected" : ""}`}>
                    <input type="radio" name="meta" checked={formData.metaBusiness.estado === opt} onChange={() => handleNestedChange("metaBusiness", "estado", opt)} />
                    <span className="radio-title">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Número de WhatsApp del negocio</label>
              <input className="form-input" value={formData.metaBusiness.numeroWhatsapp} onChange={(e) => handleNestedChange("metaBusiness", "numeroWhatsapp", e.target.value)} />
            </div>

            <h3 style={{ marginTop: "48px", marginBottom: "16px" }}>Recordatorios Automáticos</h3>
            <div className="checkbox-group">
              {["24 horas antes de la cita", "2 horas antes de la cita", "Seguimiento después de la cita"].map((opt) => (
                <label key={opt} className="checkbox-label">
                  <input type="checkbox" checked={formData.recordatorios.includes(opt)} onChange={() => toggleRecordatorio(opt)} />
                  {opt}
                </label>
              ))}
            </div>

            <h3 style={{ marginTop: "48px", marginBottom: "16px" }}>Contacto para Escalaciones</h3>
            <p className="form-subtitle" style={{ fontSize: "0.85rem", marginBottom: "16px" }}>Persona responsable si un cliente requiere atención humana.</p>

            <div className="form-group">
              <label className="form-label">Nombre del responsable</label>
              <input className="form-input" value={formData.contacto.nombre} onChange={(e) => handleNestedChange("contacto", "nombre", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono WhatsApp</label>
              <input className="form-input" value={formData.contacto.telefono} onChange={(e) => handleNestedChange("contacto", "telefono", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={formData.contacto.email} onChange={(e) => handleNestedChange("contacto", "email", e.target.value)} />
            </div>
          </>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="form-actions">
        {step > 1 ? (
          <button className="btn btn-secondary" onClick={prevStep} disabled={isSubmitting}>Atrás</button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <button className="btn btn-primary" onClick={nextStep}>Siguiente</button>
        ) : (
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Completar y Enviar"}
          </button>
        )}
      </div>
    </div>
  );
}
