from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user
from app.core.supabase import supabase_client

router = APIRouter()

@router.post("/templates", response_model=dict)
async def log_template_usage(payload: dict, current_user: str = Depends(get_current_user)):
    template_id = payload.get("template_id")
    template_name = payload.get("template_name")

    if not template_id or not template_name:
        raise HTTPException(status_code=400, detail="template_id and template_name are required")

    try:
        supabase_client.table("user_template_history").insert({
            "user_id": current_user,
            "template_id": template_id,
            "template_name": template_name,
        }).execute()
        return {"status": "logged"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to log template usage: {e}")

@router.get("/templates", response_model=list)
async def get_recent_template_usage(current_user: str = Depends(get_current_user)):
    try:
        res = (
            supabase_client.table("user_template_history")
            .select("template_id, template_name, used_at")
            .eq("user_id", current_user)
            .order("used_at", desc=True)
            .limit(5)
            .execute()
        )
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {e}")
