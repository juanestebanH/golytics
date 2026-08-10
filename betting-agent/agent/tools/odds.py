import requests

from agent.tools.football_data import _get_with_retry, _team_matches
from config import ODDS_API_BASE_URL, ODDS_API_KEY


def obtener_cuotas(sport_key: str, equipo_local: str, equipo_visitante: str) -> dict:
    try:
        response = _get_with_retry(
            f"{ODDS_API_BASE_URL}/v4/sports/{sport_key}/odds",
            params={
                "apiKey": ODDS_API_KEY,
                "regions": "eu",
                "markets": "spreads",
                "oddsFormat": "decimal",
            },
        )
    except requests.Timeout:
        return {
            "error": True,
            "mensaje": "The Odds API tardó demasiado en responder (timeout).",
        }
    except requests.RequestException as exc:
        return {
            "error": True,
            "mensaje": f"Error de conexión con The Odds API: {exc}",
        }

    if response.status_code == 401:
        return {
            "error": True,
            "mensaje": "Acceso denegado (401). Verifica tu ODDS_API_KEY.",
        }
    if response.status_code == 422:
        return {
            "error": True,
            "mensaje": (
                f"Sport key inválido (422): \"{sport_key}\". Ejemplos válidos: "
                "soccer_epl, soccer_spain_la_liga, soccer_brazil_campeonato, "
                "soccer_italy_serie_a, soccer_germany_bundesliga."
            ),
        }
    if response.status_code == 429:
        return {
            "error": True,
            "mensaje": "Límite de requests/créditos superado (429). Espera y reintenta.",
        }
    if response.status_code != 200:
        return {
            "error": True,
            "mensaje": f"Error inesperado de la API ({response.status_code}).",
        }

    try:
        events = response.json()
    except ValueError:
        return {"error": True, "mensaje": "La API devolvió una respuesta no JSON."}

    for event in events:
        home = event.get("home_team", "")
        away = event.get("away_team", "")
        if not (_team_matches(equipo_local, home) and _team_matches(equipo_visitante, away)):
            continue

        casas = []
        for bookmaker in event.get("bookmakers", []):
            spread_outcomes = None
            for market in bookmaker.get("markets", []):
                if market.get("key") == "spreads":
                    spread_outcomes = market.get("outcomes", [])
                    break
            if not spread_outcomes:
                continue
            casas.append(
                {
                    "casa": bookmaker.get("title") or bookmaker.get("key", ""),
                    "spreads": [
                        {
                            "equipo": outcome.get("name", ""),
                            "handicap": outcome.get("point"),
                            "cuota": outcome.get("price"),
                        }
                        for outcome in spread_outcomes
                    ],
                }
            )

        if not casas:
            return {
                "found": False,
                "mensaje": (
                    f"El mercado de spreads aún no está disponible para "
                    f"\"{equipo_local}\" vs \"{equipo_visitante}\"."
                ),
            }

        return {
            "found": True,
            "sport_key": sport_key,
            "partido": {
                "equipo_local": home,
                "equipo_visitante": away,
                "hora": event.get("commence_time"),
            },
            "casas": casas,
            "total_casas": len(casas),
        }

    return {
        "found": False,
        "mensaje": (
            f"No se encontró el partido \"{equipo_local}\" vs "
            f"\"{equipo_visitante}\" en la respuesta de The Odds API "
            f"(sport_key: {sport_key})."
        ),
    }
