from app.services.llm import llm_service
from app.services.vector_store import vector_store
from typing import Dict, Any

class DocumentGeneratorService:
    async def generate_document(self, template_type: str, field_values: Dict[str, Any]) -> str:
        search_query = f"Clause for a {template_type} regarding {', '.join(field_values.keys())}"
        context_docs = await vector_store.search(search_query, n_results=5)

        context = "\n---\n".join(context_docs['documents'][0]) if context_docs['documents'] else "No relevant context found."

        system_prompt = "You are a precise and expert legal drafting AI for Indian law. Your task is to generate a complete, professionally formatted legal document. Adhere strictly to the user's details and the provided legal context."
        user_prompt = f"""
        Generate a complete '{template_type}' document based on the following details and legal context.

        DOCUMENT DETAILS:
        {self._format_dict(field_values)}

        LEGAL CONTEXT FROM DATABASE:
        ---
        {context}
        ---

        INSTRUCTIONS:
        1. Create a full, coherent legal document.
        2. Integrate the user's details naturally into the clauses.
        3. Use the provided legal context to ensure the clauses are relevant and comprehensive.
        4. Structure the document with clear headings, numbered clauses, and placeholder signature blocks.
        5. The final output must be only the document text, without any introductory or concluding remarks.
        """
        return await llm_service.generate(system_prompt, user_prompt, max_tokens=3000)

    async def suggest_title(self, template_type: str, field_values: Dict[str, Any]) -> str:
        system_prompt = "You are an AI assistant that creates concise, professional document titles."
        user_prompt = f"""
        Suggest a short, professional title for a '{template_type}' with these details:
        {self._format_dict(field_values)}

        Provide only the title itself.
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
        - Governing Law and Jurisdiction clause.
        - Signature and Date blocks for all parties.

        Report your findings as a simple checklist of what is present and what appears to be missing.

        Document:
        ---
        {document_text[:4000]}
        ---
        """
        report = await llm_service.generate(system_prompt, user_prompt, max_tokens=500)
        return {"report_text": report}

    def _format_dict(self, data: Dict[str, Any]) -> str:
        return "\n".join([f"- {key.replace('_', ' ').title()}: {value}" for key, value in data.items()])

document_generator_service = DocumentGeneratorService()
