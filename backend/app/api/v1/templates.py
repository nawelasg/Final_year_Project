from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models.schemas import DocumentTemplate
from app.api.deps import get_current_user

router = APIRouter()

# This data is static but represents what could come from a database.
TEMPLATES = [
    {"id": "rent-agreement", "name": "Rent Agreement", "description": "Standard rental agreement for residential property.", "category": "Property", "fields": [
        {"name": "landlord_name", "label": "Landlord Name", "type": "text", "required": True},
        {"name": "tenant_name", "label": "Tenant Name", "type": "text", "required": True},
        {"name": "property_address", "label": "Property Address", "type": "textarea", "required": True},
        {"name": "rent_amount", "label": "Monthly Rent (INR)", "type": "number", "required": True},
        {"name": "security_deposit", "label": "Security Deposit (INR)", "type": "number", "required": True},
        {"name": "lease_start_date", "label": "Lease Start Date", "type": "date", "required": True},
        {"name": "lease_term_months", "label": "Lease Term (in months)", "type": "number", "required": True},
    ]},
    {"id": "nda", "name": "Non-Disclosure Agreement", "description": "A mutual non-disclosure agreement for business dealings.", "category": "Business", "fields": [
        {"name": "disclosing_party_name", "label": "Disclosing Party Name", "type": "text", "required": True},
        {"name": "receiving_party_name", "label": "Receiving Party Name", "type": "text", "required": True},
        {"name": "effective_date", "label": "Effective Date", "type": "date", "required": True},
        {"name": "purpose_of_disclosure", "label": "Purpose of Disclosure", "type": "textarea", "required": True},
        {"name": "term_of_agreement_years", "label": "Term of Agreement (in years)", "type": "number", "required": True},
    ]},
    {"id": "affidavit", "name": "General Affidavit", "description": "A general purpose sworn statement of fact.", "category": "General", "fields": [
        {"name": "deponent_name", "label": "Deponent's Name", "type": "text", "required": True},
        {"name": "deponent_address", "label": "Deponent's Address", "type": "textarea", "required": True},
        {"name": "statement_of_facts", "label": "Statement of Facts", "type": "textarea", "required": True},
        {"name": "date_of_statement", "label": "Date of Statement", "type": "date", "required": True},
    ]}
]

@router.get("/", response_model=List[DocumentTemplate])
async def get_all_templates(current_user: str = Depends(get_current_user)):
    return TEMPLATES

@router.get("/{template_id}", response_model=DocumentTemplate)
async def get_template_by_id(template_id: str, current_user: str = Depends(get_current_user)):
    for template in TEMPLATES:
        if template["id"] == template_id:
            return template
    raise HTTPException(status_code=404, detail="Template not found")
