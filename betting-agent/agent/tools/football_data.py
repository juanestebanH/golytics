from datetime import date, timedelta
import unicodedata

import requests

from config import FOOTBALL_DATA_API_KEY, FOOTBALL_DATA_BASE_URL

MAX_DAYS_RANGE = 10
TIMEOUT_SECONDS = 8


def _get_with_retry(url: str, params: dict, headers: dict = None, timeout: int = TIMEOUT_SECONDS) -> requests.Response:
    try:
        return requests.get(url, params=params, headers=headers, timeout=timeout)
    except requests.Timeout:
        print(f"[RETRY] timeout en {url}, reintentando...", flush=True)
        return requests.get(url, params=params, headers=headers, timeout=timeout)


def _normalize(name: str) -> str:
    text = unicodedata.normalize("NFKD", str(name))
    text = "".join(c for c in text if not unicodedata.combining(c))
    return text.lower().strip()


def _team_matches(equipo: str, nombre_equipo: str) -> bool:
    eq, nt = _normalize(equipo), _normalize(nombre_equipo)
    return eq in nt or nt in eq


def _parse_football_data_response(response: requests.Response) -> dict:
    try:
        data = response.json()
    except ValueError:
        return {"error": True, "mensaje": "La API devolvió una respuesta no JSON."}
    if "message" in data and "matches" not in data:
        return {"error": True, "mensaje": f"La API respondió un error: {data['message']}"}
    return data


def buscar_partido(equipo_a: str, equipo_b: str, dias_adelante: int = 10) -> dict:
    if dias_adelante > MAX_DAYS_RANGE:
        dias_adelante = MAX_DAYS_RANGE

    hoy = date.today()
    date_from = hoy.isoformat()
    date_to = (hoy + timedelta(days=max(dias_adelante, 1))).isoformat()

    try:
        response = _get_with_retry(
            f"{FOOTBALL_DATA_BASE_URL}/matches",
            params={"dateFrom": date_from, "dateTo": date_to},
            headers={"X-Auth-Token": FOOTBALL_DATA_API_KEY},
        )
    except requests.Timeout:
        return {
            "error": True,
            "mensaje": "La API de football-data.org tardó demasiado en responder (timeout).",
        }
    except requests.RequestException as exc:
        return {
            "error": True,
            "mensaje": f"Error de conexión con football-data.org: {exc}",
        }

    if response.status_code == 403:
        return {
            "error": True,
            "mensaje": "Acceso denegado (403). Verifica tu FOOTBALL_DATA_API_KEY y el plan de tu cuenta.",
        }
    if response.status_code == 429:
        return {
            "error": True,
            "mensaje": "Límite de requests superado (429). Espera un momento y reintenta.",
        }
    if response.status_code != 200:
        return {
            "error": True,
            "mensaje": f"Error inesperado de la API ({response.status_code}).",
        }

    data = _parse_football_data_response(response)
    if "error" in data:
        return data

    for match in data.get("matches", []):
        home = match.get("homeTeam", {}).get("name", "")
        away = match.get("awayTeam", {}).get("name", "")

        a_home = _team_matches(equipo_a, home)
        a_away = _team_matches(equipo_a, away)
        b_home = _team_matches(equipo_b, home)
        b_away = _team_matches(equipo_b, away)

        if (a_home and b_away) or (a_away and b_home):
            return {
                "found": True,
                "fixture_id": match.get("id"),
                "fecha": match.get("utcDate"),
                "competicion": match.get("competition", {}).get("name"),
                "equipo_local": home,
                "equipo_visitante": away,
                "equipo_local_id": match.get("homeTeam", {}).get("id"),
                "equipo_visitante_id": match.get("awayTeam", {}).get("id"),
                "estado": match.get("status"),
            }

    return {
        "found": False,
        "mensaje": (
            f"No hay ningún partido entre \"{equipo_a}\" y \"{equipo_b}\" "
            f"programado en los próximos {dias_adelante} días."
        ),
    }


