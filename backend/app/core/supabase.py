from supabase import create_client, Client
from app.core.config import settings

supabase_client: Client = create_client(
    supabase_url=settings.supabase_url,
    supabase_key=settings.supabase_key
)
