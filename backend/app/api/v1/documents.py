from fastapi import APIRouter, Depends
from app.models.schemas import (
    DocumentGenerateRequest,
    DocumentGenerateResponse,
    TitleSuggestionRequest,
    ClauseExplanationRequest,
)
from app.api.deps import get_current_user
from app.services.document_generator import document_generator_service
from datetime import datetime

router = APIRouter()

@router.post("/generate", response_model=DocumentGenerateResponse)
async def generate_document(request: DocumentGenerateRequest, current_user: str = Depends(get_current_user)):
    content = await document_generator_service.generate_document(request.template_id, request.field_values)
    summary = await document_generator_service.generate_summary(content)
    validation_report = await document_generator_service.validate_document(content, request.template_id)
    risk_analysis = await document_generator_service.analyze_risk(content, request.template_id)

    return DocumentGenerateResponse(
        content=content,
        summary=summary,
        validation_report=validation_report,
        risk_analysis=risk_analysis,
        generated_at=datetime.utcnow(),
    )

@router.post("/suggest-title", response_model=dict)
async def suggest_title_for_document(request: TitleSuggestionRequest, current_user: str = Depends(get_current_user)):
    title = await document_generator_service.suggest_title(request.template_type, request.field_values)
    return {"title": title}

@router.post("/explain-clause", response_model=dict)
async def explain_legal_clause(request: ClauseExplanationRequest, current_user: str = Depends(get_current_user)):
    explanation = await document_generator_service.explain_clause(request.clause_text)
    return {"explanation": explanation}
