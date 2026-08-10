import json
import re

from openai import BadRequestError, RateLimitError

from agent.client import get_groq_client
from agent.db import guardar_analisis
from agent.tools.ev import calcular_valor_esperado
from agent.tools.football_data import buscar_partido, obtener_forma_reciente
from agent.tools.odds import obtener_cuotas
from agent.tools.schemas import (
    BUSCAR_PARTIDO_SCHEMA,
    CALCULAR_VALOR_ESPERADO_SCHEMA,
    OBTENER_CUOTAS_SCHEMA,
    OBTENER_FORMA_RECIENTE_SCHEMA,
)
from config import GROQ_MODEL

MAX_ITERATIONS = 8
LLM_MAX_INTENTOS = 3

DISCLAIMER = "Análisis estadístico educativo, no constituye asesoría de apuestas"

TOOLS = [
    BUSCAR_PARTIDO_SCHEMA,
    OBTENER_FORMA_RECIENTE_SCHEMA,
    OBTENER_CUOTAS_SCHEMA,
    CALCULAR_VALOR_ESPERADO_SCHEMA,
]

TOOL_FUNCTIONS = {
    "buscar_partido": buscar_partido,
    "obtener_forma_reciente": obtener_forma_reciente,
    "obtener_cuotas": obtener_cuotas,
    "calcular_valor_esperado": calcular_valor_esperado,
}

SYSTEM_PROMPT = (
    "Eres un analista cuantitativo de apuestas deportivas (fútbol), "
    "especializado en el mercado de hándicap asiático.\n\n"
    "Flujo obligatorio de uso de herramientas, en este orden:\n"
    "1. Llama siempre primero a buscar_partido con los dos equipos de la pregunta.\n"
    "   - Si el resultado contiene \"found\": false, responde de inmediato con el "
    "JSON final: encontrado=false, recomendacion=null y una justificacion "
    "explicando que no se encontró el partido en el rango de fechas consultado. "
    "No llames más herramientas ni inventes datos.\n"
    "   - Si el resultado contiene \"found\": true, usa los campos "
    "equipo_local_id y equipo_visitante_id para los siguientes pasos.\n"
    "2. Llama obtener_forma_reciente para AMBOS equipos: una llamada por equipo, "
    "pasando su team_id.\n"
    "3. Llama obtener_cuotas para el partido, con el sport_key de la liga. "
    "Ejemplos válidos: soccer_epl (Premier League), soccer_spain_la_liga "
    "(La Liga), soccer_brazil_campeonato (Brasileirão Série A), "
    "soccer_italy_serie_a (Serie A), soccer_germany_bundesliga (Bundesliga). "
    "No inventes ni adivines un sport_key para una liga que no esté en esta "
    "lista: si no reconoces la competición, termina el análisis e indica en la "
    "justificación que no tienes el sport_key correcto, en vez de adivinar uno. "
    "Pasa los nombres de los equipos tal cual los devolvió "
    "buscar_partido.\n"
    "4. Con la forma reciente, el contexto y las cuotas, estima una probabilidad "
    "propia (valor entre 0 y 1) del resultado en el hándicap más relevante, y "
    "llama a calcular_valor_esperado con esa probabilidad y la cuota "
    "correspondiente. No calcules el valor esperado mentalmente: usa la herramienta.\n\n"
    "Si obtener_forma_reciente, buscar_partido u obtener_cuotas devuelven "
    "error:true incluso después de reintentos, NUNCA completes ese campo con "
    "un valor inventado, estimado, o recordado de contexto previo. En su "
    "lugar, usa null para ese campo específico en datos_usados, reduce el "
    "campo 'confianza' a 'baja', y menciona explícitamente en la "
    "justificacion qué dato no pudo obtenerse y por qué el análisis es "
    "incompleto. Si el dato faltante es imprescindible para calcular el valor "
    "esperado (ej. no tienes forma de ninguno de los dos equipos), no llames "
    "a calcular_valor_esperado y responde con valor_esperado: null y "
    "recomendacion: null, explicando que no hay suficiente información. "
    "Si una herramienta devuelve found=false o un error no crítico, decide "
    "cómo continuar con los datos que sí tengas. Nunca inventes cuotas, "
    "marcadores ni formas.\n\n"
    "Formato de salida final: responde ÚNICAMENTE con un JSON estricto, sin texto "
    "adicional y sin bloques markdown, con esta estructura exacta:\n"
    '{"partido": string, "encontrado": boolean, "recomendacion": string o null, '
    '"valor_esperado": número o null, "confianza": "baja", "media", "alta" o null, '
    '"justificacion": string, '
    '"datos_usados": {"forma_local": string (ej. "3W-2D-0L en últimos 5"), '
    '"forma_visitante": string (ej. "1W-1D-3L en últimos 5"), '
    '"cuotas_comparadas": [{"casa": string, "hándicap": number, "cuota": number}, ...]}, '
    '"disclaimer": "Análisis estadístico educativo, no constituye asesoría de apuestas"}\n'
    "Reglas de datos_usados: cuotas_comparadas debe incluir al menos 2-3 casas "
    "distintas de las que devolvió obtener_cuotas (no solo una), con su hándicap y "
    "cuota decimal correspondientes. Cuando la justificacion mencione un hándicap "
    "y su cuota, usa formato explícito, ej. \"Flamengo -1.75 a cuota 1.91 (Pinnacle)\", "
    "nunca frases ambiguas. No incluyas campos inventados: si no tienes el dato, usa "
    "null. El campo datos_usados debe reflejar lo que realmente devolvieron las "
    "herramientas."
)


