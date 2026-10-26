"""
LabLens AI - Multilingual Clinical RAG (Retrieval-Augmented Generation) Engine
Provides semantic chunking, cross-lingual biomedical keyword expansion,
BM25/TF-IDF retrieval, and multilingual report answering grounded in patient records.
"""

import re
import math
from typing import List, Dict, Any, Optional

# Cross-Lingual Clinical Synonym Lexicon (Indic + International to Medical Entities)
MULTILINGUAL_CLINICAL_MAP = {
    "blood_pressure": [
        "bp", "blood pressure", "pressure", "systolic", "diastolic", "hypertension",
        "rakhtchap", "rakta chap", "tension", "hyper", "high bp", "140", "120", "mmhg"
    ],
    "pulse_heart": [
        "pulse", "heart", "heart rate", "dhadkan", "hr", "bpm", "dil", "cardiac", "rhythm"
    ],
    "medication": [
        "dawa", "dawai", "medicine", "medication", "drug", "tablet", "goli", "rx", "prescription",
        "hydrochlorothiazide", "hctz", "dosage", "dose", "mg", "capsule", "syrup"
    ],
    "glucose_diabetes": [
        "sugar", "glucose", "diabetes", "diabetic", "madhumeh", "cheeni", "meetha",
        "hba1c", "fbs", "fasting"
    ],
    "diet_lifestyle": [
        "khana", "diet", "parhez", "food", "nutrition", "salt", "namak", "sodium", "exercise",
        "walk", "dash", "lifestyle", "lifestyle modification"
    ],
    "doctor_consult": [
        "doctor", "daktar", "physician", "dr", "ask", "sawal", "question", "puchna",
        "checkup", "follow up", "appointment"
    ],
    "temperature_fever": [
        "temp", "temperature", "fever", "bukhar", "pyrexia", "taapman", "garmi"
    ],
    "respiration_breathing": [
        "breathing", "respiratory", "saans", "sans", "breath", "lungs", "asthma"
    ],
    "overall_summary": [
        "kaisa", "summary", "report", "theek", "normal", "abnormal", "sab kuch", "overall", "condition", "haal"
    ]
}

# Gold-Standard Clinical Guidelines Knowledge Base Chunks (For Context Augmentation)
CLINICAL_KNOWLEDGE_CHUNKS = [
    {
        "id": "guideline_hypertension_jnc8",
        "category": "cardiovascular",
        "title": "AHA/ACC Hypertension Management Guidelines",
        "content": (
            "AHA/ACC Guidelines: Normal BP is <120/<80 mmHg. Elevated BP is 120-129/<80. "
            "Stage 1 Hypertension is 130-139 / 80-89 mmHg. Stage 2 Hypertension is >=140 / >=90 mmHg. "
            "First-line pharmacological agents include Thiazide diuretics (e.g. Hydrochlorothiazide), ACE inhibitors, ARBs, and CCBs. "
            "Patients on thiazides should monitor renal function, serum potassium, and adhere to a low-sodium DASH diet (<2000 mg/day)."
        )
    },
    {
        "id": "guideline_dash_diet",
        "category": "lifestyle",
        "title": "DASH Diet & Sodium Guidelines for Blood Pressure",
        "content": (
            "The DASH (Dietary Approaches to Stop Hypertension) diet emphasizes fruits, vegetables, whole grains, and lean poultry/fish. "
            "It strongly limits saturated fat, processed meats, and dietary sodium (<1500 to 2000 mg daily). "
            "Combining sodium restriction with regular 150 min/week moderate aerobic exercise lowers systolic BP by 8-14 mmHg."
        )
    },
    {
        "id": "guideline_diabetes_ada",
        "category": "metabolic",
        "title": "ADA Diabetes Screening & Glycemic Targets",
        "content": (
            "ADA Standards of Medical Care: Fasting blood glucose 70-99 mg/dL is normal; 100-125 mg/dL indicates prediabetes; "
            ">=126 mg/dL on repeated testing indicates diabetes mellitus. HbA1c <5.7% is normal; 5.7-6.4% prediabetes; >=6.5% diabetes. "
            "Glycemic management involves complex carbohydrates with low glycemic index, hydration, and regular post-meal walking."
        )
    },
    {
        "id": "guideline_cbc_hematology",
        "category": "hematology",
        "title": "WHO Anemia and Complete Blood Count Standards",
        "content": (
            "WHO Hematology Standards: Normal adult female hemoglobin is 12.0-15.5 g/dL; adult male is 13.5-17.5 g/dL. "
            "Hb <12.0 g/dL indicates anemia, commonly due to iron deficiency, folate/B12 deficiency, or chronic inflammation. "
            "Platelets below 150,000 /mcL require monitoring for bruising or bleeding tendencies."
        )
    }
]


