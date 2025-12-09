# Backend Database Schema Fix for Photo Library

## Problem
Backend error: `(psycopg2.errors.UndefinedColumn) column "supabase_url" does not exist`

The `photo_library` table is missing the `supabase_url` and `supabase_path` columns required for Supabase file storage.

## Solution

### 1. Add Missing Columns to `photo_library` Table

Run this SQL migration on your PostgreSQL database:

```sql
-- Add supabase_url column
ALTER TABLE photo_library 
ADD COLUMN IF NOT EXISTS supabase_url TEXT;

-- Add supabase_path column  
ALTER TABLE photo_library 
ADD COLUMN IF NOT EXISTS supabase_path TEXT;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'photo_library';
```

### 2. Verify SQLAlchemy Model

Ensure your `PhotoLibrary` model in the backend includes these fields:

```python
class PhotoLibrary(Base):
    __tablename__ = "photo_library"
    
    id = Column(String, primary_key=True)
    teacher_id = Column(String, nullable=False)
    filename = Column(String)
    supabase_path = Column(String)  # ✅ Required
    supabase_url = Column(String)   # ✅ Required
    created_at = Column(DateTime, server_default=func.now())
    # ... other fields
```

### 3. Update Upload Endpoint

Ensure `/photo-library/upload` uses `upload_bytes_to_supabase()` exactly like `/evidence/upload`:

```python
@router.post("/upload")
async def upload_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Upload to Supabase
    supabase_path, supabase_url = await upload_bytes_to_supabase(
        file_bytes=await file.read(),
        filename=file.filename,
        folder="photo-library"
    )
    
    # Save to database
    photo = PhotoLibrary(
        teacher_id=current_user.id,
        filename=file.filename,
        supabase_path=supabase_path,
        supabase_url=supabase_url,  # ✅ Save Supabase URL
        # ... other fields
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    
    return {
        "id": photo.id,
        "filename": photo.filename,
        "supabase_path": photo.supabase_path,
        "supabase_url": photo.supabase_url,  # ✅ Return Supabase URL
        # ... other fields
    }
```

### 4. Migration Script (Optional)

If you prefer a Python migration script:

```python
from sqlalchemy import text
from app.database import engine

def add_supabase_columns():
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE photo_library 
            ADD COLUMN IF NOT EXISTS supabase_url TEXT;
        """))
        conn.execute(text("""
            ALTER TABLE photo_library 
            ADD COLUMN IF NOT EXISTS supabase_path TEXT;
        """))
        conn.commit()
        print("✅ Added supabase_url and supabase_path columns to photo_library table")
```

## Verification

After applying the migration:

1. Check the table structure:
   ```sql
   \d photo_library
   ```

2. Test the upload endpoint:
   ```bash
   curl -X POST "https://bhs-appraisal-backend-production.up.railway.app/photo-library/upload" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@test.jpg"
   ```

3. Verify the response includes `supabase_url`:
   ```json
   {
     "id": "...",
     "filename": "test.jpg",
     "supabase_path": "photo-library/...",
     "supabase_url": "https://...supabase.co/storage/v1/object/public/...",
     ...
   }
   ```

## Expected Result

- ✅ No more `UndefinedColumn` errors
- ✅ Photos upload successfully to Supabase
- ✅ `supabase_url` is saved to database
- ✅ Frontend receives `supabase_url` in response
- ✅ Photos display correctly using Supabase URLs




