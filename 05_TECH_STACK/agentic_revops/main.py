import argparse
import asyncio
import json
import os
from dotenv import load_dotenv
load_dotenv()

from google.adk import Runner
from google.adk.sessions.in_memory_session_service import InMemorySessionService
from google.genai import types

from workflow import revops_workflow
from tools import save_lead_to_db

# --- Mock Data for Simulation ---
MOCK_LEADS = {
    "dermatólogos en Monterrey": [
        {"name": "Dermatología Monterrey (Dr. Adrián Garza)", "website": "https://dermatologiamonterrey.mx"},
        {"name": "Clínica Piel Sana", "website": "https://clinicapielsana.com"},
        {"name": "Centro Dermatológico del Norte", "website": "https://dermatologiconorte.mx"}
    ],
    "venta de casas en Guadalajara": [
        {"name": "Inmobiliaria Real GDL", "website": "https://realgdl.com.mx"},
        {"name": "Casas y Espacios Jalisco", "website": "https://casasespaciojalisco.com"},
        {"name": "Punto Urbano Inmobiliaria", "website": "https://puntourbano.mx"}
    ]
}

MOCK_QUALIFICATIONS = {
    "https://dermatologiamonterrey.mx": {
        "score": 85,
        "reason": "El sitio requiere llamar por teléfono directo al consultorio para agendar cita. No cuenta con sistema de agendamiento conversacional ni botón directo a WhatsApp. Fricción de contacto alta.",
        "appointment_friction_detected": True
    },
    "https://clinicapielsana.com": {
        "score": 55,
        "reason": "El sitio web cuenta con un widget integrado de Calendly para agendar citas en línea, pero carece de atención automatizada por WhatsApp para responder dudas previas. Fricción media.",
        "appointment_friction_detected": True
    },
    "https://dermatologiconorte.mx": {
        "score": 92,
        "reason": "Para agendar cita, el paciente debe llenar un formulario de contacto de 8 campos obligatorios y esperar respuesta por correo electrónico. Fricción de agendamiento extremadamente alta.",
        "appointment_friction_detected": True
    },
    "https://realgdl.com.mx": {
        "score": 88,
        "reason": "Sitio web inmobiliario sin agendamiento de visitas interactivo. Requiere enviar un correo electrónico o llamar para agendar visitas a las propiedades. Alta fricción para el comprador.",
        "appointment_friction_detected": True
    },
    "https://casasespaciojalisco.com": {
        "score": 60,
        "reason": "Cuenta con un botón de WhatsApp que redirige al teléfono personal de un agente inmobiliario (respuesta lenta fuera de horario comercial). Fricción de seguimiento media.",
        "appointment_friction_detected": True
    },
    "https://puntourbano.mx": {
        "score": 90,
        "reason": "El sitio web requiere rellenar una solicitud de contacto y esperar a que un asesor marque de vuelta para coordinar la visita a la propiedad. Fricción de respuesta inicial alta.",
        "appointment_friction_detected": True
    }
}

