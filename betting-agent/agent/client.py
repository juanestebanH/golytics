from openai import OpenAI

from config import GROQ_API_KEY, GROQ_BASE_URL


def get_groq_client() -> OpenAI:
    return OpenAI(api_key=GROQ_API_KEY, base_url=GROQ_BASE_URL)
