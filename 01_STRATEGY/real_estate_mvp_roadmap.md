# Real Estate MVP Roadmap: PoC "Infiltración Operativa 1.0"

**Status:** Planning
**Target:** Vendedora Independiente (Top Producer) -> Agencia Inmobiliaria
**Goal:** Validar el sistema LidiaLabs agendando citas calificadas en piloto automático para bienes raíces de alto ticket.

Este documento mapea **absolutamente todos los activos y configuraciones** requeridos antes de hacer el pitch final e iniciar el Proof of Concept (PoC) de 30 días.

---

## 1. Producto y Frontend (Interacción con el Cliente/Agencia)

### A. Landing Page (Micro-Site de Captura)
No es un sitio web corporativo completo, sino una "Sales Page" hiper-enfocada (basada en las directrices de `DESIGN.md`).
*   **Hero Section:** "Usted Muestre la Propiedad. Lidia Agenda la Cita."
*   **Social Proof / Demo:** Video tipo "Aha! Moment" de 15 segundos mostrando un lead de Facebook entrando a las 2 AM y la IA agendando la visita.
*   **Value Prop:** Explicación del "Vetting Engine" (cómo la IA filtra curiosos vs. compradores reales).
*   **Call to Action (CTA):** "Aplicar para el PoC Privado" o "Agendar Demo".

### B. Flujo de Suscripción y Onboarding (El "Setup")
Proceso sin fricción para que la vendedora nos dé las llaves de su operación.
*   **Formulario de Captura de Inventario:** Recolección de PDFs/Links de las top 5 propiedades que quiere mover este mes.
*   **Perfilamiento de Calificación:** ¿Qué hace a un lead "calificado" para ella? (Rango de crédito autorizado, zona, urgencia de compra).
*   **Conexión de Calendario:** Integración (Calendly, Google Calendar) para que Lidia pueda ver disponibilidad real.

---

## 2. Infraestructura RevOps & IA (El "Motor" Interno)

### A. Configuración del Agente (Lidia Real Estate)
*   **System Prompt "Real Estate":** Instrucciones estrictas para que Lidia actúe como "Asistente Ejecutiva de [Nombre de la Vendedora]".
*   **Vetting Engine (Matriz de Calificación):** Árbol de decisiones para la IA. Preguntas obligatorias antes de soltar el link del calendario:
    1.  *¿Es crédito aprobado o recurso propio?*
    2.  *¿Para cuándo planea mudarse?*
*   **Guardrails:** Límites de la IA (Ej. No negociar precio, no dar direcciones exactas sin cita previa).

### B. Flujos de Automatización (Make/Zapier)
*   **Inbound Flow:** Lead de Facebook Ads / Portales Inmobiliarios -> Webhook -> Lidia AI -> WhatsApp del Lead.
*   **Handoff Flow:** Lead calificado -> Agenda Cita -> Alerta SMS/Slack a la vendedora: *"Cita Confirmada para Propiedad X. Cliente con crédito pre-aprobado."*

---

## 3. Enablement Assets (El "Kit de Ventas y Cierre")

Estos son los documentos que usaremos para convencer a la vendedora independiente y, posteriormente, al director de su agencia.

*   [x] **Distribution Plan (`real_estate_distribution_plan.html`):** Nuestro plan interno de 30 días para infiltrar y escalar.
*   [x] **Offer Memo (`real_estate_offer_memo.html`):** El PDF Ejecutivo (Look & Feel minimalista) con la propuesta, los precios (Alpha, Elite, Empire) y la garantía de 5 citas.
*   [ ] **Service Level Agreement (SLA):** Un documento de 1 página estableciendo reglas del juego del PoC. (Responsabilidad de la vendedora de asistir a las citas, nuestra responsabilidad de uptime tecnológico).
*   [ ] **"Show, Don't Tell" Demo Asset:** El video real de la pantalla de WhatsApp mostrando cómo Lidia maneja una objeción común (Ej. *"Está muy cara"* -> Lidia: *"Entiendo, ¿cuál es su presupuesto máximo para ver si tenemos opciones off-market?"*).

---

## Próximos Pasos (Next Actions)

1.  **Construir el Agente Base:** Configurar el prompt específico de bienes raíces y la lógica de agendamiento.
2.  **Grabar la Demo:** Simular una conversación de WhatsApp perfecta y grabarla. Es el activo de marketing #1.
3.  **Diseñar la Landing Page:** Ensamblar el diseño minimalista y conectar el formulario de Onboarding.
4.  **Redactar el SLA del PoC:** Definir las expectativas claras para la prueba de 30 días.
