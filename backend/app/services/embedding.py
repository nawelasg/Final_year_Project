from sentence_transformers import SentenceTransformer
import logging
import asyncio

class EmbeddingService:
    def __init__(self):
        model_name = 'all-MiniLM-L6-v2'
        logging.info(f"Loading embedding model: {model_name}...")
        self.model = SentenceTransformer(model_name)
        logging.info("Embedding model loaded successfully.")

    def embed_texts(self, texts: list[str]):
        return self.model.encode(texts, show_progress_bar=True).tolist()

    def embed_text(self, text: str):
        return self.model.encode(text).tolist()

    async def async_embed_text(self, text: str):
        return await asyncio.to_thread(self.embed_text, text)

    async def async_embed_texts(self, texts: list[str]):
        return await asyncio.to_thread(self.embed_texts, texts)

embedding_service = EmbeddingService()
