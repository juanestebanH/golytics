import os

from dotenv import load_dotenv

load_dotenv()

REQUIRED_KEYS = ("GROQ_API_KEY", "FOOTBALL_DATA_API_KEY", "ODDS_API_KEY")

missing = [key for key in REQUIRED_KEYS if not os.getenv(key)]
if missing:
    raise RuntimeError(
        "Faltan variables de entorno requeridas: "
        + ", ".join(missing)
        + ". Cópialas desde .env.example a .env y complétalas con tus claves."
    )

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
FOOTBALL_DATA_API_KEY = os.getenv("FOOTBALL_DATA_API_KEY")
ODDS_API_KEY = os.getenv("ODDS_API_KEY")

GROQ_BASE_URL = "https://api.groq.com/openai/v1"
GROQ_MODEL = "llama-3.3-70b-versatile"

FOOTBALL_DATA_BASE_URL = "https://api.football-data.org/v4"

ODDS_API_BASE_URL = "https://api.the-odds-api.com"
