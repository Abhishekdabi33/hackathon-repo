# 🤝 Team Collaboration & Git Workflow Guide

This workflow is optimized for a **4-person hackathon team** to eliminate merge conflicts, avoid overwriting work, and maintain velocity under tight time constraints.

---

## 1. Branching Strategy

```
main (Production / Final Submission - STABLE)
  └── dev (Integration Branch - Active Testing)
        ├── feat/frontend-ui (Member 2)
        ├── feat/backend-api (Member 3)
        ├── feat/ai-pipeline (Member 4)
        └── feat/lead-integration (Member 1)
```

- **`main`**: The pristine, demo-ready branch. Only merge tested code here.
- **`dev`**: The integration branch. Teammates merge their feature branches here first.
- **`feat/<your-name>-<feature>`**: Your individual working branch. Never commit directly to `main`!

---

## 2. Daily Routine

### Start of every coding session:
```bash
git checkout dev
git pull origin dev
git checkout feat/<your-feature>
git merge dev
```

### When your feature is ready:
1. Test your code locally.
2. Commit with meaningful messages: `feat: add AI chat streaming endpoint`.
3. Push your branch: `git push origin feat/<your-feature>`.
4. Open a Pull Request from `feat/<your-feature>` into `dev`.
5. Have 1 teammate review and approve.

---

## 3. Conflict Prevention Rules

1. **Strict File Ownership**:
   - Frontend team works inside `frontend/`.
   - Backend team works inside `backend/`.
   - AI team works inside `ai_ml/`.
   - If you need changes in another component, talk to that owner first!
2. **Never Commit Secrets**:
   - Always put API keys in `.env` (which is gitignored).
   - Use `.env.example` to document required keys.
3. **Never Commit Huge Files**:
   - Model weights (`.safetensors`, `.bin`, `.gguf`) must NOT be committed to git.
   - Use Google Drive, HuggingFace Hub, or cloud storage links.
