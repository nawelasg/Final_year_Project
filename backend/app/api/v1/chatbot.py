from fastapi import APIRouter, Depends
from app.models.schemas import ChatMessage
from app.api.deps import get_current_user
from app.services.llm import llm_service
from app.services.vector_store import vector_store

router = APIRouter()

MAX_HISTORY_MESSAGES = 20

@router.post("/chat", response_model=dict)
async def handle_chat_message(request: ChatMessage, current_user: str = Depends(get_current_user)):
    context_docs = await vector_store.search(request.message, n_results=4)
    context = "\n---\n".join(context_docs['documents'][0]) if context_docs['documents'] else "No relevant context found."

    # Limit history to prevent exceeding context window
    trimmed_history = (request.history or [])[-MAX_HISTORY_MESSAGES:]
    history_str = "\n".join([f"{msg['role']}: {msg['content']}" for msg in trimmed_history])

    system_prompt = "You are an AI legal assistant for India. Provide helpful, accurate information based on the user's query and the provided context. Do not give definitive legal advice; always recommend consulting a qualified lawyer for serious matters."
    user_prompt = f"""
    CONVERSATION HISTORY:
    {history_str}

    LEGAL CONTEXT FROM DATABASE:
    ---
    {context}
    ---

    CURRENT USER QUERY: "{request.message}"

    Based on the history and context, provide a helpful response to the current query.
    """
    response = await llm_service.generate(system_prompt, user_prompt, max_tokens=1000)
    return {"response": response}
