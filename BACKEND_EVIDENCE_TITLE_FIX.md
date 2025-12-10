# Backend Fix: Evidence Title Not Saving

## Problem
The evidence title is not being saved to the database, causing all evidence to show as "Untitled Evidence" in the UI. The frontend is correctly sending the title, but the backend needs to:
1. Add `title` column to the database
2. Update the SQLAlchemy model
3. Accept and save title in the upload endpoint
4. Return title in the list endpoint

## Required Fixes

### 1. DATABASE MIGRATION — Add title field

**Run this SQL on your Railway PostgreSQL database:**

```sql
-- Add title column to evidence table
ALTER TABLE evidence
ADD COLUMN IF NOT EXISTS title TEXT;

-- Set default for existing records (optional)
UPDATE evidence
SET title = 'Untitled Evidence'
WHERE title IS NULL;

-- Verify column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'evidence'
AND column_name = 'title';
```

**Expected Result:**
- Column `title` (TEXT, nullable) should exist in the `evidence` table

---

### 2. BACKEND: Update Evidence Model

**File:** `app/models/evidence.py` (or wherever Evidence SQLAlchemy model is defined)

**Add the `title` field to the Evidence model:**

```python
from sqlalchemy import Column, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base

class Evidence(Base):
    __tablename__ = "evidence"
    
    id = Column(String, primary_key=True)
    teacher_id = Column(String, nullable=False)
    title = Column(Text, nullable=True)  # ✅ Add this field
    filename = Column(String, nullable=True)
    file_path = Column(String, nullable=True)
    supabase_path = Column(String, nullable=True)
    supabase_url = Column(String, nullable=True)
    gp = Column(String, nullable=True)
    subsection = Column(String, nullable=True)
    gp_section = Column(String, nullable=True)  # Format: "GP 1.1"
    description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    selected_evidence = Column(JSON, nullable=True)
    uploaded_at = Column(DateTime, server_default=func.now())
    # ... other fields
```

**Note:** Using `nullable=True` allows existing records without titles. If you want to enforce titles, use `nullable=False, default="Untitled Evidence"`.

---

### 3. BACKEND: Accept title in create evidence endpoint

**File:** `app/routers/evidence.py` or `app/modules/evidence/routers.py`

**Update the POST `/evidence/upload` endpoint:**

```python
from fastapi import File, UploadFile, Form, Depends
from typing import Optional
from uuid import uuid4

@router.post("/upload")
async def upload_evidence(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),  # ✅ Add this parameter
    gp: Optional[str] = Form(None),
    subsection: Optional[str] = Form(None),
    gp_section: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    selectedEvidence: Optional[str] = Form(None),  # JSON string
    current_user: User = Depends(get_current_user)
):
    """
    Upload evidence file to Supabase and save metadata to database
    """
    # Read file bytes
    file_bytes = await file.read()
    
    # Upload to Supabase
    supabase_path, supabase_url = await upload_bytes_to_supabase(
        file_bytes=file_bytes,
        filename=file.filename,
        folder="evidence"
    )
    
    # Parse selectedEvidence JSON if provided
    selected_evidence_list = None
    if selectedEvidence:
        try:
            selected_evidence_list = json.loads(selectedEvidence)
        except:
            pass
    
    # ✅ Ensure title has a default value
    evidence_title = title if title and title.strip() else "Untitled Evidence"
    
    # Save to database
    new_evidence = Evidence(
        id=str(uuid4()),
        teacher_id=current_user.id,
        title=evidence_title,  # ✅ Save title
        filename=file.filename,
        supabase_path=supabase_path,
        supabase_url=supabase_url,
        gp=gp,
        subsection=subsection,
        gp_section=gp_section,  # Format: "GP 1.1"
        description=description,
        notes=notes,
        selected_evidence=selected_evidence_list,
        uploaded_at=func.now()
    )
    
    db.add(new_evidence)
    db.commit()
    db.refresh(new_evidence)
    
    return {
        "id": new_evidence.id,
        "title": new_evidence.title,  # ✅ Include title in response
        "filename": new_evidence.filename,
        "supabase_path": new_evidence.supabase_path,
        "supabase_url": new_evidence.supabase_url,
        "gp": new_evidence.gp,
        "subsection": new_evidence.subsection,
        "gp_section": new_evidence.gp_section,
        "description": new_evidence.description,
        "notes": new_evidence.notes,
        "selected_evidence": new_evidence.selected_evidence,
        "uploaded_at": new_evidence.uploaded_at.isoformat() if new_evidence.uploaded_at else None
    }
```

**Key Points:**
- Add `title: Optional[str] = Form(None)` to the endpoint parameters
- Extract title from form data: `evidence_title = title if title and title.strip() else "Untitled Evidence"`
- Save title to the Evidence model: `title=evidence_title`
- Return title in the response: `"title": new_evidence.title`