MOCK_OUTREACHES = {
    "Dermatología Monterrey (Dr. Adrián Garza)": (
        "Hola Dr. Adrián Garza, gusto en saludarte. Estaba revisando tu sitio web dermatologiamonterrey.mx y noté que "
        "para agendar una consulta tus pacientes deben llamar directamente por teléfono. Esto puede causar que "
        "algunas citas se pierdan fuera de horario o cuando la línea está ocupada.\n\n"
        "En LidiaLabs desarrollamos a Lidia, una agente de IA en WhatsApp que responde al instante (<5s) en tu nombre, "
        "se conecta a tu calendario real de citas y agenda/confirma automáticamente sin que tengas que hacer nada manual. "
        "¿Te interesaría ver una demostración de 5 minutos sobre cómo automatizamos esto?"
    ),
    "Centro Dermatológico del Norte": (
        "Hola, gusto en saludarlos. Estaba analizando la experiencia del paciente en dermatologiconorte.mx y vi que "
        "para agendar una cita es necesario completar un formulario largo de 8 campos y esperar respuesta por correo.\n\n"
        "Hoy en día los pacientes prefieren la inmediatez de WhatsApp. Con Lidia (nuestra agente de IA), puedes automatizar "
        "toda esa calificación y agendamiento directamente por WhatsApp en segundos, sincronizándolo al instante con tu "
        "calendario real. ¿Les gustaría ver una demo de cómo se vería para sus pacientes?"
    ),
    "Inmobiliaria Real GDL": (
        "Hola, un gusto saludarlos. Revisando realgdl.com.mx, noté que para coordinar visitas a las propiedades "
        "los prospectos deben llamar o mandar un correo y esperar la respuesta de un asesor. En el sector inmobiliario, "
        "la velocidad de respuesta define la venta.\n\n"
        "Por eso creamos a Lidia, una infraestructura de IA en WhatsApp que atiende a tus prospectos 24/7, califica su interés, "
        "les propone horarios disponibles y agenda la visita directamente en el calendario de tus asesores de forma autónoma. "
        "¿Te gustaría agendar una demo corta para verla en acción?"
    ),
    "Punto Urbano Inmobiliaria": (
        "Hola, un gusto saludarte. Viendo tu sitio puntourbano.mx, noté que los prospectos interesados en comprar casas deben "
        "llenar una solicitud y esperar que un asesor les devuelva la llamada para coordinar la cita.\n\n"
        "Con Lidia, automatizamos este primer contacto directamente en WhatsApp. Lidia califica al interesado al instante "
        "y agenda la visita de la propiedad en el calendario de tus asesores 24/7. Evitas que el lead se enfríe y aceleras tu pipeline. "
        "¿Conversamos 5 minutos para mostrarte cómo funciona?"
    )
}

def simulate_pipeline(niche: str, city: str):
    query_key = f"{niche} en {city}"
    print("=" * 60)
    print(f"Iniciando Equipo Agéntico de RevOps (Simulación)")
    print(f"Nicho: {niche} | Ciudad: {city}")
    print("=" * 60)
    
    # 1. Simular LeadFinder
    print(f"\n[LeadFinder] Ejecutando búsqueda DuckDuckGo para: '{query_key}'...")
    leads = MOCK_LEADS.get(query_key, [
        {"name": f"Negocio Ficticio 1 ({niche})", "website": f"https://negocio1{niche.replace(' ', '')}.com"},
        {"name": f"Negocio Ficticio 2 ({niche})", "website": f"https://negocio2{niche.replace(' ', '')}.com"}
    ])
    
    print("[LeadFinder] Procesando resultados de búsqueda con LeadFinderAgent (Simulado)...")
    print(f"[LeadFinder] Búsqueda finalizada. Encontrados {len(leads)} leads.")
    
    # 2. Simular LeadQualifier
    print(f"\n[LeadQualifier] Iniciando calificación para {len(leads)} leads...")
    qualified_leads = []
    for lead in leads:
        name = lead["name"]
        website = lead["website"]
        print(f"[LeadQualifier] Descargando contenido de: '{name}' ({website})...")
        print(f"[LeadQualifier] Calificando lead con LeadQualifierAgent (Simulado)...")
        
        # Buscar calificación mock o generarla
        qual = MOCK_QUALIFICATIONS.get(website, {
            "score": 75,
            "reason": f"Sitio web estándar para {niche}. Muestra canales tradicionales y requiere interacción humana manual.",
            "appointment_friction_detected": True
        })
        
        print(f"[LeadQualifier] Calificado: {name} | Score: {qual['score']} | Friction: {qual['appointment_friction_detected']}")
        qualified_leads.append({
            "lead_name": name,
            "website": website,
            "score": qual["score"],
            "reason": qual["reason"],
            "appointment_friction_detected": qual["appointment_friction_detected"]
        })
        
    # 3. Simular Outreach
    target_leads = [l for l in qualified_leads if l["score"] >= 70]
    print(f"\n[Outreach] Iniciando redacción de propuestas para {len(target_leads)} leads con score >= 70...")
    
    # Limpiar archivo previo
    if os.path.exists("outreach_drafts.json"):
        try:
            os.remove("outreach_drafts.json")
        except:
            pass
            
    processed_count = 0
    for lead in target_leads:
        name = lead["lead_name"]
        website = lead["website"]
        score = lead["score"]
        reason = lead["reason"]
        
        print(f"[Outreach] Generando mensaje de outreach para '{name}' con OutreachAgent (Simulado)...")
        
        # Obtener o simular mensaje
        msg = MOCK_OUTREACHES.get(name, (
            f"Hola, un gusto saludarte. Notamos tu sitio {website} y el proceso de contacto para {niche}.\n"
            f"Lidia es un agente de IA en WhatsApp de LidiaLabs que puede automatizar tus citas..."
        ))
        
        save_lead_to_db(
            lead_name=name,
            niche=niche,
            website=website,
            score=score,
            qualification_reason=reason,
            outreach_message=msg
        )
        print(f"[Outreach] Mensaje generado y guardado para '{name}'.")
        processed_count += 1
        
    print("\n" + "=" * 60)
    print("Flujo de Trabajo Finalizado con Éxito (Simulación)")
    print("=" * 60)
    
    # Mostrar resultados en consola
    if os.path.exists("outreach_drafts.json"):
        with open("outreach_drafts.json", "r", encoding="utf-8") as f:
            saved_leads = json.load(f)
        
        print(f"\nSe generaron y calificaron {len(saved_leads)} prospectos:")
        for idx, saved_lead in enumerate(saved_leads, 1):
            print(f"\n--- Prospecto {idx} ---")
            print(f"Nombre: {saved_lead.get('lead_name')}")
            print(f"Sitio Web: {saved_lead.get('website')}")
            print(f"Puntaje: {saved_lead.get('score')}/100")
            print(f"Razón: {saved_lead.get('qualification_reason')}")
            print(f"Mensaje de Outreach:")
            print(saved_lead.get('outreach_message'))
            print("-" * 30)

