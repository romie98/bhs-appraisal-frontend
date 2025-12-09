# Backend Fix for Photo Evidence Upload

## Problem
Backend error: `(psycopg2.errors.UndefinedColumn) column "filename" of relation "photo_evidence" does not exist`

The `photo_evidence` table is missing required columns that the SQLAlchemy model expects.

## Required Fixes

### 1. Update SQLAlchemy Model

**File:** `app/models/photo_evidence.py` (or wherever PhotoEvidence model is defined)

Ensure the model matches this exact structure:

```python
from sqlalchemy import Column, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base

class PhotoEvidence(Base):
    __tablename__ = "photo_evidence"
    
    id = Column(String, primary_key=True)
    teacher_id = Column(String, nullable=False)
    filename = Column(String, nullable=False)  # ✅ Required
    file_path = Column(String, nullable=True)  # ✅ Optional (legacy)
    supabase_path = Column(String, nullable=True)  # ✅ Required for Supabase
    supabase_url = Column(String, nullable=True)  # ✅ Required for Supabase
    ocr_text = Column(Text, nullable=True)  # ✅ OCR extracted text
    gp_recommendations = Column(JSON, nullable=True)  # ✅ AI recommendations
    gp_subsections = Column(JSON, nullable=True)  # ✅ GP subsections array
    uploaded_at = Column(DateTime, server_default=func.now())  # ✅ Timestamp
```

### 2. Database Migration

**Run this SQL on your Railway PostgreSQL database:**

```sql
-- Add all missing columns to photo_evidence table
ALTER TABLE photo_evidence 
ADD COLUMN IF NOT EXISTS filename TEXT;

ALTER TABLE photo_evidence 
ADD COLUMN IF NOT EXISTS file_path TEXT;

ALTER TABLE photo_evidence 
ADD COLUMN IF NOT EXISTS supabase_path TEXT;

ALTER TABLE photo_evidence 
ADD COLUMN IF NOT EXISTS supabase_url TEXT;

ALTER TABLE photo_evidence 
ADD COLUMN IF NOT EXISTS ocr_text TEXT;

ALTER TABLE photo_evidence 
ADD COLUMN IF NOT EXISTS gp_recommendations JSONB;

ALTER TABLE photo_evidence 
ADD COLUMN IF NOT EXISTS gp_subsections JSONB;

ALTER TABLE photo_evidence 
ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP DEFAULT NOW();

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'photo_evidence'
ORDER BY ordinal_position;
```

### 3. Fix Supabase URL Cleaning

**File:** `app/utils/supabase_storage.py` (or wherever `upload_bytes_to_supabase()` is defined)

Update the function to remove trailing '?' from Supabase URLs:

```python
async def upload_bytes_to_supabase(
    file_bytes: bytes,
    filename: str,
    folder: str = "uploads"
) -> tuple[str, str]:
    """
    Upload file bytes to Supabase storage and return (path, public_url)
    """
    # ... existing upload code ...
    
    # Get public URL
    public_url = storage_client.get_public_url(bucket_name, file_path)
    
    # Remove trailing '?' from Supabase URLs
    if public_url and public_url.endswith("?"):
        public_url = public_url[:-1]
    
    return file_path, public_url
```

### 4. Update Upload Endpoint

**File:** `app/routers/photo_library.py` (or wherever `/photo-library/upload` is defined)

Ensure the endpoint saves all required fields:

```python
@router.post("/upload")
async def upload_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload photo, run OCR, extract GP recommendations, and save to photo_evidence table
    """
    # Read file bytes
    file_bytes = await file.read()
    
    # Upload to Supabase
    supabase_path, supabase_url = await upload_bytes_to_supabase(
        file_bytes=file_bytes,
        filename=file.filename,
        folder="photo-library"
    )
    
    # Run OCR (your existing OCR logic)
    ocr_text = await run_ocr(file_bytes)  # Your OCR function
    
    # Extract GP recommendations (your existing AI logic)
    gp_recommendations = await extract_gp_recommendations(ocr_text)  # Your AI function
    gp_subsections = await extract_gp_subsections(ocr_text)  # Your AI function
    
    # Save to database
    photo = PhotoEvidence(
        id=str(uuid.uuid4()),  # Generate UUID
        teacher_id=current_user.id,
        filename=file.filename,  # ✅ Required
        file_path=None,  # Optional (legacy)
        supabase_path=supabase_path,  # ✅ Required
        supabase_url=supabase_url,  # ✅ Required
        ocr_text=ocr_text,  # ✅ OCR text
        gp_recommendations=gp_recommendations,  # ✅ AI recommendations
        gp_subsections=gp_subsections,  # ✅ GP subsections
        uploaded_at=func.now()  # ✅ Timestamp
    )
    
    db.add(photo)
    db.commit()
    db.refresh(photo)
    
    return {
        "id": photo.id,
        "filename": photo.filename,
        "supabase_path": photo.supabase_path,
        "supabase_url": photo.supabase_url,
        "ocr_text": photo.ocr_text,
        "gp_recommendations": photo.gp_recommendations,
        "gp_subsections": photo.gp_subsections,
        "uploaded_at": photo.uploaded_at.isoformat() if photo.uploaded_at else None
    }
```

