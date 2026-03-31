from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class DocumentTemplate(BaseModel):
    id: str
    name: str
    description: str
    category: str
    fields: List[Dict[str, Any]]

class DocumentGenerateRequest(BaseModel):
    template_id: str
    field_values: Dict[str, Any]

class DocumentGenerateResponse(BaseModel):
    content: str
    summary: str
    validation_report: Dict[str, Any]
    risk_analysis: Dict[str, Any]
    generated_at: datetime

class TitleSuggestionRequest(BaseModel):
    template_type: str
    field_values: Dict[str, Any]

class ClauseExplanationRequest(BaseModel):
    clause_text: str

class ChatMessage(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = []
