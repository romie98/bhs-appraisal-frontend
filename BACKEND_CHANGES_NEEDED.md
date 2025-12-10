# Backend Changes Required

## 1. Update Auth Schemas

**File:** `app/modules/auth/schemas.py`

Update `UserSignup` schema to include `full_name`:

```python
class UserSignup(BaseModel):
    full_name: str
    email: EmailStr
    password: str
```

## 2. Update User Model

**File:** `app/modules/auth/models.py` (or wherever User model is defined)

Add `full_name` column to User model:

```python
class User(Base):
    # ... existing fields ...
    full_name = Column(String, nullable=False)
    # ... rest of fields ...
```

## 3. Update create_user() Function

**File:** `app/modules/auth/services.py` (or wherever user creation logic is)

Ensure `create_user()` saves `full_name`:

```python
def create_user(email: str, password: str, full_name: str):
    # ... existing code ...
    user = User(
        email=email,
        hashed_password=hashed_password,
        full_name=full_name  # Add this
    )
    # ... rest of code ...
```

## 4. Update Register Endpoint

**File:** `app/modules/auth/routes.py` (or wherever register endpoint is)

Update register endpoint to require all 3 fields:

```python
@router.post("/register", response_model=Token)
async def register(user_data: UserSignup):
    # user_data.full_name, user_data.email, user_data.password
    user = create_user(
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name
    )
    # ... rest of code ...
```

## Testing

After making these changes:

1. Test signup with: `{ "full_name": "John Doe", "email": "test@example.com", "password": "password123" }`
2. Verify user is created with full_name stored
3. Verify login works with the created user
4. Verify `/auth/me` returns user with full_name field










