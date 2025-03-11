from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, crud, database
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordBearer
from auth import verify_token, verify_token_admin
from models import Match
from mangum import Mangum
import json
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../matches-maintainer')))
import matchHandler
from matchesScraper import scrape_matches
from apscheduler.schedulers.background import BackgroundScheduler


# Create the FastAPI app
app = FastAPI()
handler = Mangum(app)

scheduler = BackgroundScheduler()







app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from specified origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)




database.init_db()
Base = database.get_Base()
engine = database.get_engine()

# Dependency to get the database session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()



scrape_all_matches = False
single_scrape = ["Men's_Doubles", "Women's_Doubles"]
WAIT_TIME = 3 # minutes
def scrape_periodically():
    match_types = ["Men's_Singles", "Women's_Singles", "Men's_Doubles", "Women's_Doubles", "Mixed_Doubles"]  # Adjust based on your match types

    db = database.SessionLocal()

    if scrape_all_matches:
        for match_type in match_types:
            print(f"Scraping {match_type}")
            web_scraper(match_type, db)
    else:
        for match_type in single_scrape:
            print(f"Scraping {match_type}")
            web_scraper(match_type, db)

    print("Scraping complete")
    db.close()


scheduler.add_job(scrape_periodically, "interval", minutes=WAIT_TIME)
scheduler.start()




oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Security(oauth2_scheme)):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token or expired")
    return payload



# @app.get("/")
# def read_root():
#     return "Hello World"

 
@app.post("/add_user/")
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    check = crud.check_unique(db, user.username, user.email)
    if check:
        raise HTTPException(status_code=400, detail=check)

    result = crud.create_user(db, user)
    if not result:
        raise HTTPException(status_code=500, detail="Couldn't create account")

    return result


@app.post("/login/")
def login(user: schemas.LoginAcc, db: Session = Depends(get_db)):
    result = crud.login(db, user.email, user.password)
    if result == {"error": "Invalid credentials"}:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    return result


