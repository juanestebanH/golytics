# Betting Agent

Backend en Python con FastAPI para un agente de IA que analiza partidos de fútbol
usando tool calling con Groq (`llama-3.3-70b-versatile`).

## Requisitos

- Python 3.10 o superior

## Setup

1. Crear el entorno virtual:

   ```bash
   python -m venv .venv
   ```

2. Activar el entorno virtual:

   - Windows (PowerShell):

     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```

   - Windows (CMD):

     ```cmd
     .venv\Scripts\activate.bat
     ```

   - Linux/macOS:

     ```bash
     source .venv/bin/activate
     ```

3. Instalar dependencias:

   ```bash
   pip install -r requirements.txt
   ```

4. Configurar las claves de API:

   ```bash
   cp .env.example .env
   ```

   Completar las 3 variables en `.env`:

   - `GROQ_API_KEY`: clave de la API de Groq
   - `FOOTBALL_DATA_API_KEY`: clave de football-data.org
   - `ODDS_API_KEY`: clave de the-odds-api.com

## Correr el servidor

```bash
uvicorn main:app --reload
```

Endpoints:

- `GET /health` — health check: `{"status": "ok"}`
- `POST /test-groq` — envía un mensaje fijo al modelo de Groq para verificar la
  conexión end-to-end

## Estructura

```
betting-agent/
├── .env.example
├── .env
├── .gitignore
├── requirements.txt
├── main.py
├── agent/
│   ├── __init__.py
│   ├── client.py
│   └── tools/
│       └── __init__.py
├── config.py
└── README.md
```
