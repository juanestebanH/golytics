import json
import sqlite3
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "historial.db"


def _conectar():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = _conectar()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS analisis (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                fecha TEXT NOT NULL,
                partido TEXT NOT NULL,
                encontrado INTEGER NOT NULL,
                analisis_completo INTEGER,
                recomendacion TEXT,
                valor_esperado REAL,
                confianza TEXT,
                resultado_json TEXT NOT NULL
            )
            """
        )
        conn.commit()
    finally:
        conn.close()


def guardar_analisis(session_id: str, resultado: dict) -> int:
    conn = _conectar()
    try:
        cursor = conn.execute(
            """
            INSERT INTO analisis (
                session_id, fecha, partido, encontrado, analisis_completo,
                recomendacion, valor_esperado, confianza, resultado_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                session_id,
                datetime.now().isoformat(timespec="seconds"),
                resultado.get("partido") or "",
                1 if resultado.get("encontrado") else 0,
                1 if resultado.get("valor_esperado") is not None else 0,
                resultado.get("recomendacion"),
                resultado.get("valor_esperado"),
                resultado.get("confianza"),
                json.dumps(resultado, ensure_ascii=False),
            ),
        )
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()


def listar_historial(session_id: str, limit: int = 20) -> list[dict]:
    conn = _conectar()
    try:
        filas = conn.execute(
            """
            SELECT id, fecha, partido, encontrado, analisis_completo,
                   recomendacion, valor_esperado, confianza
            FROM analisis
            WHERE session_id = ?
            ORDER BY fecha DESC, id DESC
            LIMIT ?
            """,
            (session_id, limit),
        ).fetchall()
    finally:
        conn.close()
    return [
        {
            "id": fila["id"],
            "fecha": fila["fecha"],
            "partido": fila["partido"],
            "encontrado": bool(fila["encontrado"]),
            "analisis_completo": bool(fila["analisis_completo"]),
            "recomendacion": fila["recomendacion"],
            "valor_esperado": fila["valor_esperado"],
            "confianza": fila["confianza"],
        }
        for fila in filas
    ]


def obtener_analisis(analisis_id: int, session_id: str) -> dict | None:
    conn = _conectar()
    try:
        fila = conn.execute(
            "SELECT session_id, resultado_json FROM analisis WHERE id = ?",
            (analisis_id,),
        ).fetchone()
    finally:
        conn.close()
    if fila is None or fila["session_id"] != session_id:
        return None
    try:
        return json.loads(fila["resultado_json"])
    except json.JSONDecodeError:
        return None
