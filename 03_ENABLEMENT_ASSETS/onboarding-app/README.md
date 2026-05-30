# LidiaLabs — Onboarding (`start.lidialabs.com`)

Formulario de onboarding de 5 pasos para clientes nuevos de LidiaLabs. Captura
negocio, horarios, servicios, FAQs, políticas, personalidad de Lidia, Meta
Business y contacto de escalación, y guarda cada respuesta como un archivo
`.md` estructurado en una carpeta de **Google Drive** (vía Apps Script).

## Stack
- Next.js 16 (App Router) + TypeScript
- Sin Tailwind: CSS plano portado del diseño original (Inter + JetBrains Mono)
- Validación con `zod`
- Entrega a Drive vía un Web App de Google Apps Script

## Estructura
```
app/
  page.tsx              # renderiza el formulario
  layout.tsx            # metadata, lang es
  globals.css           # estilos (tema dark)
  api/submit/route.ts   # POST: valida → arma .md → manda a Apps Script
components/
  OnboardingForm.tsx    # wizard de 5 pasos (client component)
lib/
  types.ts              # schema zod + tipo OnboardingData
  markdown.ts           # buildOnboardingMarkdown() + buildFilename()
  markdown.test.ts      # tests (node:test)
  drive.ts              # uploadMarkdown(): fetch al Apps Script
apps-script/
  Code.gs               # script que escribe el .md en Drive (lo despliegas tú)
```

## Scripts
```bash
npm run dev        # desarrollo
npm run build      # build de producción
npm run typecheck  # tsc --noEmit
npm test           # tests del generador de Markdown
```

## Variables de entorno
Copia `.env.local.example` a `.env.local` y rellena:
```bash
APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
APPS_SCRIPT_TOKEN=un-token-secreto-largo-y-aleatorio
```
En Vercel: **Settings → Environment Variables** con esos mismos dos valores.

## Configurar Google Apps Script (una sola vez)
1. Crea/elige la carpeta destino en Google Drive y copia su **ID** de la URL:
   `https://drive.google.com/drive/folders/<ESTE_ID>`
2. Ve a https://script.google.com → **Nuevo proyecto**.
3. Pega el contenido de [`apps-script/Code.gs`](apps-script/Code.gs) y edita arriba:
   - `FOLDER_ID` = el ID de la carpeta del paso 1
   - `SHARED_TOKEN` = un token secreto largo (el mismo que `APPS_SCRIPT_TOKEN`)
4. **Implementar → Nueva implementación → Tipo: Aplicación web**:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
   - Implementar → autoriza los permisos de Drive → copia la **URL** `/exec`.
5. Pon esa URL en `APPS_SCRIPT_URL` (local y Vercel) y el token en `APPS_SCRIPT_TOKEN`.

> El archivo se crea como propiedad de tu cuenta, así que no hay límites de
> cuota ni dependes de políticas de Service Account de la organización.

## Deploy
Proyecto independiente en Vercel apuntando a `start.lidialabs.com`. El dominio
y DNS (Namecheap) se configuran aparte.