async def run_pipeline(niche: str, city: str):
    print("=" * 60)
    print(f"Iniciando Equipo Agéntico de RevOps de LidiaLabs (Live Mode)")
    print(f"Nicho: {niche} | Ciudad: {city}")
    print("=" * 60)
    
    query_text = f"{niche} en {city}"
    part = types.Part(text=query_text)
    message = types.Content(parts=[part])
    
    session_service = InMemorySessionService()
    runner = Runner(
        node=revops_workflow,
        session_service=session_service,
        auto_create_session=True
    )
    
    if os.path.exists("outreach_drafts.json"):
        try:
            os.remove("outreach_drafts.json")
        except:
            pass
            
    try:
        async for event in runner.run_async(
            user_id="diego_director",
            session_id="session_revops_test",
            new_message=message
        ):
            if event.content and event.content.parts:
                text = event.content.parts[0].text
                if text:
                    print(f"\n[{event.author.upper()}]: {text}")
    except Exception as e:
        print(f"\n[ERROR] Ocurrió un error en la ejecución del flujo: {e}")
        return
        
    print("\n" + "=" * 60)
    print("Flujo de Trabajo Finalizado con Éxito")
    print("=" * 60)
    
    if os.path.exists("outreach_drafts.json"):
        try:
            with open("outreach_drafts.json", "r", encoding="utf-8") as f:
                leads = json.load(f)
            
            print(f"\nSe generaron y calificaron {len(leads)} prospectos:")
            for idx, lead in enumerate(leads, 1):
                print(f"\n--- Prospecto {idx} ---")
                print(f"Nombre: {lead.get('lead_name')}")
                print(f"Sitio Web: {lead.get('website')}")
                print(f"Puntaje: {lead.get('score')}/100")
                print(f"Razón: {lead.get('qualification_reason')}")
                print(f"Mensaje de Outreach:")
                print(lead.get('outreach_message'))
                print("-" * 30)
        except Exception as e:
            print(f"Error al leer outreach_drafts.json: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="LidiaLabs Agentic RevOps CLI")
    parser.add_argument("--niche", type=str, default="dermatólogos", help="El nicho de mercado (ej: dermatólogos, venta de casas)")
    parser.add_argument("--city", type=str, default="Monterrey", help="La ciudad objetivo")
    parser.add_argument("--live", action="store_true", help="Ejecutar agentes de IA reales (requiere GEMINI_API_KEY sin cuota agotada)")
    
    args = parser.parse_args()
    
    # Normalizar inputs para coincidir con la base de datos mock si es simulación
    # Si no coincide, usaremos generación mock genérica
    niche_clean = args.niche.lower().strip()
    city_clean = args.city.lower().strip()
    
    if not args.live:
        # Ejecutar modo simulación
        simulate_pipeline(args.niche, args.city)
    else:
        # Ejecutar modo real
        asyncio.run(run_pipeline(args.niche, args.city))
