from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models.schemas import DocumentTemplate
from app.api.deps import get_current_user

router = APIRouter()

TEMPLATES = [
    {
        "id": "rent-agreement",
        "name": "Rent Agreement",
        "description": "Formal Indian residential rent agreement with landlord, tenant, rent, deposit, duration, and possession terms.",
        "category": "Property",
        "fields": [
            {"name": "landlord_name", "label": "Landlord Name", "type": "text", "required": True},
            {"name": "tenant_name", "label": "Tenant Name", "type": "text", "required": True},
            {"name": "property_address", "label": "Property Address", "type": "textarea", "required": True},
            {"name": "rent_amount", "label": "Monthly Rent (INR)", "type": "number", "required": True},
            {"name": "security_deposit", "label": "Security Deposit (INR)", "type": "number", "required": True},
            {"name": "lease_start_date", "label": "Lease Start Date", "type": "date", "required": True},
            {"name": "lease_term_months", "label": "Lease Term (in months)", "type": "number", "required": True},
        ],
    },
    {
        "id": "nda",
        "name": "Non-Disclosure Agreement",
        "description": "Formal Indian-style NDA covering confidential information, permitted use, exclusions, remedies, and duration.",
        "category": "Business",
        "fields": [
            {"name": "disclosing_party_name", "label": "Disclosing Party Name", "type": "text", "required": True},
            {"name": "receiving_party_name", "label": "Receiving Party Name", "type": "text", "required": True},
            {"name": "effective_date", "label": "Effective Date", "type": "date", "required": True},
            {"name": "purpose_of_disclosure", "label": "Purpose of Disclosure", "type": "textarea", "required": True},
            {"name": "term_of_agreement_years", "label": "Term of Agreement (in years)", "type": "number", "required": True},
        ],
    },
    {
        "id": "affidavit",
        "name": "General Affidavit",
        "description": "Formal affidavit draft with deponent details, numbered factual statements, and verification clause.",
        "category": "General",
        "fields": [
            {"name": "deponent_name", "label": "Deponent's Name", "type": "text", "required": True},
            {"name": "deponent_address", "label": "Deponent's Address", "type": "textarea", "required": True},
            {"name": "statement_of_facts", "label": "Statement of Facts", "type": "textarea", "required": True},
            {"name": "date_of_statement", "label": "Date of Statement", "type": "date", "required": True},
        ],
    },
    {
        "id": "employment-agreement",
        "name": "Employment Agreement",
        "description": "Employment contract covering designation, compensation, duties, joining date, and termination terms.",
        "category": "Employment",
        "fields": [
            {"name": "employer_name", "label": "Employer Name", "type": "text", "required": True},
            {"name": "employee_name", "label": "Employee Name", "type": "text", "required": True},
            {"name": "job_title", "label": "Job Title / Designation", "type": "text", "required": True},
            {"name": "salary_amount", "label": "Salary Amount (INR)", "type": "number", "required": True},
            {"name": "joining_date", "label": "Joining Date", "type": "date", "required": True},
            {"name": "employment_location", "label": "Employment Location", "type": "text", "required": True},
            {"name": "job_responsibilities", "label": "Job Responsibilities", "type": "textarea", "required": True},
        ],
    },
    {
        "id": "service-agreement",
        "name": "Service Agreement",
        "description": "Agreement between service provider and client covering scope of work, fees, timelines, and obligations.",
        "category": "Business",
        "fields": [
            {"name": "service_provider_name", "label": "Service Provider Name", "type": "text", "required": True},
            {"name": "client_name", "label": "Client Name", "type": "text", "required": True},
            {"name": "service_description", "label": "Description of Services", "type": "textarea", "required": True},
            {"name": "service_fee", "label": "Service Fee (INR)", "type": "number", "required": True},
            {"name": "agreement_start_date", "label": "Agreement Start Date", "type": "date", "required": True},
            {"name": "agreement_end_date", "label": "Agreement End Date", "type": "date", "required": True},
            {"name": "payment_terms", "label": "Payment Terms", "type": "textarea", "required": True},
        ],
    },
    {
        "id": "power-of-attorney",
        "name": "Power of Attorney",
        "description": "Draft power of attorney identifying the principal, attorney holder, powers granted, and duration.",
        "category": "Authority",
        "fields": [
            {"name": "principal_name", "label": "Principal Name", "type": "text", "required": True},
            {"name": "attorney_holder_name", "label": "Attorney Holder Name", "type": "text", "required": True},
            {"name": "principal_address", "label": "Principal Address", "type": "textarea", "required": True},
            {"name": "powers_granted", "label": "Powers Granted", "type": "textarea", "required": True},
            {"name": "effective_date", "label": "Effective Date", "type": "date", "required": True},
            {"name": "duration_of_authority", "label": "Duration of Authority", "type": "text", "required": True},
        ],
    },
    {
        "id": "sale-agreement",
        "name": "Sale Agreement",
        "description": "Agreement for sale covering buyer, seller, subject property/goods, price, payment terms, and transfer conditions.",
        "category": "Property",
        "fields": [
            {"name": "seller_name", "label": "Seller Name", "type": "text", "required": True},
            {"name": "buyer_name", "label": "Buyer Name", "type": "text", "required": True},
            {"name": "subject_description", "label": "Description of Property / Goods", "type": "textarea", "required": True},
            {"name": "sale_price", "label": "Sale Price (INR)", "type": "number", "required": True},
            {"name": "advance_amount", "label": "Advance Amount (INR)", "type": "number", "required": True},
            {"name": "agreement_date", "label": "Agreement Date", "type": "date", "required": True},
            {"name": "payment_schedule", "label": "Payment Schedule", "type": "textarea", "required": True},
        ],
    },
    {
        "id": "loan-agreement",
        "name": "Loan Agreement",
        "description": "Loan agreement covering lender, borrower, loan amount, repayment terms, interest, and default conditions.",
        "category": "Finance",
        "fields": [
            {"name": "lender_name", "label": "Lender Name", "type": "text", "required": True},
            {"name": "borrower_name", "label": "Borrower Name", "type": "text", "required": True},
            {"name": "loan_amount", "label": "Loan Amount (INR)", "type": "number", "required": True},
            {"name": "interest_rate", "label": "Interest Rate (%)", "type": "number", "required": True},
            {"name": "repayment_period", "label": "Repayment Period", "type": "text", "required": True},
            {"name": "loan_date", "label": "Loan Date", "type": "date", "required": True},
            {"name": "repayment_terms", "label": "Repayment Terms", "type": "textarea", "required": True},
        ],
    },
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
