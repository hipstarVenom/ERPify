# app/routes/user.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import SessionLocal
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from fastapi import Body


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 🔹 POST - Create User
@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    user_data = user.model_dump()
    
    # Auto-generate if missing (fixes admin forms that don't have these fields)
    if not user_data.get("email"):
        import uuid
        user_data["email"] = f"{user.first_name.lower()}.{user.last_name.lower()}.{uuid.uuid4().hex[:4]}@erpify.com"
    if not user_data.get("password_hash"):
        user_data["password_hash"] = "erp123" # Default password
        
    new_user = User(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# 🔹 GET - Get All Users
@router.get("/", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()


# 🔹 GET - Get User By ID
@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# 🔹 POST - Login (email + password)
@router.post("/login", response_model=UserResponse)
def login_user(
    email: str = Body(...),
    password: str = Body(...),
    db: Session = Depends(get_db)
):
    # Find user by email
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Direct comparison (plain text stored in DB)
    # TODO: switch to bcrypt.checkpw() once passwords are hashed
    if user.password_hash != password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return user