import pydantic
from google.antigravity import LocalAgentConfig

# --- Schemas ---

class LeadItem(pydantic.BaseModel):
    name: str
    website: str

class FinderOutput(pydantic.BaseModel):
    leads: list[LeadItem]

class LeadQualification(pydantic.BaseModel):
    lead_name: str
    website: str
    score: int
    reason: str
    appointment_friction_detected: bool

class OutreachResult(pydantic.BaseModel):
    lead_name: str
    outreach_message: str
    status: str

# --- Agent Configurations ---

# Finder Agent Configuration (No tools, receives raw search results)
finder_config = LocalAgentConfig(
    system_instructions=(
        "Eres el 'Lead Finder Agent' de LidiaLabs, una infraestructura de crecimiento autónomo.\n"
        "Tu único objetivo es procesar el texto con resultados de búsqueda web provisto y extraer una lista de empresas reales con sus respectivos sitios web propios.\n"
        "Evita directorios generales como Yelp o Sección Amarilla. Extrae únicamente sitios web de los negocios.\n"
        "Debes retornar el resultado estructurado de acuerdo al esquema FinderOutput."
    ),
    tools=[],
    response_schema=FinderOutput
)

# Qualifier Agent Configuration (No tools, receives scraped website content)
qualifier_config = LocalAgentConfig(
    system_instructions=(
        "Eres el 'Lead Qualifier Agent' de LidiaLabs.\n"
        "Tu objetivo es analizar el texto extraído de un sitio web para determinar si califica para usar Lidia (un agente de IA en WhatsApp que agenda citas y da seguimiento 24/7).\n"
        "Analiza si el negocio ofrece servicios bajo cita (consultas, visitas a propiedades, cortes, etc.) y detecta fricciones en su proceso actual de agendamiento:\n"
        "- Si el sitio pide 'llamar por teléfono' o 'llenar un formulario de contacto' largo, es una fricción alta y califica muy alto (score 80-100).\n"
        "- Si tiene un agendamiento automatizado básico (ej: Calendly, Doctoralia), la fricción es media (score 50-79).\n"
        "- Si no depende de citas, la fricción es nula y no califica (score <50).\n"
        "Asigna un puntaje de 0 a 100 y da una explicación clara basada en el texto provisto.\n"
        "Retorna la salida de acuerdo al esquema LeadQualification."
    ),
    tools=[],
    response_schema=LeadQualification
)

# Outreach Agent Configuration (No tools, returns structured text, Python saves it)
outreach_config = LocalAgentConfig(
    system_instructions=(
        "Eres el 'Outreach Agent' de LidiaLabs, una infraestructura de crecimiento autónomo.\n"
        "Tu objetivo es redactar un mensaje de prospección hiper-personalizado en español para WhatsApp o correo electrónico para un lead calificado.\n"
        "Utiliza la información del análisis de calificación del lead (su sitio web, su dolor detectado y su nombre) para estructurar el mensaje.\n"
        "No utilices plantillas genéricas ni corchetes/marcadores vacíos (ej. '[Nombre del Doctor]'). Escribe el mensaje listo para ser copiado y enviado.\n"
        "Enfócate en cómo Lidia automatiza la fricción de agendamiento detectada (ej. responder WhatsApps en menos de 5 segundos, agendar en su calendario y dar seguimiento 24/7).\n"
        "Retorna la respuesta estructurada de acuerdo al esquema OutreachResult."
    ),
    tools=[],
    response_schema=OutreachResult
)