---

### 4. BACKEND: Return title in evidence list API

**File:** `app/routers/evidence.py` or `app/modules/evidence/routers.py`

**Update the GET `/evidence/` endpoint:**

```python
@router.get("/")
async def list_evidence(
    gp_section: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    List all evidence for the current user, optionally filtered by gp_section
    """
    query = db.query(Evidence).filter(Evidence.teacher_id == current_user.id)
    
    if gp_section:
        query = query.filter(Evidence.gp_section == gp_section)
    
    evidence_list = query.all()
    
    return [
        {
            "id": e.id,
            "title": e.title or "Untitled Evidence",  # ✅ Include title with fallback
            "filename": e.filename,
            "supabase_url": e.supabase_url,
            "supabase_path": e.supabase_path,
            "gp": e.gp,
            "subsection": e.subsection,
            "gp_section": e.gp_section,
            "description": e.description,
            "notes": e.notes,
            "selected_evidence": e.selected_evidence,
            "uploaded_at": e.uploaded_at.isoformat() if e.uploaded_at else None
        }
        for e in evidence_list
    ]
```

**Key Points:**
- Ensure `"title": e.title or "Untitled Evidence"` is included in the response
- Provide a fallback for records that might not have a title yet

---

### 5. FRONTEND: Verify title binding (Already Correct)

**File:** `src/components/EvidenceCard.jsx`

**Current implementation is correct:**

```jsx
// In grid card
<h3 className="font-semibold text-gray-800 mb-2 line-clamp-1 text-sm">
  {evidence.title || 'Untitled Evidence'}
</h3>

// In modal header
<h3 className="text-xl font-bold text-gray-800 mb-1">
  {evidence.title || 'Untitled Evidence'}
</h3>
```

✅ **No changes needed** - Frontend is already correctly displaying titles with fallback.

---

### 6. FRONTEND: Verify upload form sends title (Already Correct)

**File:** `src/components/EvidenceUploader.jsx`

**Current implementation is correct:**

```javascript
const metadata = {
  gp: gp,
  subsection: subsection,
  gp_section: gpSection,
  title: title,  // ✅ Title is included
  description: notes,
  selectedEvidence: selectedEvidence,
  notes: notes,
}

const result = await evidenceApi.upload(file, metadata)
```

**File:** `src/services/markbookApi.js`

**Current implementation is correct:**

```javascript
if (metadata.title) formData.append('title', metadata.title)  // ✅ Title is appended to FormData
```

✅ **No changes needed** - Frontend is already correctly sending title in FormData.

---

## Verification Steps

### 1. Check Database Schema

```sql
\d evidence
```

Expected columns should include:
- `id` (TEXT/STRING)
- `teacher_id` (TEXT/STRING)
- `title` (TEXT) ✅
- `filename` (TEXT)
- `supabase_path` (TEXT)
- `supabase_url` (TEXT)
- `gp_section` (TEXT)
- `uploaded_at` (TIMESTAMP)
- ... other fields

### 2. Test Upload Endpoint

```bash
curl -X POST "https://bhs-appraisal-backend-production.up.railway.app/evidence/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.pdf" \
  -F "title=My Test Evidence Title" \
  -F "gp=GP 1" \
  -F "subsection=1.1" \
  -F "gp_section=GP 1.1" \
  -F "description=Test description"
```

**Expected response:**
```json
{
  "id": "uuid-here",
  "title": "My Test Evidence Title",  // ✅ Should match what was sent
  "filename": "test.pdf",
  "supabase_path": "evidence/uuid/test.pdf",
  "supabase_url": "https://...supabase.co/storage/v1/object/public/...",
  "gp": "GP 1",
  "subsection": "1.1",
  "gp_section": "GP 1.1",
  "uploaded_at": "2024-01-01T12:00:00"
}
```

### 3. Test List Endpoint

```bash
curl -X GET "https://bhs-appraisal-backend-production.up.railway.app/evidence/" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected response:**
```json
[
  {
    "id": "uuid-here",
    "title": "My Test Evidence Title",  // ✅ Should be present
    "filename": "test.pdf",
    "supabase_url": "https://...",
    ...
  }
]
```

### 4. Verify in Frontend

1. Upload new evidence with a title
2. Check that the title appears in the grid card
3. Open the modal and verify the title appears in the header
4. Check that existing evidence without titles show "Untitled Evidence"

---

## Summary

**Frontend Status:** ✅ Already correctly implemented
- Title is sent in FormData
- Title is displayed with fallback in both card and modal

**Backend Status:** ❌ Needs implementation
1. Add `title` column to database
2. Update SQLAlchemy model
3. Accept `title` in upload endpoint
4. Save `title` to database
5. Return `title` in list endpoint

Once the backend changes are applied, the evidence title should display correctly throughout the application.