def _parse_final_json(content: str) -> dict | None:
    text = content.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```\s*$", "", text)
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return None
    if isinstance(data, dict):
        data.setdefault("disclaimer", DISCLAIMER)
        return data
    return None


def _format_tool_args(tool_call) -> str:
    try:
        arguments = json.loads(tool_call.function.arguments or "{}")
    except json.JSONDecodeError:
        return tool_call.function.arguments or "{}"
    return ", ".join(f"{key}={value!r}" for key, value in arguments.items())


def _resumen_resultado(resultado: dict) -> str:
    claves = ("found", "fixture_id", "resumen", "ultimos_n", "total_casas", "ev", "interpretacion")
    partes = []
    for clave in claves:
        if clave in resultado and resultado[clave] is not None:
            valor = resultado[clave]
            if isinstance(valor, bool):
                valor = str(valor).lower()
            partes.append(f"{clave}={valor}")
    if not partes:
        return json.dumps(resultado, ensure_ascii=False)[:160]
    return ", ".join(partes)


def _resumen_humano(herramienta: str, resultado: dict) -> str:
    if resultado.get("error"):
        return f"Error en {herramienta}: {resultado.get('mensaje') or 'error desconocido'}"
    if herramienta == "buscar_partido":
        if resultado.get("found"):
            return (
                f"Partido encontrado: {resultado.get('equipo_local') or '?'} vs "
                f"{resultado.get('equipo_visitante') or '?'}"
            )
        return resultado.get("mensaje") or "No se encontró un partido programado entre los equipos indicados."
    if herramienta == "obtener_forma_reciente":
        equipo = resultado.get("equipo") or f"equipo {resultado.get('team_id')}"
        return f"Forma de {equipo}: {resultado.get('resumen')}"
    if herramienta == "obtener_cuotas":
        if resultado.get("found"):
            total = resultado.get("total_casas") or 0
            casa = "casa" if total == 1 else "casas"
            return f"{total} {casa} de apuestas encontradas"
        return resultado.get("mensaje") or "No se encontraron cuotas para el partido."
    if herramienta == "calcular_valor_esperado":
        return f"Valor esperado: {resultado.get('ev')} ({resultado.get('interpretacion')})"
    return _resumen_resultado(resultado)


def _ejecutar_tool(tool_call) -> dict:
    tool_name = tool_call.function.name
    try:
        arguments = json.loads(tool_call.function.arguments or "{}")
    except json.JSONDecodeError as exc:
        return {"error": True, "mensaje": f"Argumentos inválidos en {tool_name}: {exc}"}
    if not isinstance(arguments, dict):
        return {"error": True, "mensaje": f"Argumentos inválidos en {tool_name}: se esperaba un objeto JSON."}

    func = TOOL_FUNCTIONS.get(tool_name)
    if func is None:
        return {"error": True, "mensaje": f"Herramienta desconocida: {tool_name}"}

    try:
        return func(**arguments) or {}
    except (TypeError, ValueError) as exc:
        return {"error": True, "mensaje": f"Parámetros inválidos para {tool_name}: {exc}"}
    except Exception as exc:
        return {"error": True, "mensaje": f"Error al ejecutar {tool_name}: {exc}"}


def _auditar_errores(messages: list, resultado_final: dict) -> None:
    campos_por_herramienta = {
        "buscar_partido": ("encontrado", "partido"),
        "obtener_forma_reciente": ("forma_local", "forma_visitante"),
        "obtener_cuotas": ("cuotas_comparadas",),
        "calcular_valor_esperado": ("valor_esperado",),
    }
    nombres_por_call_id = {}
    for message in messages:
        if message.get("role") == "assistant" and message.get("tool_calls"):
            for tool_call in message["tool_calls"]:
                nombres_por_call_id[tool_call["id"]] = tool_call["function"]["name"]
        elif message.get("role") == "tool":
            nombre = nombres_por_call_id.get(message.get("tool_call_id"), "desconocida")
            try:
                resultado = json.loads(message.get("content", "{}"))
            except json.JSONDecodeError:
                continue
            if not resultado.get("error"):
                continue
            for campo in campos_por_herramienta.get(nombre, ()):
                if campo in ("forma_local", "forma_visitante", "cuotas_comparadas"):
                    valor = (resultado_final.get("datos_usados") or {}).get(campo)
                else:
                    valor = resultado_final.get(campo)
                if valor is not None:
                    print(
                        "[WARNING] "
                        f"La herramienta {nombre} devolvió error:true pero el "
                        f"campo '{campo}' en la respuesta final no es null "
                        f"({valor!r}). Revisar si el modelo inventó el dato.",
                        flush=True,
                    )


class LLMToolUseFailedError(Exception):
    pass


class LLMRateLimitError(Exception):
    def __init__(self, tiempo_espera: str | None = None):
        super().__init__("rate limit alcanzado")
        self.tiempo_espera = tiempo_espera


def _llamada_modelo_con_retry(client, kwargs: dict):
    for intento in range(1, LLM_MAX_INTENTOS + 1):
        try:
            return client.chat.completions.create(**kwargs)
        except RateLimitError as exc:
            print(
                "[RATE LIMIT] Cuota diaria de tokens agotada para el modelo, "
                "no se reintenta.",
                flush=True,
            )
            raise LLMRateLimitError(tiempo_espera=_extraer_tiempo_espera(exc)) from exc
        except BadRequestError as exc:
            if getattr(exc, "code", None) != "tool_use_failed":
                raise
            if intento < LLM_MAX_INTENTOS:
                print(
                    f"[LLM RETRY] tool_use_failed, reintentando llamada al modelo "
                    f"(intento {intento + 1}/{LLM_MAX_INTENTOS})",
                    flush=True,
                )
                continue
            raise LLMToolUseFailedError() from exc


def _extraer_tiempo_espera(exc) -> str | None:
    texto = getattr(exc, "message", "") or ""
    body = getattr(exc, "body", None)
    if isinstance(body, dict):
        error = body.get("error")
        if isinstance(error, dict) and error.get("message"):
            texto = error["message"]
    match = re.search(r"try again in\s+(\S+)", texto)
    if match and re.fullmatch(r"[\dmshd]+", match.group(1)):
        return match.group(1)
    return None


def _extraer_partido(pregunta: str) -> str:
    texto = pregunta.strip()
    for prefijo in ("analiza ", "analizar ", "análisis de ", "analisis de ", "el partido de "):
        if texto.lower().startswith(prefijo):
            texto = texto[len(prefijo):]
            break
    for separador in (" vs ", " VS ", " contra ", " – ", " - "):
        if separador in texto:
            return " vs ".join(p.strip() for p in texto.split(separador, 1)[:2])
    return texto


def _error_generacion(partido_encontrado: bool, pregunta_usuario: str) -> dict:
    return {
        "partido": _extraer_partido(pregunta_usuario),
        "encontrado": None if partido_encontrado else False,
        "recomendacion": None,
        "valor_esperado": None,
        "confianza": None,
        "justificacion": (
            "Hubo un problema técnico generando el análisis: el proveedor de IA "
            "falló repetidamente al procesar las llamadas a herramientas "
            "(tool_use_failed) tras varios intentos. Reintenta la consulta."
        ),
        "datos_usados": {},
        "disclaimer": DISCLAIMER,
    }


def _error_generacion_rate_limit(pregunta_usuario: str, tiempo_espera: str | None) -> dict:
    justificacion = (
        "Se alcanzó el límite de uso del modelo por hoy, así que no se pudo "
        "generar el análisis."
    )
    if tiempo_espera:
        justificacion += (
            f" La API indica que se puede reintentar en aproximadamente {tiempo_espera}."
        )
    return {
        "partido": _extraer_partido(pregunta_usuario),
        "encontrado": None,
        "recomendacion": None,
        "valor_esperado": None,
        "confianza": None,
        "justificacion": justificacion,
        "datos_usados": {},
        "disclaimer": DISCLAIMER,
    }


def _forzar_respuesta_final(client, messages: list) -> dict:
    messages.append(
        {
            "role": "user",
            "content": (
                "Finaliza AHORA sin llamar más herramientas. Responde únicamente "
                "con el JSON final estricto descrito en el system prompt, usando "
                "la información recopilada hasta este punto."
            ),
        }
    )
    response = _llamada_modelo_con_retry(
        client,
        {
            "model": GROQ_MODEL,
            "messages": messages,
            "tools": TOOLS,
            "tool_choice": "none",
            "response_format": {"type": "json_object"},
        },
    )
    content = response.choices[0].message.content or ""
    parsed = _parse_final_json(content)
    if parsed is not None:
        _auditar_errores(messages, parsed)
        return parsed
    return {
        "error": True,
        "mensaje": "El modelo no devolvió un JSON válido como respuesta final.",
        "respuesta_raw": content,
    }


def analizar_partido_streaming(pregunta_usuario: str, client=None, session_id: str = ""):
    client = client if client is not None else get_groq_client()

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": pregunta_usuario},
    ]
    partido_encontrado = False

    try:
        for _ in range(MAX_ITERATIONS):
            response = _llamada_modelo_con_retry(
                client,
                {
                    "model": GROQ_MODEL,
                    "messages": messages,
                    "tools": TOOLS,
                    "tool_choice": "auto",
                },
            )
            assistant_message = response.choices[0].message

            assistant_dict = {"role": "assistant", "content": assistant_message.content or ""}
            if assistant_message.tool_calls:
                assistant_dict["tool_calls"] = [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments,
                        },
                    }
                    for tc in assistant_message.tool_calls
                ]
            messages.append(assistant_dict)

            if not assistant_message.tool_calls:
                parsed = _parse_final_json(assistant_message.content or "")
                if parsed is not None:
                    _auditar_errores(messages, parsed)
                    final = parsed
                else:
                    final = _forzar_respuesta_final(client, messages)
                break

            for tool_call in assistant_message.tool_calls:
                try:
                    args = json.loads(tool_call.function.arguments or "{}")
                except json.JSONDecodeError:
                    args = tool_call.function.arguments or {}
                if not isinstance(args, dict):
                    args = {"argumentos_crudos": args}
                yield {"tipo": "tool_call", "herramienta": tool_call.function.name, "args": args}
                print(
                    f"[TOOL CALL] {tool_call.function.name}({_format_tool_args(tool_call)})",
                    flush=True,
                )
                resultado = _ejecutar_tool(tool_call)
                if tool_call.function.name == "buscar_partido" and resultado.get("found"):
                    partido_encontrado = True
                print(f"[TOOL RESULT] {_resumen_resultado(resultado)}", flush=True)
                yield {
                    "tipo": "tool_result",
                    "herramienta": tool_call.function.name,
                    "resumen": _resumen_humano(tool_call.function.name, resultado),
                }
                messages.append(
                    {
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": json.dumps(resultado, ensure_ascii=False),
                    }
                )
        else:
            final = _forzar_respuesta_final(client, messages)
    except LLMToolUseFailedError:
        yield {
            "tipo": "error",
            "mensaje": "Falló la generación de la respuesta tras 3 intentos "
            "(tool_use_failed). Reintenta la consulta.",
        }
        final = _error_generacion(partido_encontrado, pregunta_usuario)
    except LLMRateLimitError as exc:
        yield {
            "tipo": "error",
            "mensaje": "Se alcanzó el límite de uso del modelo por hoy; reintenta más tarde.",
        }
        final = _error_generacion_rate_limit(pregunta_usuario, exc.tiempo_espera)
    except Exception as exc:
        yield {"tipo": "error", "mensaje": f"Error interno generando el análisis: {exc}"}
        raise

    if final.get("encontrado"):
        try:
            guardar_analisis(session_id or "sin-sesion", final)
        except Exception as exc:
            print(f"[HISTORIAL] No se pudo guardar el análisis: {exc}", flush=True)

    yield {"tipo": "resultado_final", "data": final}


def analizar_partido(pregunta_usuario: str, client=None, session_id: str = "") -> dict:
    for evento in analizar_partido_streaming(pregunta_usuario, client, session_id):
        if evento["tipo"] == "resultado_final":
            return evento["data"]
        if evento["tipo"] == "error":
            continue
    raise RuntimeError("El agente terminó sin producir un resultado final.")