@app.post("/add_friend/")
async def add_friend(friend_data: schemas.AddFriend, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    user = verify_token(token, db)  # Verify token and fetch user
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    result = crud.add_friend(db, user["user"]["id"], friend_data.friend_id)
    if type(result) == str:
        raise HTTPException(status_code=400, detail=result)
    return {"message": "Friend added successfully!"}


@app.post("/remove_friend/")
async def remove_friend(friend_data: schemas.AddFriend, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    user = verify_token(token, db)  # Verify token and fetch user
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    result = crud.remove_friend(db, user["user"]["id"], friend_data.friend_id)
    if type(result) == str:
        raise HTTPException(status_code=400, detail=result)
    return {"message": "Friend removed successfully!"}




@app.post("/create_straight_pick/")
def create_prediction(prediction: schemas.StraightBetCreate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    user = verify_token(token, db)  # Verify token and fetch user
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    result = crud.add_StraightBet(db, prediction, user["user"]["id"])
    if result != "Success":
        raise HTTPException(status_code=400, detail=result)
    
    return {"message": "Prediction added successfully!"}

@app.post("/create_parlay/")
def create_parlay(parlayTicket: schemas.CreateParlay, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    user = verify_token(token, db)  # Verify token and fetch user
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    result = crud.add_Parlay(db, parlayTicket, user["user"]["id"])
    if result != "Success":
        raise HTTPException(status_code=400, detail=result)
    
    return {"message": "Prediction added successfully!"}



@app.get("/all_matches/")
async def get_matches(db: Session = Depends(get_db)):
    result = crud.all_matches(db)
    if result == "Error":
        raise HTTPException(status_code=400, detail="Error Fetching Games")
    
    return result





@app.get("/leaderboard/")
def get_leaderboard(db: Session = Depends(get_db)):
    result = crud.get_leaderboard(db)
    if result == "Error":
        raise HTTPException(status_code=400, detail="Error Fetching Leaderboard")
    
    return result

@app.get("/leaderbaord_both/")
async def get_leaderboard_both(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    user = verify_token(token, db)
    if not user:
         raise HTTPException(status_code=401, detail="Unauthorized")
    message = crud.get_leaderboard_both(db, user["user"]["id"])
    if message == "Error":
        raise HTTPException(status_code=400, detail="Error fetching your bets")
    return message


@app.get("/friends_list/")
async def get_freinds_list(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    user = verify_token(token, db)
    if not user:
         raise HTTPException(status_code=401, detail="Unauthorized")
    message = crud.get_friends_list(db, user["user"]["id"])
    if message == "Error":
        raise HTTPException(status_code=400, detail="Error fetching your bets")
    return message

@app.post("/validate-token/")
async def verify_token_route(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    # Token is passed via the Authorization header as Bearer token
    user = verify_token(token, db)
    return user

@app.get("/users_bets/")
async def get_users_bets(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    user = verify_token(token, db)
    if not user:
         raise HTTPException(status_code=401, detail="Unauthorized")
    message = crud.get_all_bets(db, user["user"]["id"])
    if message == "Error":
        raise HTTPException(status_code=400, detail="Error fetching your bets")
    return message
    
@app.get("/all_users/{search_query}/")
async def get_all_users(search_query: str, db: Session = Depends(get_db)):
    users = crud.get_all_users(db, search_query)
    return users

@app.post("/auth/reset-password-request")
async def reset_password_request(email_data: schemas.TokenPairCreate, db: Session = Depends(get_db)):
    result = crud.reset_password_request(db, email_data.email)
    if result != "Success":
        raise HTTPException(status_code=400, detail=result)
    return {"message": "Reset password email sent successfully!"}

@app.post("/auth/reset-password")
async def reset_password(reset_data: schemas.ResetPassword, db: Session = Depends(get_db)):
    result = crud.reset_password(db, reset_data.token, reset_data.newPassword)
    if result != "Success":
        raise HTTPException(status_code=400, detail=result)
    return {"message": "Password reset successfully!"}

@app.get("/user/{user_username}/")
async def get_user(user_username: str, db: Session = Depends(get_db)):
    result = crud.get_user(db, user_username)
    if result == "Error":
        raise HTTPException(status_code=400, detail="Error fetching user")
    return result

@app.post("/admin/login")
async def admin_login(admin_data: schemas.AdminLogin, db: Session = Depends(get_db)):
    if not admin_data.username or not admin_data.password:
        raise HTTPException(status_code=400, detail="Invalid Credentials")
    if " " in admin_data.username or " " in admin_data.password:
        raise HTTPException(status_code=400, detail="Invalid Credentials")
    if "/" in admin_data.username or "/" in admin_data.password:
        raise HTTPException(status_code=400, detail="Invalid Credentials")
    result = crud.admin_login(db, admin_data.username, admin_data.password)
    if result == "Error":
        raise HTTPException(status_code=400, detail="Invalid Credentials")
    return result

@app.post("/admin/create_match")
def create_match(match: schemas.MatchCreate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    user = verify_token_admin(token, db)
    if not user:
         raise HTTPException(status_code=401, detail="Unauthorized")
    result = crud.create_match(db, match)
    if result == "Error":
        raise HTTPException(status_code=400, detail="Error Inputing Games")
    return result

@app.post("/admin/start_match")
def start_match(match_data: schemas.MatchId, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    user = verify_token_admin(token, db)
    if not user:
         raise HTTPException(status_code=401, detail="Unauthorized")
    result = crud.start_match(db, match_data.match_id)
    if result == "Error":
        raise HTTPException(status_code=400, detail="Error Starting Match")
    return result

@app.post("/admin/set_winner")
def set_winner(match_data: schemas.SetWinner, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    user = verify_token_admin(token, db)
    if not user:
         raise HTTPException(status_code=401, detail="Unauthorized")
    result = crud.set_winner(db, match_data.match_id, match_data.winner)
    if result != "Success":
        raise HTTPException(status_code=400, detail=result)
    return {"message": "Winner set successfully!"}

@app.delete("/admin/delete_match/{match_id}")
def delete_match(match_id: int, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    user = verify_token_admin(token, db)
    if not user:
         raise HTTPException(status_code=401, detail="Unauthorized")
    result = crud.delete_match(db, match_id)
    if result != "Success":
        raise HTTPException(status_code=400, detail=result)
    return {"message": "Match deleted successfully!"}

@app.get("/admin/users")
def get_admin_users(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    user = verify_token_admin(token, db)
    if not user:
         raise HTTPException(status_code=401, detail="Unauthorized")
    result = crud.get_admin_users(db)
    if result == "Error":
        raise HTTPException(status_code=400, detail="Error fetching users")
    return result

@app.post("/admin/update_balance")
def update_user_balance(user_data: schemas.UpdateUserBalance, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    user = verify_token_admin(token, db)
    if not user:
         raise HTTPException(status_code=401, detail="Unauthorized")
    result = crud.update_user_balance(db, user_data.user_id, user_data.new_balance)
    if result != "Success":
        raise HTTPException(status_code=400, detail=result)
    return {"message": "User balance updated successfully!"}


@app.post("/admin/match_probability_helper/")
async def get_match_probability(match_data: schemas.MatchProbability, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    user = verify_token_admin(token, db)
    if not user:
         raise HTTPException(status_code=401, detail="Unauthorized")
    result = matchHandler.calculate_win_probability(match_data.team1, match_data.team2, match_data.match_type)
    if result == "Error":
        raise HTTPException(status_code=400, detail="Error Calculating Probability")
    return result

@app.get("/admin/all_players/")
async def get_all_players(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    user = verify_token_admin(token, db)
    if not user:
         raise HTTPException(status_code=401, detail="Unauthorized")
    with open("playersData/menData.json", "r") as f:
        men_data = json.load(f)
    with open("playersData/womenData.json", "r") as f:
        women_data = json.load(f)

    player_names = []
    for player in men_data:
        player_names.append(player)
    for player in women_data:
        player_names.append(player)
    return player_names
    



@app.get("/web_scraper/{match_type}")
def web_scraper(match_type: str, db: Session = Depends(get_db)):
    match_type = match_type.replace("_", " ")
    return scrape_matches(match_type, db)
