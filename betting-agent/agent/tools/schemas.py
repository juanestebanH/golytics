BUSCAR_PARTIDO_SCHEMA = {
    "type": "function",
    "function": {
        "name": "buscar_partido",
        "description": (
            "Busca en football-data.org si hay un partido programado entre dos "
            "equipos en los próximos días. Devuelve el fixture encontrado con "
            "su id, fecha, competición, estado y los id de ambos equipos "
            "(equipo_local_id, equipo_visitante_id, útiles para "
            "obtener_forma_reciente), o found=false si no hay jornada "
            "programada en el rango."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "equipo_a": {
                    "type": "string",
                    "description": (
                        "Nombre del primer equipo. Puede ser parcial, "
                        "ej. \"Barcelona\" para \"FC Barcelona\"."
                    ),
                },
                "equipo_b": {
                    "type": "string",
                    "description": (
                        "Nombre del segundo equipo. Puede ser parcial, "
                        "ej. \"Real Madrid\"."
                    ),
                },
                "dias_adelante": {
                    "type": "integer",
                    "description": (
                        "Cuántos días adelante buscar. Máximo 10 por el "
                        "límite del plan gratuito."
                    ),
                    "minimum": 1,
                    "maximum": 10,
                    "default": 10,
                },
            },
            "required": ["equipo_a", "equipo_b"],
        },
    },
}


OBTENER_FORMA_RECIENTE_SCHEMA = {
    "type": "function",
    "function": {
        "name": "obtener_forma_reciente",
        "description": (
            "Obtiene la forma reciente de un equipo (resultados W/D/L y goles) "
            "a partir de su team_id de football-data.org. Úsalo con el "
            "equipo_local_id o equipo_visitante_id que devuelve buscar_partido."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "team_id": {
                    "type": "integer",
                    "description": (
                        "ID del equipo en football-data.org "
                        "(homeTeam.id o awayTeam.id de buscar_partido)."
                    ),
                },
                "ultimos_n": {
                    "type": "integer",
                    "description": (
                        "Cantidad de partidos finalizados a analizar "
                        "(máximo 20)."
                    ),
                    "minimum": 1,
                    "maximum": 20,
                    "default": 5,
                },
            },
            "required": ["team_id"],
        },
    },
}


OBTENER_CUOTAS_SCHEMA = {
    "type": "function",
    "function": {
        "name": "obtener_cuotas",
        "description": (
            "Obtiene las cuotas decimales del mercado de hándicap/spreads "
            "(incluye hándicap asiático) de varias casas de apuestas europeas "
            "para un partido, desde The Odds API."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "sport_key": {
                    "type": "string",
                    "description": (
                        "Clave del deporte/liga en The Odds API, ej. "
                        "soccer_epl, soccer_spain_la_liga, soccer_brazil_campeonato, "
                        "soccer_italy_serie_a, soccer_germany_bundesliga. No "
                        "adivines claves para ligas que no estén en esa lista."
                    ),
                },
                "equipo_local": {
                    "type": "string",
                    "description": (
                        "Nombre del equipo local. Puede ser parcial, "
                        "ej. \"Barcelona\"."
                    ),
                },
                "equipo_visitante": {
                    "type": "string",
                    "description": (
                        "Nombre del equipo visitante. Puede ser parcial, "
                        "ej. \"Real Madrid\"."
                    ),
                },
            },
            "required": ["sport_key", "equipo_local", "equipo_visitante"],
        },
    },
}


CALCULAR_VALOR_ESPERADO_SCHEMA = {
    "type": "function",
    "function": {
        "name": "calcular_valor_esperado",
        "description": (
            "Calcula el valor esperado (EV) de una apuesta: "
            "EV = (probabilidad_estimada * cuota_decimal) - 1. La "
            "probabilidad_estimada NO proviene de una API: es la probabilidad "
            "que el propio modelo estima con base en su análisis (forma "
            "reciente de los equipos, contexto del partido, etc.), un valor "
            "entre 0 y 1. Usa esta herramienta con la cuota obtenida por "
            "obtener_cuotas para decidir si la apuesta tiene valor."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "probabilidad_estimada": {
                    "type": "number",
                    "description": (
                        "Probabilidad estimada por el modelo, entre 0 y 1 "
                        "(ej. 0.4). No es un dato de API, es tu estimación "
                        "basada en el análisis."
                    ),
                    "minimum": 0,
                    "maximum": 1,
                },
                "cuota_decimal": {
                    "type": "number",
                    "description": (
                        "Cuota en formato decimal, mayor a 1 "
                        "(ej. 2.10). Proviene de las casas de apuestas."
                    ),
                    "exclusiveMinimum": 1,
                },
            },
            "required": ["probabilidad_estimada", "cuota_decimal"],
        },
    },
}