### 5. Python Migration Script (Optional)

If you prefer a Python migration script:

```python
from sqlalchemy import text
from app.database import engine

def migrate_photo_evidence_table():
    """
    Add missing columns to photo_evidence table
    """
    with engine.connect() as conn:
        # Add columns
        conn.execute(text("""
            ALTER TABLE photo_evidence 
            ADD COLUMN IF NOT EXISTS filename TEXT;
        """))
        conn.execute(text("""
            ALTER TABLE photo_evidence 
            ADD COLUMN IF NOT EXISTS file_path TEXT;
        """))
        conn.execute(text("""
            ALTER TABLE photo_evidence 
            ADD COLUMN IF NOT EXISTS supabase_path TEXT;
        """))
        conn.execute(text("""
            ALTER TABLE photo_evidence 
            ADD COLUMN IF NOT EXISTS supabase_url TEXT;
        """))
        conn.execute(text("""
            ALTER TABLE photo_evidence 
            ADD COLUMN IF NOT EXISTS ocr_text TEXT;
        """))
        conn.execute(text("""
            ALTER TABLE photo_evidence 
            ADD COLUMN IF NOT EXISTS gp_recommendations JSONB;
        """))
        conn.execute(text("""
            ALTER TABLE photo_evidence 
            ADD COLUMN IF NOT EXISTS gp_subsections JSONB;
        """))
        conn.execute(text("""
            ALTER TABLE photo_evidence 
            ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP DEFAULT NOW();
        """))
        conn.commit()
        print("✅ Added all required columns to photo_evidence table")
        
        # Verify
        result = conn.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'photo_evidence'
            ORDER BY ordinal_position;
        """))
        print("\n📋 Current photo_evidence table structure:")
        for row in result:
            print(f"  - {row[0]}: {row[1]}")

if __name__ == "__main__":
    migrate_photo_evidence_table()
```

## Verification Steps

### 1. Check Table Structure
```sql
\d photo_evidence
```

Expected columns:
- `id` (TEXT/STRING)
- `teacher_id` (TEXT/STRING)
- `filename` (TEXT) ✅
- `file_path` (TEXT) ✅
- `supabase_path` (TEXT) ✅
- `supabase_url` (TEXT) ✅
- `ocr_text` (TEXT) ✅
- `gp_recommendations` (JSONB) ✅
- `gp_subsections` (JSONB) ✅
- `uploaded_at` (TIMESTAMP) ✅

### 2. Test Upload Endpoint

```bash
curl -X POST "https://bhs-appraisal-backend-production.up.railway.app/photo-library/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.jpg"
```

Expected response:
```json
{
  "id": "uuid-here",
  "filename": "test.jpg",
  "supabase_path": "photo-library/uuid/test.jpg",
  "supabase_url": "https://...supabase.co/storage/v1/object/public/...",
  "ocr_text": "Extracted text from image...",
  "gp_recommendations": ["GP1", "GP2"],
  "gp_subsections": ["GP 1.1", "GP 2.3"],
  "uploaded_at": "2024-01-01T12:00:00"
}
```

### 3. Verify Database Record

```sql
SELECT 
  id,
  filename,
  supabase_url,
  LENGTH(ocr_text) as ocr_length,
  gp_recommendations,
  gp_subsections,
  uploaded_at
FROM photo_evidence
ORDER BY uploaded_at DESC
LIMIT 1;
```

## Expected Results

After applying all fixes:

- ✅ No more `UndefinedColumn` errors
- ✅ Photos upload successfully to Supabase
- ✅ `supabase_url` and `supabase_path` are saved correctly
- ✅ OCR text is extracted and saved
- ✅ GP recommendations are extracted and saved as JSON
- ✅ GP subsections are extracted and saved as JSON
- ✅ Supabase URLs have no trailing '?'
- ✅ Frontend receives complete response with all fields
- ✅ Photos display correctly using Supabase URLs

## Troubleshooting

### Error: "column already exists"
- The `IF NOT EXISTS` clause prevents this, but if you see it, the column already exists (good!)

### Error: "relation photo_evidence does not exist"
- Create the table first using the SQLAlchemy model, then run the migration

### Error: "JSONB type not supported"
- Use `JSON` instead of `JSONB` if your PostgreSQL version doesn't support it

### Supabase URL still has trailing '?'
- Check that `upload_bytes_to_supabase()` removes the trailing '?' before returning


