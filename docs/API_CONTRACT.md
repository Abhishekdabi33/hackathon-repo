# 📜 API Contract & Specification

Base URL: `http://localhost:8000/api/v1`

---

## 1. System Health
- **Endpoint**: `GET /health`
- **Response**:
```json
{
  "status": "healthy",
  "gpu_available": true,
  "device": "NVIDIA GeForce RTX 2050",
  "version": "1.0.0"
}
```

---

## 2. AI Chat / Completion
- **Endpoint**: `POST /chat`
- **Request Body**:
```json
{
  "prompt": "Summarize the key trends in edge AI.",
  "max_tokens": 256,
  "temperature": 0.7,
  "model": "llama3.2:1b"
}
```
- **Response**:
```json
{
  "response": "Here is the summary...",
  "model_used": "llama3.2:1b",
  "latency_ms": 142.5
}
```

---

## 3. Custom Prediction / Processing
- **Endpoint**: `POST /predict`
- **Request Body**:
```json
{
  "input_data": {
    "text": "Sample text or structured input"
  }
}
```
- **Response**:
```json
{
  "result": "Prediction result",
  "confidence": 0.94,
  "execution_time_sec": 0.045
}
```
