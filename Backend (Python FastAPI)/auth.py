from datetime import datetime, timedelta
from fastapi import HTTPException, status
from jose import jwt, JWTError
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
import models, schemas, crud, database
import os
from dotenv import load_dotenv

load_dotenv()

# Secret key and algorithm
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")


def create_access_token(data: dict, expires_delta: timedelta = None):
    """Generates a JWT token."""
    to_encode = data.copy()
    expire = datetime.now() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


    
def verify_token(token: str, db: Session):
    try:
        # Decode the JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer exists")
        temp_user = user.__dict__
        del temp_user["password"]  # Remove password from user object
        ranks = crud.get_user_rankings(db, user.id)
        temp_user["ranks"] = ranks
        return { "isValid": True, "user": temp_user, "token":token };  # Return user if token is valid

    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token or expired")

def verify_token_admin(token: str, db: Session):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_username")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user = db.query(models.AdminStats).filter(models.AdminStats.admin_username == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer exists")
        return user
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token or expired")
