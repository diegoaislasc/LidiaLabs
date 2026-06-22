import asyncio
import pydantic
from google.antigravity import Agent
from google.adk.workflow import Workflow, FunctionNode, START, Edge
from google.adk.sessions.in_memory_session_service import InMemorySessionService
from google.adk import Runner
from google.genai import types

from agents import finder_config, qualifier_config, outreach_config
from tools import web_search, fetch_website_content, save_lead_to_db

# --- Node Implementation Functions ---

async def run_finder(ctx, node_input) -> dict:
    """Executes search in pure python, then parses with LeadFinderAgent in 1 model request."""
    # Extract search query from node_input
    if hasattr(node_input, "parts") and node_input.parts:
        query = node_input.parts[0].text
    else:
        query = str(node_input)
        
    print(f"\n[LeadFinder] Ejecutando búsqueda DuckDuckGo para: '{query}'...")
    search_results = web_search(query)
    
    print("[LeadFinder] Procesando resultados de búsqueda con LeadFinderAgent (1 request)...")
    await asyncio.sleep(12)  # Delay to avoid hitting rate limits at startup
    
    async with Agent(config=finder_config) as agent:
        prompt = (
            f"Procesa los siguientes resultados de búsqueda web de DuckDuckGo y extrae una lista estructurada "
            f"de 3 prospectos reales con sus nombres y URLs directas:\n\n{search_results}"
        )
        response = await agent.chat(prompt)
        result = await response.structured_output()
        
    if not result:
        print("[LeadFinder] Búsqueda finalizada. No se encontraron resultados estructurados.")
        return {"leads": []}
        
    print(f"[LeadFinder] Búsqueda finalizada. Encontrados {len(result.get('leads', []))} leads.")
    return result

async def run_qualifier(ctx, node_input: dict) -> dict:
    """Scrapes websites in pure Python, then qualifies with LeadQualifierAgent in 1 request per lead."""
    leads = node_input.get("leads", [])
    print(f"\n[LeadQualifier] Iniciando calificación para {len(leads)} leads...")
    
    qualified_leads = []
    for lead in leads:
        name = lead.get("name")
        website = lead.get("website")
        
        print(f"[LeadQualifier] Descargando contenido de: '{name}' ({website})...")
        web_content = fetch_website_content(website)
        
        print(f"[LeadQualifier] Calificando lead con LeadQualifierAgent (1 request)...")
        await asyncio.sleep(12)  # Pacing delay
        
        async with Agent(config=qualifier_config) as agent:
            prompt = (
                f"Analiza y califica este prospecto.\n"
                f"Nombre del negocio: {name}\n"
                f"Sitio Web: {website}\n"
                f"Contenido del sitio web:\n{web_content}"
            )
            response = await agent.chat(prompt)
            qualification = await response.structured_output()
            
            if qualification:
                print(f"[LeadQualifier] Calificado: {name} | Score: {qualification.get('score')} | Friction: {qualification.get('appointment_friction_detected')}")
                qualified_leads.append(qualification)
            else:
                print(f"[LeadQualifier] Error al calificar: {name}")
                
    return {"qualified_leads": qualified_leads}

async def run_outreach(ctx, node_input: dict) -> dict:
    """Drafts outreach messages with OutreachAgent in 1 request per lead, and saves directly in Python."""
    qualified_leads = node_input.get("qualified_leads", [])
    target_leads = [l for l in qualified_leads if l.get("score", 0) >= 70]
    print(f"\n[Outreach] Iniciando redacción de propuestas para {len(target_leads)} leads con score >= 70...")
    
    results = []
    for lead in target_leads:
        name = lead.get("lead_name")
        website = lead.get("website")
        reason = lead.get("reason")
        score = lead.get("score")
        
        print(f"[Outreach] Generando mensaje de outreach para '{name}' con OutreachAgent (1 request)...")
        await asyncio.sleep(12)  # Pacing delay
        
        async with Agent(config=outreach_config) as agent:
            prompt = (
                f"Redacta un mensaje de prospección hiper-personalizado en español para WhatsApp.\n"
                f"Nombre del Prospecto: {name}\n"
                f"Sitio Web: {website}\n"
                f"Puntaje de Calificación: {score}\n"
                f"Razones de Fricción Detectadas: {reason}"
            )
            response = await agent.chat(prompt)
            outreach = await response.structured_output()
            
            if outreach:
                # Save directly in Python
                save_lead_to_db(
                    lead_name=name,
                    niche="Dermatólogos o Inmobiliaria",
                    website=website,
                    score=score,
                    qualification_reason=reason,
                    outreach_message=outreach.get("outreach_message", "")
                )
                print(f"[Outreach] Mensaje generado y guardado para '{name}'.")
                results.append(outreach)
            else:
                print(f"[Outreach] Error al generar mensaje para: {name}")
                
    return {"status": "success", "processed_leads": len(results), "details": results}

# --- Nodes Definition ---

finder_node = FunctionNode(func=run_finder, name="finder")
qualifier_node = FunctionNode(func=run_qualifier, name="qualifier")
outreach_node = FunctionNode(func=run_outreach, name="outreach")

# --- Workflow Setup ---

revops_workflow = Workflow(
    name="RevOpsWorkflow",
    edges=[
        Edge(from_node=START, to_node=finder_node),
        Edge(from_node=finder_node, to_node=qualifier_node),
        Edge(from_node=qualifier_node, to_node=outreach_node)
    ]
)
