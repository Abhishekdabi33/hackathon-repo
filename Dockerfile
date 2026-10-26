# ==============================================================================
# LabLens AI — Production Backend Dockerfile (Python 3.12)
# ==============================================================================
FROM python:3.12-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app \
    PORT=8000

WORKDIR /app

# Install minimal OS runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/requirements.txt

# Copy backend source modules
COPY backend/ /app/backend/
COPY ai_engine/ /app/ai_engine/
COPY agent_harness/ /app/agent_harness/
COPY skills_engine/ /app/skills_engine/
COPY skills/ /app/skills/

# Health check to ensure FastAPI is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/docs || exit 1

EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT}"]
