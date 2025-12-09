# Backend Fix for Evidence Title Support

## Problem
The Evidence table needs a `title` column to store user-provided evidence titles. The frontend is already sending `title` in the upload request, but the backend needs to accept and store it.

## Required Fixes

### 1. Update SQLAlchemy Model

**File:** `app/models/evidence.py` (or wherever Evidence model is defined)

Add the `title` field to the Evidence model:

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

### 2. Database Migration

**Run this SQL on your Railway PostgreSQL database:**

```sql
-- Add title column to evidence table
ALTER TABLE evidence 
ADD COLUMN IF NOT EXISTS title TEXT;

-- Verify column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'evidence'
ORDER BY ordinal_position;
```

### 3. Update Upload Endpoint

**File:** `app/routers/evidence.py` (or wherever `/evidence/upload` is defined)

Update the endpoint to accept `title` from FormData:

```python
from fastapi import File, UploadFile, Form, Depends
from typing import Optional

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
    
    # Save to database
    evidence = Evidence(
        id=str(uuid.uuid4()),
        teacher_id=current_user.id,
        title=title,  # ✅ Save title
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
    
    db.add(evidence)
    db.commit()
    db.refresh(evidence)
    
    return {
        "id": evidence.id,
        "title": evidence.title,  # ✅ Include title in response
        "filename": evidence.filename,
        "supabase_path": evidence.supabase_path,
        "supabase_url": evidence.supabase_url,
        "gp": evidence.gp,
        "subsection": evidence.subsection,
        "gp_section": evidence.gp_section,
        "description": evidence.description,
        "notes": evidence.notes,
        "selected_evidence": evidence.selected_evidence,
        "uploaded_at": evidence.uploaded_at.isoformat() if evidence.uploaded_at else None
    }
```

### 4. Update List Endpoint Response

Ensure the `/evidence/` list endpoint also returns `title`:

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
            "title": e.title,  # ✅ Include title
            "filename": e.filename,
            "supabase_url": e.supabase_url,
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

### 5. Python Migration Script (Optional)

If you prefer a Python migration script:

```python
from sqlalchemy import text
from app.database import engine

def add_title_column():
    """
    Add title column to evidence table
    """
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE evidence 
            ADD COLUMN IF NOT EXISTS title TEXT;
        """))
        conn.commit()
        print("✅ Added title column to evidence table")
        
        # Verify
        result = conn.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'evidence'
            AND column_name = 'title';
        """))
        row = result.fetchone()
        if row:
            print(f"✅ Verified: {row[0]} ({row[1]})")
        else:
            print("❌ Column not found")

if __name__ == "__main__":
    add_title_column()
```

## Verification Steps

### 1. Check Table Structure
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
  -F "title=My Evidence Title" \
  -F "gp=GP 1" \
  -F "subsection=1.1" \
  -F "gp_section=GP 1.1" \
  -F "description=Test description"
```

Expected response:
```json
{
  "id": "uuid-here",
  "title": "My Evidence Title",
  "filename": "test.pdf",
  "supabase_path": "evidence/uuid/test.pdf",
  "supabase_url": "https://...supabase.co/storage/v1/object/public/...",
  "gp": "GP 1",
  "subsection": "1.1",
  "gp_section": "GP 1.1",
  "uploaded_at": "2024-01-01T12:00:00"
}
```

### 3. Verify Database Record

```sql
SELECT 
  id,
  title,
  filename,
  supabase_url,
  gp_section,
  uploaded_at
FROM evidence
ORDER BY uploaded_at DESC
LIMIT 1;
```

## Expected Results

After applying all fixes:

- ✅ No more errors when saving evidence with title
- ✅ Title is saved to database
- ✅ Title appears in API responses
- ✅ Frontend displays title instead of "Untitled Evidence"
- ✅ Title is searchable/filterable if needed

## Frontend Status

The frontend is already configured to:
- ✅ Send `title` in FormData via `evidenceApi.upload()`
- ✅ Display `title` in EvidenceCard component
- ✅ Show "Untitled Evidence" as fallback if title is missing
- ✅ Display `uploaded_at` date properly formatted

Once the backend is updated, everything should work seamlessly.

