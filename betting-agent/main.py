import json

from fastapi import FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from agent import db
from agent.client import get_groq_client
from agent.orchestrator import analizar_partido_streaming
from agent.tools.ev import calcular_valor_esperado
from agent.tools.football_data import buscar_partido, listar_proximos_partidos, obtener_forma_reciente
from agent.tools.odds import obtener_cuotas
from config import GROQ_MODEL

app = FastAPI(title="Betting Agent")

db.init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


class AnalizarRequest(BaseModel):
    pregunta: str


DEFAULT_SESSION_ID = "sin-sesion"


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/test-groq")
def test_groq():
    client = get_groq_client()
    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": "di hola en una palabra"}],
    )
    return {"response": response.choices[0].message.content}


@app.get("/test-buscar-partido")
def test_buscar_partido(
    equipo_a: str = Query(...),
    equipo_b: str = Query(...),
    dias_adelante: int = Query(default=10, ge=1, le=10),
):
    return buscar_partido(equipo_a, equipo_b, dias_adelante)


@app.get("/test-forma-reciente")
def test_forma_reciente(
    team_id: int = Query(...),
    ultimos_n: int = Query(default=5, ge=1, le=20),
):
    return obtener_forma_reciente(team_id, ultimos_n)


@app.get("/test-cuotas")
def test_cuotas(
    sport_key: str = Query(...),
    equipo_local: str = Query(...),
    equipo_visitante: str = Query(...),
):
    return obtener_cuotas(sport_key, equipo_local, equipo_visitante)


@app.get("/test-ev")
def test_ev(
    probabilidad_estimada: float = Query(...),
    cuota_decimal: float = Query(...),
):
    return calcular_valor_esperado(probabilidad_estimada, cuota_decimal)


@app.get("/partidos-proximos")
def partidos_proximos(
    competition: str = Query(default="BSA"),
    dias_adelante: int = Query(default=10, ge=1, le=10),
):
    resultado = listar_proximos_partidos(competition, dias_adelante)
    if resultado.get("error"):
        raise HTTPException(status_code=502, detail=resultado["mensaje"])
    return resultado["partidos"]


@app.get("/historial")
def historial(
    x_session_id: str = Header(default=DEFAULT_SESSION_ID),
    limit: int = Query(default=20, ge=1, le=100),
):
    return db.listar_historial(x_session_id, limit)


@app.get("/historial/{analisis_id}")
def historial_detalle(
    analisis_id: int,
    x_session_id: str = Header(default=DEFAULT_SESSION_ID),
):
    resultado = db.obtener_analisis(analisis_id, x_session_id)
    if resultado is None:
        raise HTTPException(
            status_code=404,
            detail="Análisis no encontrado o no pertenece a este session_id.",
        )
    return resultado


@app.post("/analizar")
def analizar(
    request: AnalizarRequest,
    x_session_id: str = Header(default=DEFAULT_SESSION_ID),
):
    def generar_eventos():
        for evento in analizar_partido_streaming(request.pregunta, session_id=x_session_id):
            yield f"data: {json.dumps(evento, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        generar_eventos(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
