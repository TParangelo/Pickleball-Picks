from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()



TEST_LOCAL = os.getenv("TEST_LOCAL")
if TEST_LOCAL:
    pswd = os.getenv("DB_PASSWORD")
    db_user = os.getenv("DB_USER")
    SQLALCHEMY_DATABASE_URL = f"postgresql://{db_user}:{pswd}@localhost/pickleball_db"  
else:
    SQLALCHEMY_DATABASE_URL = os.getenv("AWS_DATABASE_URL")


engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Create the database tables (if they don't already exist)
def init_db():
    Base.metadata.create_all(bind=engine)

def get_Base():
    return Base
def get_engine():
    return engine


