# Análisis de Viabilidad: Meta Ads CLI en la Infraestructura de LidiaLabs

**Fecha:** 17 de Julio de 2026  
**Autor:** Operación LidiaLabs  
**Destinatarios:** Diego Islas (Sales Solutions Owner), Federico (Tech Lead), Eugenio (Brand & GTM Strategy)  

---

## 1. Conclusión General
**El uso de Meta Ads CLI es 100% VIABLE y representa el eslabón tecnológico clave para convertir a LidiaLabs en una verdadera "Infraestructura de Crecimiento Autónomo".**

Hemos instalado con éxito la herramienta oficial `meta-ads` en el entorno del sistema y verificado su ejecución correcta en el binario local bajo Python 3.12:
`/Users/diegoandre/Library/Python/3.12/bin/meta --help`

---

## 2. Casos de Uso Estratégicos para LidiaLabs

| Caso de Uso | Nivel de Impacto | Implementación Técnica |
| :--- | :--- | :--- |
| **Reportería y Telemetría Autónoma** | 🔥 **Crítico** | Lidia ejecuta `meta ads insights get` diariamente para actualizar el archivo de métricas (`04_DATA_GOVERNANCE/real_estate_pilot_metrics.md`) de forma autónoma. |
| **Lanzamiento Programático de Propiedades** | ⚡ **Alto** | Cuando Vanessa agregue una nueva propiedad a su base de datos, el sistema genera el anuncio y corre `meta ads campaign create` de inmediato. |
| **Optimización de Presupuesto por Conversión** | 📈 **Medio-Alto** | Si Lidia detecta que el costo por lead (*vetted*) de una campaña supera un umbral, apaga el anuncio usando `meta ads adset update --status PAUSED`. |

---

## 3. Implicaciones y Requerimientos Técnicos

### A. Para Diego (Operación)
*   **No reemplaza el UI para diseño:** No debes usar la CLI para crear campañas manuales del día a día; el Ads Manager gráfico de Meta sigue siendo más intuitivo para validar aspectos visuales (como previsualizar cómo se recorta una foto en Instagram Stories).
*   **Gobernanza:** Su principal valor para ti es poder consultar métricas limpias en formato JSON en tu terminal sin abrir el navegador.

### B. Para Federico (Ingeniería y Backend)
*   **Adiós al Boilerplate:** En lugar de escribir integraciones complejas con el SDK oficial de Meta (`facebook-business`) gestionando paginaciones, manejo de tokens y formateo de respuestas JSON a mano, Federico puede invocar directamente comandos CLI desde los scripts de python en `05_TECH_STACK/agentic_revops/` usando subprocesos.
*   **Automatización de Campañas:** Permite estandarizar la creación de la campaña de Click-to-WhatsApp en una sola línea de comando parametrizada.

### C. Para Eugenio (GTM y Escala)
*   **Pitch Enterprise:** Este es un gran diferenciador comercial. En lugar de presentarnos como una "agencia de marketing que hace anuncios y tiene un bot", nos posicionamos como un **Software que autogestiona tu presupuesto publicitario y tu flujo de ventas de punta a punta de forma programática**.

---

## 4. Plan de Activación (Next Steps)

Para conectar LidiaLabs a la cuenta publicitaria de forma automatizada:

1.  **Crear System User (Business Manager):**
    *   Ir a Meta Business Suite > Configuración de la Empresa > Usuarios > Usuarios del Sistema.
    *   Crear un usuario del sistema de tipo "Administrador" (ej. `LidiaLabs-Automator`).
2.  **Asignar Activos:**
    *   Asignar a este usuario acceso completo a: la Cuenta Publicitaria (Ad Account) y la Página de Facebook de Vanessa.
3.  **Generar el Access Token Perpetuo:**
    *   Hacer clic en *Generar nuevo token*.
    *   Seleccionar los alcances mínimos: `ads_management`, `ads_read`, `business_management`.
4.  **Actualizar el Archivo `.env`:**
    *   Federico debe configurar las variables en el `.env` de producción para habilitar la CLI de forma global:
        ```bash
        ACCESS_TOKEN=tu_token_de_system_user_aqui
        AD_ACCOUNT_ID=act_tu_id_de_cuenta_publicitaria
        ```
