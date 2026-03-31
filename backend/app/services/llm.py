from groq import AsyncGroq, APIError
from app.core.config import settings
import logging

class LLMService:
    def __init__(self):
        if not settings.groq_api_key or "YOUR_GROQ_API_KEY" in settings.groq_api_key:
            raise ValueError("GROQ_API_KEY is not configured in .env file.")
        self.client = AsyncGroq(api_key=settings.groq_api_key)
        self.model = "llama-3.1-8b-instant"
        logging.info(f"Groq LLM service initialized with model: {self.model}")

    async def generate(self, system_prompt: str, user_prompt: str, max_tokens: int = 2048) -> str:
        try:
            chat_completion = await self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                model=self.model,
                temperature=0.5,
                max_tokens=max_tokens,
            )
            return chat_completion.choices[0].message.content
        except APIError as e:
            logging.error(f"Groq API Error: {e}")
            return "Error: The AI service is currently unavailable. Please check API keys and service status."
        except Exception as e:
            logging.error(f"An unexpected error occurred in LLM generation: {e}")
            return "Error: An unexpected error occurred while communicating with the AI service."

llm_service = LLMService()
