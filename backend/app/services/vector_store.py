from app.services.embedding import embedding_service
from app.core.supabase import supabase_client
import logging
import asyncio

class VectorStore:
    def __init__(self):
        logging.info("VectorStore service configured to use Supabase pgvector.")

    def _sync_rpc_call(self, query_embedding, match_threshold, match_count):
        return supabase_client.rpc('match_documents', {
            'query_embedding': query_embedding,
            'match_threshold': match_threshold,
            'match_count': match_count
        }).execute()

    async def search(self, query_text: str, n_results: int = 5):
        query_embedding = await embedding_service.async_embed_text(query_text)

        try:
            res = await asyncio.to_thread(
                self._sync_rpc_call, query_embedding, 0.7, n_results
            )

            if not res.data:
                return {'documents': [[]], 'metadatas': [[]]}

            return {
                'documents': [[item['content'] for item in res.data]],
                'metadatas': [[item['metadata'] for item in res.data]]
            }
        except Exception as e:
            logging.error(f"Error during vector search RPC call: {e}")
            return {'documents': [[]], 'metadatas': [[]]}

vector_store = VectorStore()
