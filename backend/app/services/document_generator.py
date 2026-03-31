from app.services.llm import llm_service
from app.services.vector_store import vector_store
from typing import Dict, Any
import json


class DocumentGeneratorService:
    async def generate_document(self, template_type: str, field_values: Dict[str, Any]) -> str:
        search_query = f"Indian legal drafting format and clauses for {template_type} covering {', '.join(field_values.keys())}"
        context_docs = await vector_store.search(search_query, n_results=5)

        context = "\n---\n".join(context_docs['documents'][0]) if context_docs['documents'] else "No relevant context found."
        structure_guidance = self._get_structure_guidance(template_type)

        system_prompt = (
            "You are an expert Indian legal drafting assistant. "
            "Draft formal, professional, plain-language legal documents that follow realistic Indian legal document structure. "
            "Do not invent unnecessary facts. Use the user-provided details accurately. "
            "Maintain a legal-document tone, proper headings, clause numbering, party identification, and signature sections. "
            "Always include Governing Law / Jurisdiction where appropriate for agreements. "
            "The output must be the final document text only."
        )

        user_prompt = f"""
Draft a complete '{template_type}' document using the provided details, Indian legal style guidance, and retrieved legal context.

DOCUMENT DETAILS:
{self._format_dict(field_values)}

TEMPLATE-SPECIFIC STRUCTURE REQUIREMENTS:
{structure_guidance}

LEGAL CONTEXT FROM DATABASE:
---
{context}
---

STRICT DRAFTING INSTRUCTIONS:
1. Write as a formal Indian legal draft, not as an AI explanation.
2. Start with an appropriate title in uppercase.
3. Include date/effective date language where relevant.
4. Identify all parties properly.
5. Use clear section headings and numbered clauses.
6. Use formal agreement language where appropriate, but keep wording understandable.
7. Include signature blocks at the end for parties.
8. If it is an affidavit, include verification language.
9. If a field is missing, use neutral placeholder-style wording only when necessary.
10. Return only the final document body, with no commentary before or after it.
"""
        return await llm_service.generate(system_prompt, user_prompt, max_tokens=3000)

    async def suggest_title(self, template_type: str, field_values: Dict[str, Any]) -> str:
        system_prompt = "You are an AI assistant that creates concise, professional legal document titles."
        user_prompt = f"""
Suggest a short, formal title for a '{template_type}' using these details:
{self._format_dict(field_values)}

Return only the title.
"""
        title = await llm_service.generate(system_prompt, user_prompt, max_tokens=100)
        return title.strip().replace('"', '')

    async def explain_clause(self, clause_text: str) -> str:
        system_prompt = "You are an AI legal analyst that explains complex legal text in simple, plain English for a non-lawyer."
        user_prompt = f"""
Explain the following legal clause in simple terms. Break it down into:
1. **What it means:** A one-sentence summary.
2. **Why it's important:** The purpose of this clause.
3. **Key takeaway:** What the user should be most aware of.

Clause: "{clause_text}"
"""
        return await llm_service.generate(system_prompt, user_prompt, max_tokens=500)

    async def generate_summary(self, document_text: str) -> str:
        system_prompt = "You are an AI that creates executive summaries of legal documents."
        user_prompt = f"""
Provide a brief, 3-4 sentence summary of the key points and purpose of this legal document:

Document:
---
{document_text[:4000]}
---
"""
        return await llm_service.generate(system_prompt, user_prompt, max_tokens=300)

    async def validate_document(self, document_text: str, template_type: str) -> Dict[str, Any]:
        system_prompt = "You are an AI legal compliance checker. You review documents for missing standard components."
        user_prompt = f"""
Analyze this '{template_type}' document for completeness. Check for these standard components:
- Identification of all parties.
- Clear statement of purpose/agreement.
- Key terms (e.g., payment, duration, scope).
- Governing Law and Jurisdiction clause where appropriate.
- Signature and Date blocks for all parties.
- Template-specific formal structure.

Report your findings as a simple checklist of what is present and what appears to be missing.

Document:
---
{document_text[:4000]}
---
"""
        report = await llm_service.generate(system_prompt, user_prompt, max_tokens=500)
        return {"report_text": report}

    async def analyze_risk(self, document_text: str, template_type: str) -> Dict[str, Any]:
        system_prompt = (
            "You are an AI legal risk reviewer for draft legal documents in India. "
            "Identify practical drafting risks, ambiguities, missing protections, and weak clauses. "
            "Return output in valid JSON only."
        )
        user_prompt = f"""
Review the following '{template_type}' draft and assess drafting risk.

Return ONLY valid JSON in this exact structure:
{{
  "risk_level": "Low" | "Medium" | "High",
  "summary": "short summary",
  "issues": [
    "issue 1",
    "issue 2"
  ],
  "suggestions": [
    "suggestion 1",
    "suggestion 2"
  ]
}}

RISK GUIDANCE:
- Low = mostly complete, minor improvements needed
- Medium = some important clauses are weak/missing or ambiguous
- High = serious omissions, ambiguity, or enforceability concerns

Document:
---
{document_text[:5000]}
---
"""
        response = await llm_service.generate(system_prompt, user_prompt, max_tokens=600)

        try:
            parsed = json.loads(response)
            risk_level = parsed.get("risk_level", "Medium")
            summary = parsed.get("summary", "Risk analysis generated.")
            issues = parsed.get("issues", [])
            suggestions = parsed.get("suggestions", [])

            if not isinstance(issues, list):
                issues = [str(issues)]
            if not isinstance(suggestions, list):
                suggestions = [str(suggestions)]

            if risk_level not in {"Low", "Medium", "High"}:
                risk_level = "Medium"

            return {
                "risk_level": risk_level,
                "summary": summary,
                "issues": issues,
                "suggestions": suggestions,
            }
        except Exception:
            return {
                "risk_level": "Medium",
                "summary": "Risk analysis could not be parsed cleanly, but the document should still be reviewed carefully.",
                "issues": ["Automated structured risk parsing failed."],
                "suggestions": ["Review clauses manually and consult a legal professional before use."],
            }

    def _get_structure_guidance(self, template_type: str) -> str:
        normalized = template_type.strip().lower()

        if normalized in {"rent-agreement", "rent agreement"}:
            return """
Use a realistic Indian rent agreement format with these sections where relevant:
- Title: RENT AGREEMENT
- Date / effective date
- BETWEEN / AND party identification
- Description of leased premises/property
- Term / duration of tenancy
- Monthly rent and mode/timing of payment
- Security deposit
- Use of premises
- Maintenance / repairs responsibilities
- Utilities / charges if relevant
- Termination / notice period
- Governing law and jurisdiction
- Signature blocks for landlord and tenant, with witness lines if appropriate
"""

        if normalized in {"nda", "non-disclosure agreement", "non disclosure agreement"}:
            return """
Use a realistic Indian NDA format with these sections:
- Title: NON-DISCLOSURE AGREEMENT
- Effective date
- Identification of disclosing and receiving parties
- Purpose of disclosure
- Definition of confidential information
- Obligations of receiving party
- Exclusions from confidential information
- Duration / term
- Breach and remedies
- Governing law and jurisdiction
- Signature blocks for both parties
"""

        if normalized in {"affidavit", "general affidavit"}:
            return """
Use a realistic Indian affidavit format with these sections:
- Title: AFFIDAVIT
- Identification of the deponent
- Formal affirmation/solemn declaration
- Numbered statements of fact
- Verification paragraph
- Place and date
- Signature of deponent
"""

        if normalized in {"employment-agreement", "employment agreement"}:
            return """
Use a realistic Indian employment agreement format with these sections:
- Title: EMPLOYMENT AGREEMENT
- Date / effective date
- Identification of employer and employee
- Position / designation
- Place of employment
- Date of joining / commencement
- Salary / compensation and benefits
- Duties and responsibilities
- Working hours / leave / conduct if relevant
- Confidentiality and termination
- Governing law and jurisdiction
- Signature blocks for employer and employee
"""

        if normalized in {"service-agreement", "service agreement"}:
            return """
Use a realistic Indian service agreement format with these sections:
- Title: SERVICE AGREEMENT
- Effective date
- Identification of service provider and client
- Scope of services
- Term / duration
- Fees and payment terms
- Obligations of each party
- Delay / non-performance / termination
- Confidentiality if relevant
- Governing law and jurisdiction
- Signature blocks for both parties
"""

        if normalized in {"power-of-attorney", "power of attorney"}:
            return """
Use a realistic Indian power of attorney format with these sections:
- Title: POWER OF ATTORNEY
- Date
- Identification of principal and attorney holder
- Recital explaining grant of authority
- Specific powers granted
- Duration / revocation terms
- Governing law / place if appropriate
- Signature of principal
- Witness blocks
"""

        if normalized in {"sale-agreement", "sale agreement"}:
            return """
Use a realistic Indian sale agreement format with these sections:
- Title: AGREEMENT FOR SALE
- Date / effective date
- Identification of seller and buyer
- Description of property / goods
- Sale consideration / total price
- Advance payment and balance payment terms
- Obligations of seller and buyer
- Delivery / transfer conditions
- Default / cancellation terms
- Governing law and jurisdiction
- Signature blocks for buyer and seller, with witness lines if appropriate
"""

        if normalized in {"loan-agreement", "loan agreement"}:
            return """
Use a realistic Indian loan agreement format with these sections:
- Title: LOAN AGREEMENT
- Date / effective date
- Identification of lender and borrower
- Loan amount
- Interest rate
- Repayment schedule / repayment terms
- Default consequences
- Borrower obligations / lender rights
- Governing law and jurisdiction
- Signature blocks for lender and borrower
"""

        return """
Use a realistic Indian legal document structure with:
- Title
- Effective date or date
- Identification of parties
- Clear purpose
- Numbered clauses
- Governing law/jurisdiction if applicable
- Signature blocks
"""

    def _format_dict(self, data: Dict[str, Any]) -> str:
        return "\n".join([f"- {key.replace('_', ' ').title()}: {value}" for key, value in data.items()])


document_generator_service = DocumentGeneratorService()
