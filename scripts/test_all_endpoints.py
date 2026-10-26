import httpx
import sys

def test_server(base_url, name):
    print(f"\n{'='*20} TESTING {name} ({base_url}) {'='*20}")
    
    # 1. Health
    try:
        r = httpx.get(f"{base_url}/api/health", timeout=10.0)
        print(f"[{r.status_code}] GET /api/health")
    except Exception as e:
        print(f"[ERR] GET /api/health: {e}")

    # 2. Analyze
    try:
        payload = {
            "report_text": "VITALS:\nBlood pressure 140/mmHg\nPulse: 76 bpm\nTemperature 36.8 C",
            "file_name": "general_checkup.txt"
        }
        r = httpx.post(f"{base_url}/api/clinical/analyze", json=payload, timeout=20.0)
        print(f"[{r.status_code}] POST /api/clinical/analyze")
        if r.status_code == 200:
            d = r.json()
            print(f"       -> abnormal_count: {d.get('abnormal_count')}, total_tests: {d.get('total_tests')}")
            print(f"       -> explanation length: {len(d.get('explanation', ''))}")
        else:
            print(f"       -> ERROR: {r.text[:250]}")
    except Exception as e:
        print(f"[ERR] POST /api/clinical/analyze: {e}")

    # 3. Ask
    try:
        payload = {
            "question": "What does my 140 BP mean?",
            "report_text": "Blood pressure 140/mmHg, Pulse 76 bpm"
        }
        r = httpx.post(f"{base_url}/api/clinical/ask", json=payload, timeout=15.0)
        print(f"[{r.status_code}] POST /api/clinical/ask")
        if r.status_code != 200:
            print(f"       -> ERROR: {r.text[:250]}")
    except Exception as e:
        print(f"[ERR] POST /api/clinical/ask: {e}")

    # 4. RAG Ask (Talk Agent & Chat backend)
    try:
        payload = {
            "question": "Is my blood pressure high?",
            "report_text": "Blood pressure 140/mmHg, Pulse 76 bpm"
        }
        r = httpx.post(f"{base_url}/api/clinical/rag-ask", json=payload, timeout=15.0)
        print(f"[{r.status_code}] POST /api/clinical/rag-ask")
        if r.status_code != 200:
            print(f"       -> ERROR: {r.text[:250]}")
        else:
            ans = r.json().get("answer", "")
            print(f"       -> answer preview: {ans[:80]}...")
    except Exception as e:
        print(f"[ERR] POST /api/clinical/rag-ask: {e}")

    # 5. Export Summary
    try:
        payload = {
            "patient_name": "Jane Doe",
            "report_title": "General Checkup",
            "summary": "### Executive Health Summary\nBlood pressure observed at 140 mmHg.",
            "evidence_trace": [
                {
                    "test_name": "Blood Pressure (Systolic)",
                    "value": 140.0,
                    "measured_value": 140.0,
                    "unit": "mmHg",
                    "stated_range": "90 - 120",
                    "status": "HIGH",
                    "clinical_significance": "Elevated systolic pressure."
                }
            ],
            "doctor_questions": ["What dietary adjustments can lower my BP?"]
        }
        r = httpx.post(f"{base_url}/api/clinical/export-summary", json=payload, timeout=15.0)
        print(f"[{r.status_code}] POST /api/clinical/export-summary")
        if r.status_code != 200:
            print(f"       -> ERROR: {r.text[:250]}")
    except Exception as e:
        print(f"[ERR] POST /api/clinical/export-summary: {e}")

if __name__ == "__main__":
    test_server("http://127.0.0.1:8000", "LOCAL BACKEND")
    test_server("https://lablens-ai-backend.onrender.com", "RENDER BACKEND")
