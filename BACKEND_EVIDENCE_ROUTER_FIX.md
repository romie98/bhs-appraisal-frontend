# Backend Evidence Router Fix - Verification Checklist

## Problem
The `/evidence/upload` endpoint returns 404 because the evidence router is not registered in the FastAPI application.

## Solution Checklist

### 1️⃣ Verify `app/main.py` imports Evidence router

**File:** `app/main.py`

**Check for:**
```python
from app.modules.evidence.routers import router as evidence_router
```

**If missing, add it near the top with other imports:**
```python
from app.modules.photo_library.routers import router as photo_library_router
from app.modules.lesson_plans.routers import router as lesson_plans_router
from app.modules.logbook.routers import router as logbook_router
from app.modules.evidence.routers import router as evidence_router  # ADD THIS
```

---

### 2️⃣ Verify `app/main.py` includes Evidence router

**File:** `app/main.py`

**Check for:**
```python
app.include_router(evidence_router, prefix="/evidence")
```

**If missing, add it after other router includes:**
```python
app.include_router(photo_library_router, prefix="/photo-library")
app.include_router(lesson_plans_router, prefix="/lesson-plans")
app.include_router(logbook_router, prefix="/logbook")
app.include_router(evidence_router, prefix="/evidence")  # ADD THIS
```

**Important:** 
- If the router file already defines a prefix (e.g., `router = APIRouter(prefix="/evidence")`), then use:
  ```python
  app.include_router(evidence_router)  # No prefix here
  ```
- If the router file does NOT define a prefix, use:
  ```python
  app.include_router(evidence_router, prefix="/evidence")
  ```

---

### 3️⃣ Verify Evidence module folder structure

**Required structure:**
```
app/
 └─ modules/
      └─ evidence/
           ├─ __init__.py          ← REQUIRED (must exist)
           ├─ models.py            ← Evidence model
           ├─ routers.py           ← Router with /upload endpoint
           ├─ schemas.py           ← Pydantic schemas (optional)
           └─ services.py          ← Business logic (optional)
```

**Check:**
- ✅ `app/modules/evidence/__init__.py` exists (can be empty)
- ✅ `app/modules/evidence/routers.py` exists
- ✅ Router file is named `routers.py` (NOT `evidence_router.py` or `router.py`)

**If `__init__.py` is missing, create it:**
```python
# app/modules/evidence/__init__.py
# This file makes Python treat the directory as a package
```

---

### 4️⃣ Verify `/evidence/upload` route exists in routers.py

**File:** `app/modules/evidence/routers.py`

**Check for:**
```python
@router.post("/upload")
async def upload_evidence(...):
    # ... upload logic ...
```

**Common mistakes to fix:**
- ❌ `@router.post("upload")` → Missing leading slash
- ❌ `@router.post("/uploads")` → Wrong route name
- ❌ `@router.get("/upload")` → Wrong HTTP method (should be POST)
- ❌ `@router.post("/evidence/upload")` → Wrong (prefix already set in main.py)

**Correct format:**
```python
from fastapi import APIRouter, UploadFile, File, Depends
from fastapi.security import HTTPBearer

router = APIRouter()  # or APIRouter(prefix="/evidence") if prefix is here

@router.post("/upload")
async def upload_evidence(
    file: UploadFile = File(...),
    # ... other parameters ...
):
    # ... upload logic ...
    return {"supabase_url": "...", "id": ...}
```

---

### 5️⃣ Remove old conflicting modules

**Search for and DELETE these if they exist:**
- `app/modules/evidence_store/` (old module)
- `app/services/local_evidence.py` (old service)
- Any file importing `localEvidenceStore` or `localPath`

**These can cause import conflicts and prevent the new router from loading.**

---

### 6️⃣ Verify router is exported correctly

**File:** `app/modules/evidence/routers.py`

**Ensure the router is exported:**
```python
from fastapi import APIRouter

router = APIRouter()  # or APIRouter(prefix="/evidence")

@router.post("/upload")
async def upload_evidence(...):
    ...

# Make sure router is accessible for import
```

---

## Expected `app/main.py` Structure

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ... other imports ...

# Router imports
from app.modules.photo_library.routers import router as photo_library_router
from app.modules.lesson_plans.routers import router as lesson_plans_router
from app.modules.logbook.routers import router as logbook_router
from app.modules.evidence.routers import router as evidence_router  # ADD THIS

app = FastAPI()

# ... CORS and other middleware ...

# Include routers
app.include_router(photo_library_router, prefix="/photo-library")
app.include_router(lesson_plans_router, prefix="/lesson-plans")
app.include_router(logbook_router, prefix="/logbook")
app.include_router(evidence_router, prefix="/evidence")  # ADD THIS

# ... rest of app setup ...
```

---

## Verification Steps

After making changes:

1. **Check Swagger UI:**
   - Start backend server
   - Navigate to `http://localhost:8000/docs` (or your backend URL)
   - Look for `/evidence/upload` endpoint in the POST section
   - If it appears → ✅ Router is registered correctly

2. **Test the endpoint:**
   ```bash
   curl -X POST "http://localhost:8000/evidence/upload" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@test.jpg"
   ```

3. **Check backend logs:**
   - Start backend with verbose logging
   - Look for router registration messages
   - Check for any import errors related to evidence module

---

## Common Issues and Fixes

### Issue 1: "ModuleNotFoundError: No module named 'app.modules.evidence'"
**Fix:** Ensure `app/modules/evidence/__init__.py` exists

### Issue 2: "AttributeError: module has no attribute 'router'"
**Fix:** Ensure `routers.py` exports `router` variable:
```python
router = APIRouter()
```

### Issue 3: Router appears in Swagger but returns 404
**Fix:** Check that the route path matches exactly:
- Router prefix: `/evidence`
- Route path: `/upload`
- Full path: `/evidence/upload` ✅

### Issue 4: Import works but router not included
**Fix:** Ensure `app.include_router()` is called AFTER `app = FastAPI()`:
```python
app = FastAPI()
# ... middleware ...
app.include_router(evidence_router, prefix="/evidence")  # Must be after app creation
```

---

## Files to Update

1. ✅ `app/main.py` - Add import and include_router
2. ✅ `app/modules/evidence/__init__.py` - Ensure exists
3. ✅ `app/modules/evidence/routers.py` - Verify `/upload` route exists
4. ❌ Delete any old `evidence_store` or conflicting modules

---

## After Fixes

1. **Redeploy backend** to Railway/your hosting platform
2. **Test endpoint:**
   ```bash
   POST https://bhs-appraisal-backend-production.up.railway.app/evidence/upload
   ```
3. **Verify in Swagger UI:**
   - Navigate to backend `/docs`
   - Confirm `/evidence/upload` appears

---

## Quick Fix Template

If you have access to `app/main.py`, add these two lines:

**At the top with imports:**
```python
from app.modules.evidence.routers import router as evidence_router
```

**After other router includes:**
```python
app.include_router(evidence_router, prefix="/evidence")
```

That's it! The router should now be registered and `/evidence/upload` should work.
