class ClinicalRAGEngine:
    """
    In-memory semantic vector/keyword RAG engine optimized for medical reports.
    Supports multilingual query understanding (Hindi, Hinglish, English, etc.)
    and injects verified patient report context + clinical guidelines.
    """

    def __init__(self):
        self.active_report_chunks: List[Dict[str, Any]] = []
        self.active_report_name: str = ""

    def chunk_document(self, text: str, document_name: str = "Medical Report") -> List[Dict[str, Any]]:
        """
        Splits medical document into semantically meaningful chunks based on clinical sections.
        """
        self.active_report_name = document_name
        chunks = []
        raw_lines = text.splitlines()

        current_section = "General Overview"
        current_lines: List[str] = []

        section_triggers = {
            "PATIENT DETAILS": "Patient Demographics",
            "MEDICAL HISTORY": "Medical History & Surgeries",
            "VITALS": "Vital Signs & Measurements",
            "DOCTOR'S OBSERVATIONS": "Clinical Observations",
            "NOTES AND NEXT STEPS": "Medication & Treatment Plan",
            "INVESTIGATION": "Laboratory Test Results",
            "COMPLETE BLOOD COUNT": "Hematology CBC Panel",
            "LIPID PROFILE": "Cardiovascular Lipid Panel",
            "THYROID": "Endocrine Thyroid Panel"
        }

        for line in raw_lines:
            stripped = line.strip()
            if not stripped:
                continue

            # Check if line matches a new section header
            matched_header = None
            for trigger, sec_name in section_triggers.items():
                if trigger in stripped.upper():
                    matched_header = sec_name
                    break

            if matched_header:
                if current_lines:
                    chunks.append({
                        "id": f"chunk_{len(chunks)+1}",
                        "section": current_section,
                        "text": "\n".join(current_lines),
                        "source": document_name
                    })
                    current_lines = []
                current_section = matched_header
            
            current_lines.append(stripped)

        if current_lines:
            chunks.append({
                "id": f"chunk_{len(chunks)+1}",
                "section": current_section,
                "text": "\n".join(current_lines),
                "source": document_name
            })

        # If document had no structured headers, create sliding window chunks
        if len(chunks) <= 1 and len(text) > 300:
            chunks = []
            paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
            for idx, p in enumerate(paragraphs, 1):
                chunks.append({
                    "id": f"chunk_{idx}",
                    "section": f"Report Section {idx}",
                    "text": p,
                    "source": document_name
                })

        self.active_report_chunks = chunks
        return chunks

    def detect_query_intent(self, query: str) -> List[str]:
        """
        Expands user query across multilingual terms (Hindi, Hinglish, English)
        to identify clinical topics.
        """
        lower_q = query.lower()
        matched_intents = []

        for intent_key, synonyms in MULTILINGUAL_CLINICAL_MAP.items():
            for syn in synonyms:
                if syn in lower_q:
                    matched_intents.append(intent_key)
                    break

        return matched_intents

    def retrieve(self, query: str, top_k: int = 3) -> Dict[str, Any]:
        """
        Retrieves most relevant chunks from current patient report and clinical guidelines.
        """
        if not self.active_report_chunks:
            # Re-index if raw text is provided
            return {
                "report_chunks": [],
                "guideline_chunks": CLINICAL_KNOWLEDGE_CHUNKS[:2],
                "intents": self.detect_query_intent(query)
            }

        query_terms = set(re.findall(r"\w+", query.lower()))
        intents = self.detect_query_intent(query)

        # Add expanded synonyms to query terms
        for intent in intents:
            for syn in MULTILINGUAL_CLINICAL_MAP.get(intent, []):
                query_terms.update(syn.split())

        # Score report chunks
        scored_chunks = []
        for chunk in self.active_report_chunks:
            chunk_text_lower = chunk["text"].lower()
            score = 0
            for term in query_terms:
                if len(term) >= 3 and term in chunk_text_lower:
                    score += 2.0
            
            # Boost if section title matches
            if any(intent in chunk["section"].lower() for intent in intents):
                score += 3.0

            scored_chunks.append((score, chunk))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        top_report_chunks = [c for score, c in scored_chunks[:top_k] if score > 0]
        if not top_report_chunks and self.active_report_chunks:
            top_report_chunks = self.active_report_chunks[:2]

        # Score clinical guideline chunks
        scored_guidelines = []
        for g in CLINICAL_KNOWLEDGE_CHUNKS:
            g_score = 0
            g_lower = g["content"].lower()
            for term in query_terms:
                if len(term) >= 3 and term in g_lower:
                    g_score += 1.5
            scored_guidelines.append((g_score, g))

        scored_guidelines.sort(key=lambda x: x[0], reverse=True)
        top_guidelines = [g for score, g in scored_guidelines[:2] if score > 0]
        if not top_guidelines:
            top_guidelines = CLINICAL_KNOWLEDGE_CHUNKS[:1]

        return {
            "query": query,
            "intents": intents,
            "report_chunks": top_report_chunks,
            "guideline_chunks": top_guidelines
        }

    def build_grounded_prompt(self, user_query: str, report_text: Optional[str] = None, report_name: str = "Medical Report") -> str:
        """
        Assembles comprehensive RAG context payload for Google Gemma 4 12B.
        Detects query language and instructs model to respond natively.
        """
        if report_text and (not self.active_report_chunks or report_name != self.active_report_name):
            self.chunk_document(report_text, report_name)

        retrieval_data = self.retrieve(user_query, top_k=4)

        report_context_str = ""
        for i, c in enumerate(retrieval_data["report_chunks"], 1):
            report_context_str += f"\n[Context Chunk {i} - {c['section']}]:\n{c['text']}\n"

        guidelines_str = ""
        for g in retrieval_data["guideline_chunks"]:
            guidelines_str += f"\n- {g['title']}: {g['content']}\n"

        # Detect language hint (Hindi, Hinglish, Spanish, English)
        hindi_markers = ["kya", "mera", "meri", "hai", "kaise", "batao", "dawa", "dard", "khoon", "theek", "doctor", "kab"]
        is_hindi = any(re.search(rf"\b{w}\b", user_query.lower()) for w in hindi_markers)

        lang_instruction = (
            "LANGUAGE DIRECTIVE: The user asked in Hindi/Hinglish. Respond in warm, respectful, easy-to-understand Hindi/Hinglish so the patient easily understands their health."
            if is_hindi else
            "LANGUAGE DIRECTIVE: Respond in the exact language the user used (clear, supportive, plain language)."
        )

        prompt = f"""You are LabLens AI powered by Google Gemma 4 12B, a compassionate medical report assistant.
{lang_instruction}

GROUNDED PATIENT DATA (Grounded Evidence):
=============================================
{report_context_str if report_context_str else report_text or 'No direct report uploaded.'}
=============================================

CLINICAL GUIDELINES REFERENCE:
{guidelines_str}

USER QUESTION:
"{user_query}"

INSTRUCTIONS:
1. Answer the user's question directly using ONLY the grounded patient data and clinical reference above.
2. If citing numbers (e.g. blood pressure, sugar, pulse), explain whether it is normal or elevated, and what it practically means.
3. Provide safe lifestyle/dietary guidance and recommend what to ask their doctor.
4. Keep the tone empathetic, reassuring, and professional.
5. End with a 1-sentence medical disclaimer."""

        return prompt


# Global Singleton RAG Engine
clinical_rag = ClinicalRAGEngine()