def obtener_forma_reciente(team_id: int, ultimos_n: int = 5) -> dict:
    ultimos_n = max(1, min(ultimos_n, 20))

    hoy = date.today()
    date_from = (hoy - timedelta(days=365)).isoformat()
    date_to = hoy.isoformat()

    try:
        response = _get_with_retry(
            f"{FOOTBALL_DATA_BASE_URL}/teams/{team_id}/matches",
            params={
                "status": "FINISHED",
                "limit": 100,
                "dateFrom": date_from,
                "dateTo": date_to,
            },
            headers={"X-Auth-Token": FOOTBALL_DATA_API_KEY},
            
        )
    except requests.Timeout:
        return {
            "error": True,
            "mensaje": "La API de football-data.org tardó demasiado en responder (timeout).",
        }
    except requests.RequestException as exc:
        return {
            "error": True,
            "mensaje": f"Error de conexión con football-data.org: {exc}",
        }

    if response.status_code == 403:
        return {
            "error": True,
            "mensaje": "Acceso denegado (403). Verifica tu FOOTBALL_DATA_API_KEY y el plan de tu cuenta.",
        }
    if response.status_code == 404:
        return {
            "error": True,
            "mensaje": f"No se encontró el equipo con id {team_id} (404).",
        }
    if response.status_code == 429:
        return {
            "error": True,
            "mensaje": "Límite de requests superado (429). Espera un momento y reintenta.",
        }
    if response.status_code != 200:
        return {
            "error": True,
            "mensaje": f"Error inesperado de la API ({response.status_code}).",
        }

    data = _parse_football_data_response(response)
    if "error" in data:
        return data

    raw_matches = data.get("matches", [])

    equipo_nombre = ""
    for match in raw_matches:
        home_team = match.get("homeTeam", {})
        away_team = match.get("awayTeam", {})
        if home_team.get("id") == team_id:
            equipo_nombre = home_team.get("name", "")
            break
        if away_team.get("id") == team_id:
            equipo_nombre = away_team.get("name", "")
            break

    finished = [
        m
        for m in raw_matches
        if m.get("score", {}).get("fullTime") is not None
    ]
    finished.sort(key=lambda m: m.get("utcDate", ""), reverse=True)
    finished = finished[:ultimos_n]

    if not finished:
        return {
            "found": False,
            "mensaje": (
                f"El equipo {team_id} no tiene partidos finalizados con "
                "marcador registrado."
            ),
        }

    partidos = []
    wins = draws = losses = 0
    for match in finished:
        full_time = match.get("score", {}).get("fullTime", {})
        home_goals = full_time.get("home", 0)
        away_goals = full_time.get("away", 0)

        es_local = match.get("homeTeam", {}).get("id") == team_id
        if es_local:
            rival = match.get("awayTeam", {}).get("name", "")
            goles_favor, goles_contra = home_goals, away_goals
        else:
            rival = match.get("homeTeam", {}).get("name", "")
            goles_favor, goles_contra = away_goals, home_goals

        if goles_favor > goles_contra:
            resultado = "W"
            wins += 1
        elif goles_favor == goles_contra:
            resultado = "D"
            draws += 1
        else:
            resultado = "L"
            losses += 1

        partidos.append(
            {
                "fecha": match.get("utcDate"),
                "rival": rival,
                "local": es_local,
                "resultado": resultado,
                "goles_a_favor": goles_favor,
                "goles_en_contra": goles_contra,
            }
        )

    resultado_dict = {
        "found": True,
        "team_id": team_id,
        "equipo": equipo_nombre or str(team_id),
        "ultimos_n": len(partidos),
        "resumen": f"{wins}W-{draws}D-{losses}L en los últimos {len(partidos)}",
        "partidos": partidos,
    }
    if len(partidos) < ultimos_n:
        resultado_dict["mensaje"] = (
            f"El equipo solo tiene {len(partidos)} partidos finalizados "
            f"registrados (se pidieron {ultimos_n})."
        )
    return resultado_dict


def listar_proximos_partidos(competition: str = "BSA", dias_adelante: int = 10) -> dict:
    hoy = date.today()
    date_from = hoy.isoformat()
    date_to = (hoy + timedelta(days=max(min(dias_adelante, MAX_DAYS_RANGE), 1))).isoformat()

    try:
        response = _get_with_retry(
            f"{FOOTBALL_DATA_BASE_URL}/competitions/{competition}/matches",
            params={
                "dateFrom": date_from,
                "dateTo": date_to,
                "status": "SCHEDULED,TIMED",
            },
            headers={"X-Auth-Token": FOOTBALL_DATA_API_KEY},
        )
    except requests.Timeout:
        return {
            "error": True,
            "mensaje": "La API de football-data.org tardó demasiado en responder (timeout).",
        }
    except requests.RequestException as exc:
        return {
            "error": True,
            "mensaje": f"Error de conexión con football-data.org: {exc}",
        }

    if response.status_code == 403:
        return {
            "error": True,
            "mensaje": "Acceso denegado (403). Verifica tu FOOTBALL_DATA_API_KEY y el plan de tu cuenta.",
        }
    if response.status_code == 429:
        return {
            "error": True,
            "mensaje": "Límite de requests superado (429). Espera un momento y reintenta.",
        }
    if response.status_code != 200:
        return {
            "error": True,
            "mensaje": f"Error inesperado de la API ({response.status_code}).",
        }

    data = _parse_football_data_response(response)
    if data.get("error"):
        return data

    partidos = []
    for match in data.get("matches", []):
        if match.get("status") not in ("SCHEDULED", "TIMED"):
            continue
        home = match.get("homeTeam") or {}
        away = match.get("awayTeam") or {}
        partidos.append(
            {
                "fixture_id": match.get("id"),
                "fecha": match.get("utcDate"),
                "equipo_local": home.get("name"),
                "equipo_visitante": away.get("name"),
                "equipo_local_id": home.get("id"),
                "equipo_visitante_id": away.get("id"),
            }
        )

    partidos.sort(key=lambda p: p["fecha"] or "")
    return {"found": True, "competition": competition, "partidos": partidos, "total": len(partidos)}
