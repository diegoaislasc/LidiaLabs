# Integración Servidor MCP: LidiaLabs API (VOP Bienes Raíces)

**Endpoint:** `https://lidialabs.com/api/mcp`  
**Organización:** VOP Bienes Raíces (`3f442f71-bb00-44d8-b9d6-97943351c13c`)  
**Negocio ID:** `03b8d9bb-47ab-4f24-bc4b-49590b35318e`  
**Zona Horaria:** `America/Mexico_City`  
**Vertical:** `real_estate`  

---

## 1. Configuración de `mcpServers`

Para activar este MCP en tu cliente (Antigravity / Claude Code / Cursor), agrega este bloque a tu archivo de configuración `mcp_config.json`:

```json
{
  "mcpServers": {
    "lidia": {
      "serverUrl": "https://lidialabs.com/api/mcp",
      "headers": {
        "Authorization": "Bearer lidia_sk_459aa71ff711335ba4072f995ac32279ce96350949ce42bd"
      }
    }
  }
}
```

---

## 2. Herramientas MCP Disponibles (19 Tools)

### A. Gestión de Contactos (CRM)
*   `list_contacts`: Lista prospectos en el CRM con búsqueda por texto libre y paginación.
*   `get_contact`: Obtiene el detalle de un contacto específico por UUID.
*   `create_contact`: Crea un contacto nuevo (requiere `name`; teléfono/email opcionales, acepta objeto `custom`).
*   `update_contact`: Actualiza datos de un contacto existente.
*   `delete_contact`: Elimina permanentemente un contacto.

### B. Gestión de Citas (Calendario)
*   `list_appointments`: Lista citas filtradas por rango de fecha, estatus o `contactId`.
*   `get_appointment`: Obtiene el detalle de una cita.
*   `create_appointment`: Agenda una cita para un contacto con fechas ISO 8601 offset.
*   `update_appointment`: Reagenda o cambia el estatus de la cita.
*   `cancel_appointment`: Marca una cita como cancelada.
*   `delete_appointment`: Elimina una cita de la base de datos.

### C. Notas y Catálogo Audiovisual de Lidia
*   `list_notes` / `create_note`: Adjunta notas de texto libre a contactos o citas.
*   `add_agent_image`: Registra imágenes en el catálogo de Lidia mediante una URL pública (JPG/PNG/WebP, max 5MB) con su descripción para que Lidia las envíe por WhatsApp.
*   `delete_agent_image`: Elimina una imagen del catálogo de Lidia.

### D. Interacción por WhatsApp (Human-in-the-Loop Enforced)
*   `send_whatsapp_message`: Genera un **borrador (draft)** de respuesta por WhatsApp. *No lo envía directamente*, devuelve un `draft_id`.
*   `confirm_send`: Recibe el `draft_id` y ejecuta el envío real al cliente por WhatsApp (tras la aprobación explícita).
*   `close_conversation`: Cierra o reabre una conversación de WhatsApp.

---

## 3. Prompts Preconfigurados del Servidor

*   `daily_briefing`: Prepara el resumen ejecutivo del día (citas de hoy, sin confirmar y chats abiertos).
*   `book_appointment`: Flujo de lenguaje natural para agendar citas (ej. "jueves 5pm").
*   `triage_inbox`: Revisa las conversaciones de WhatsApp abiertas, las resume y sugiere respuestas.
*   `capture_lead`: Crea contactos a partir de texto o formularios pegados.
*   `setup_lidia`: Modifica y ajusta el system prompt de Lidia según los objetivos del negocio.

---

## 4. Estado Actual de la Cuenta (VOP Bienes Raíces)

Al consultar la API en vivo, los datos registrados hasta la fecha son:

*   **Contactos (2):**
    1.  Diego André Islas (`+526622335208`)
    2.  Federico Elizondo (`+528126143429`)
*   **Citas (1):**
    1.  Cita de prueba confirmada para Federico Elizondo (`2026-06-30`) con metadata: `{"via": "lidia-agent", "propiedad": "Casa en renta, Cumbres Diamante"}`.
