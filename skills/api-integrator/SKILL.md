---
name: api-integrator
description: Validates, formats, and generates API payloads and client integration code for open-weight LLMs and REST endpoints.
version: 1.0.0
author: Hackathon Team
tags:
  - api
  - integration
  - gemma
  - rest
---

# API Integrator Skill

## Purpose
Enables the agent to construct syntactically valid JSON REST payloads, generate client-side SDK integration code (Python httpx/requests and JavaScript fetch), and format authentication headers.

## When to Use
- When connecting frontend components to backend endpoints.
- When formatting requests for Google Gemma API, Gemini API, or open-weight model endpoints.

## Operational Instructions
1. **Endpoint Analysis**:
   - Determine HTTP method (GET, POST, PUT, DELETE).
   - Verify Content-Type headers and bearer authentication tokens.
2. **Payload Construction**:
   - Ensure strictly valid JSON serialization without trailing commas.
   - Include error fallback handling (status code 4xx, 5xx handling).
3. **Response Schema Alignment**:
   - Map response JSON fields to the expected frontend/consumer data contract.
