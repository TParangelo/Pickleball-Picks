from sqlalchemy.orm import Session
from sqlalchemy.sql import func, over
import models, schemas
import emailHandler as eH
from models import User, StraightBet, Match, ParlayBet, Parlay, friendship_table, TokenPair, AdminStats
import bcrypt
from auth import create_access_token
from datetime import datetime, timedelta
import secrets
from dotenv import load_dotenv
import os

load_dotenv()

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

CURRENT_URL = os.getenv("CURRENT_URL")


ACCESS_TOKEN_EXPIRE_MINUTES = 1000
multiplier = 2

EMAIL_SALT = os.getenv("EMAIL_SALT")




def decode_hash(hased_email: str):
    decoded_email = bcrypt.hashpw(hased_email.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    return decoded_email

def hash_password(plain_password: str) -> str:
    # Generate a salt and hash the password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(plain_password.encode('utf-8'), salt)
    return hashed_password.decode('utf-8')

ADMIN_PASSWORD_HASHED = hash_password(ADMIN_PASSWORD)

def hash_email(email: str) -> str:
    # Use constant salt for email hashing
    hashed_email = bcrypt.hashpw(email.encode('utf-8'), EMAIL_SALT)
    return hashed_email.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))



def initalize_admin(db: Session):
    admin = db.query(AdminStats).first()
    if admin is None:
        admin = models.AdminStats(net_profit=0, total_users=0, admin_username=ADMIN_USERNAME, admin_password=ADMIN_PASSWORD_HASHED)
        db.add(admin)
        db.commit()
    db.commit()


# Create a new user
def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = hash_password(user.password)
    hashed_email = hash_email(user.email)
    db_user = models.User(username=user.username, password=hashed_password, email=hashed_email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    userToRet = db.query(User).filter(User.email == db_user.email).first()
    if userToRet is None:
        return None
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
    data={"sub": user.email, "user_id": userToRet.id, "balance": userToRet.balance}, expires_delta=access_token_expires
    )
    userToRet_dict = userToRet.__dict__  # Convert user object to dictionary
    if "password" in userToRet_dict:
        del userToRet_dict["password"]  # Delete the password field
    if "email" in userToRet_dict:
        userToRet_dict["email"] = decode_hash(userToRet_dict["email"])
    ranks = get_user_rankings(db, userToRet.id)
    userToRet_dict["ranks"] = ranks
    admin = db.query(AdminStats).first()
    if admin is None:
        admin = models.AdminStats(net_profit=0, total_users=0, admin_username=ADMIN_USERNAME, admin_password=ADMIN_PASSWORD_HASHED)
        db.add(admin)
        db.commit()
    admin.total_users += 1
    db.commit()
    return {"access_token": access_token, "token_type": "bearer", "user": userToRet_dict, "message": f"Account Created! Welcome {userToRet.username}"}

def create_match(db: Session, match: schemas.MatchCreate):
    db_match = models.Match(team1=match.team1, team2=match.team2, team1_odds=match.team1_odds, team2_odds=match.team2_odds, match_date=match.match_date, match_type=match.match_type)
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match
 

def check_unique(db: Session, username: str, email: str):
    # Check if the username already exists
    user_by_username = db.query(User).filter(func.lower(User.username) == func.lower(username)).first()
    if user_by_username:
        return f"Username '{username}' is already taken."

    hashed_email = hash_email(email)
    user_by_email = db.query(User).filter(User.email == hashed_email).first()
    if user_by_email:
        return f"Email '{email}' already has an account."

    # If both are unique
    return None
    
def login(db: Session, email: str, password: str):
    hashed_email = hash_email(email)
    print(hashed_email)
    user = db.query(User).filter(User.email == hashed_email).first()
    if not user or not verify_password(password, user.password):
        return {"error": "Invalid credentials"}

    # Generate JWT Token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id, "balance": user.balance}, expires_delta=access_token_expires
    )

    ranks = get_user_rankings(db, user.id)

    user_temp = user.__dict__
    del user_temp["password"] 
    if "email" in user_temp:
        user_temp["email"] = decode_hash(user_temp["email"])
    user_temp["ranks"] = ranks
    return {"access_token": access_token, "token_type": "bearer", "user": user_temp, "message": f"Login successful! Welcome {user.username}"}

def american_to_decimal(odds: str) -> float:
    odds = int(odds)
    if odds > 0:
        return (odds / 100) + 1
    else:
        return (100 / abs(odds)) + 1

def calculate_parlay_payout(wager: int, odds_list: list):
    total_multiplier = 1
    for odds in odds_list:
        total_multiplier *= american_to_decimal(odds)
    
    potential_payout = wager * total_multiplier
    return int(potential_payout)

def clearParlay(db: Session, parlay: Parlay):
    parlayBets = db.query(ParlayBet).filter(ParlayBet.parlay_id == parlay.parlay_id).all()
    for bet in parlayBets:
        db.delete(bet)
    db.commit()
    db.delete(parlay)
    db.commit()

def add_Parlay(db: Session, parlayTicket: schemas.CreateParlay, id_match:int):

    user = db.query(User).filter(User.id == parlayTicket.user_id).first()
    if(parlayTicket.wager > user.balance):
        return "Can't wager more than balalce"
    if user.id != id_match:
        return "Not your account"


    db_parlay = models.Parlay(user_id=parlayTicket.user_id, wager=parlayTicket.wager, payout=0, status="Pending")
    db.add(db_parlay)
    db.commit()

    odds_list = []
    for bet in parlayTicket.bets:
        match = db.query(Match).filter(Match.id == bet.match_id).first()
        if not match:
            clearParlay(db, db_parlay)
            return "Match does not exist"
        if match.result != "Pending":
            clearParlay(db, db_parlay)
            return {"message": f"{match.team1} vs {match.team2} no longer taking wagers",
                "id": match.id
                }
        
        if match.team1 == bet.winner_team:
            winInt = 1
            odds = match.team1_odds
            odds_list.append(odds)
        else:
            winInt = 2
            odds = match.team2_odds
            odds_list.append(match.team2_odds)


        db_bet = models.ParlayBet(parlay_id=db_parlay.parlay_id, match_id=match.id, winner_team=winInt, odds=odds)
        db.add(db_bet)
        db.commit()

    admin = db.query(AdminStats).first()
    db_parlay.payout = calculate_parlay_payout(parlayTicket.wager, odds_list)
    user.balance -= parlayTicket.wager
    user.totalRisked += parlayTicket.wager

    admin.net_profit += parlayTicket.wager
    db.commit()

    return "Success"



def add_friend(db: Session, user_id_1: int, id2: str):
    user1 = db.query(User).filter(User.id == user_id_1).first()
    user2 = db.query(User).filter(User.id == id2).first()

    # Check if both users exist
    if not user1 or not user2:
        return "User doesn't exist"

    # Prevent adding yourself
    if user1.id == user2.id:
        return "Can't add yourself"

    # Check if they are already friends
    if user2 in user1.friends:
        return {"username": user2.username, "id": user2.id}

    # Add them as friends
    user1.friends.append(user2)
    db.commit()
    
    return {"username": user2.username, "id": user2.id}

def remove_friend(db: Session, user_id_1: int, id2: str):
    user1 = db.query(User).filter(User.id == user_id_1).first()
    user2 = db.query(User).filter(User.id == id2).first()

    # Check if both users exist
    if not user1 or not user2:
        return "User doesn't exist"

    # Prevent adding yourself
    if user1.id == user2.id:
        return "Can't add yourself"

    # Check if they are already friends
    if user2 not in user1.friends:
        return {"username": user2.username, "id": user2.id}

    # Add them as friends
    user1.friends.remove(user2)
    db.commit()
    
    return {"username": user2.username, "id": user2.id}

def get_friends_list(db: Session, user_id_1: int):
    # Query for friends where the user is either the 'user_id' or 'friend_id'
    friends_list = db.query(friendship_table.c.friend_id).filter(
        (friendship_table.c.user_id == user_id_1)
    ).all()

    # Extract friend IDs (since `friends_list` is a list of tuples)
    friend_ids = [friend[0] for friend in friends_list]

    # Fetch usernames for all friends in one query
    friends = db.query(User.id, User.username).filter(User.id.in_(friend_ids)).all()

    # Return the list of friends with their usernames
    return {"friends_list": [{"friend_id": friend.id, "friend_username": friend.username} for friend in friends]}

def get_all_users(db: Session, search_query:str):
    users = db.query(User).filter(func.lower(User.username).contains(func.lower(search_query))).all()
    return {"user_list": [{"user_id": user.id, "user_username": user.username} for user in users]}


def updateStraightBetStatus(db: Session, straightBets_list, winner: int):
    for bet in straightBets_list:
        if bet.winner_team == winner:
            bet.status = "won"

            user = db.query(User).filter(User.id == bet.user_id).first()
            if user:
                user.balance += (bet.payout)  # Give the user their payout
                user.totalWon += (bet.payout)  # Give the user their payout
                user.wins +=1
                admin = db.query(AdminStats).first()
                admin.net_profit -= bet.payout
                db.commit()
        else:
            bet.status = "lost"
            user = db.query(User).filter(User.id == bet.user_id).first()
            if user:
                user.losses +=1
        db.commit()

def updateParlayBetStatus(db: Session, parlayBets_list, winner: int):
    for parlayBet in parlayBets_list:
        parlay_ticket = db.query(Parlay).filter(Parlay.parlay_id == parlayBet.parlay_id).first()
        if parlayBet.winner_team == winner:
            parlayBet.status = "won"
        else:
            parlayBet.status = "lost"
            if parlay_ticket.status != "lost":
                user2 = db.query(User).filter(User.id == parlay_ticket.user_id).first()
                user2.losses+=1
            parlay_ticket.status = "lost"
        db.commit()
        if parlay_ticket.status == "Pending":
            allBets = db.query(ParlayBet).filter(ParlayBet.parlay_id == parlay_ticket.parlay_id).all()
            print(len(allBets))
            won = True
            for bet in allBets:
                print(bet)
                if bet.status == "Pending" or bet.status == "lost":
                    won = False
                    break
            if won:
                parlay_ticket.status = "won"
                print("Parlay Won")
                user = db.query(User).filter(User.id == parlay_ticket.user_id).first()
                user.balance += parlay_ticket.payout
                user.totalWon += parlay_ticket.payout
                user.wins += 1
                admin = db.query(AdminStats).first()
                admin.net_profit -= parlay_ticket.payout
                db.commit()
    db.commit()



def set_winner(db: Session, match_id: int, winner: int):



    match = db.query(Match).filter(Match.id == match_id).first()

    # If no match is found, return an error message
    if not match:
        return "Match not found."
    
    if match.result != "Started":
        return "Match already submitted."

    match.result = "Final"
    # Set the winner and commit the change
    match.winner = winner
    match.over = True
    db.commit()
    

    # Process each prediction and give payout if correct
    straightBets_list = db.query(StraightBet).filter(StraightBet.match_id == match.id).all()
    updateStraightBetStatus(db, straightBets_list, match.winner)
    
    parlayBets_list = db.query(ParlayBet).filter(ParlayBet.match_id == match.id).all()
    updateParlayBetStatus(db, parlayBets_list, match.winner)


    return "Success"





def add_StraightBet(db: Session, prediction: schemas.StraightBetCreate, id_match:int):
    user = db.query(User).filter(User.id == prediction.user_id).first()
    if user.id != id_match:
        return "Not your account"
    
    if(prediction.wager > user.balance):
        return "Can't wager more than balalce"
    
    match = db.query(Match).filter(Match.id == prediction.match_id).first()
    if not match:
        return "Match does not exist"
    if match.result != "Pending":
        return {"message": f"{match.team1} vs {match.team2} no longer taking wagers",
                "id": match.id
                }
    
    if match.team1 == prediction.winner_team:
        winInt = 1
    else:
        winInt = 2

    user.balance -= prediction.wager
    user.totalRisked += prediction.wager
    admin = db.query(AdminStats).first()
    admin.net_profit += prediction.wager
    if winInt == 1:
        odds = match.team1_odds
    else:
        odds = match.team2_odds

    if '-' in odds:
        betPayout = prediction.wager * (1+ (100) / int(odds[1:]))
    if '+' in odds:
        betPayout = prediction.wager * (1+ (int(odds[1:]) / 100))

    db_prediction = models.StraightBet(user_id=prediction.user_id, match_id=prediction.match_id, winner_team=winInt, wager=prediction.wager, odds=prediction.odds, payout=betPayout)
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    return "Success"


def get_leaderboard(db: Session):
    leaderboard = db.query(User.username, User.balance, User.id) \
                    .order_by(User.balance.desc()) \
                    .limit(10) \
                    .all()

    if not leaderboard:
        return {"error": "No users found"}

    global_l =  [{"username": user[0], "balance": user[1], "id": user[2]} for user in leaderboard]
    return {"global_l" : global_l}


def get_leaderboard_both(db:Session, user_id:int):
    global_leaderboard = db.query(User.username, User.balance, User.id) \
                    .order_by(User.balance.desc()) \
                    .limit(10) \
                    .all()

    if not global_leaderboard:
        return {"error": "No users found"}

    global_l = [{"username": user[0], "balance": user[1], "id": user[2]} for user in global_leaderboard]

    friends_ids = [friend_id for (friend_id,) in db.query(friendship_table.c.friend_id)
               .filter(friendship_table.c.user_id == user_id).all()]
    friends_ids.append(user_id)
    friend_users = db.query(User.id, User.username, User.balance).filter(User.id.in_(friends_ids)).order_by(User.balance.desc()).all()
    

    social_l = [{"username": user[1], "balance": user[2], "id": user[0]} for user in friend_users]

    return {"global_l" : global_l, "social_l":social_l}

def get_all_bets(db: Session, user_id: int):
    # Query for all straight bets
    straight_bets = db.query(StraightBet).filter(StraightBet.user_id == user_id).all()

    # Query for all parlays
    parlays = db.query(Parlay).filter(Parlay.user_id == user_id).all()
    for parlay in parlays:
        parlayBets = db.query(ParlayBet).filter(ParlayBet.parlay_id == parlay.parlay_id).all()
        parlay.parlayBets = parlayBets # Add the list of individual bets to the parlay

    # Return both straight bets and parlays
    return {
        "straight_bets": straight_bets,
        "parlays": parlays
    }


def all_matches(db: Session):
    matches = db.query(Match).all()
    if not matches:
        return "Error"
    return matches 


def get_user_rankings(db: Session, user_id):
    

    
    friends_ids = [friend_id for (friend_id,) in db.query(friendship_table.c.friend_id)
               .filter(friendship_table.c.user_id == user_id).all()]
    friends_ids.append(user_id)
    friend_users = db.query(User.id, User.username, User.balance).filter(User.id.in_(friends_ids)).all()
    sorted_friend_users = sorted(friend_users, key=lambda user: user.balance, reverse=True)

    
    rank = next((index + 1 for index, user in enumerate(sorted_friend_users) if user.id == user_id), None)





    
    global_rank_query = db.query(
        User.id,
        User.username,
        User.balance,
        over(func.rank(), order_by=User.balance.desc()).label("global_rank")
    ).subquery()





   
    global_rank = db.query(global_rank_query.c.global_rank)\
                    .filter(global_rank_query.c.id == user_id).scalar()
    

    return {
        "global_rank": global_rank,
        "friend_rank": rank,
    }


def reset_password_request(db: Session, email: str):
    hashed_email = hash_email(email)
    user = db.query(User).filter(User.email == hashed_email).first()
    if not user:
        return "Success"
    token = secrets.token_urlsafe(32)
    db_tokenPair = models.TokenPair(token=token, user_id=user.id)
    db.add(db_tokenPair)
    db.commit()
    db.refresh(db_tokenPair)
    eH.send_email(email, "Reset Password", f"{CURRENT_URL}/reset-password?token=" + db_tokenPair.token)
    return "Success"

def reset_password(db: Session, token: str, new_password: str):
    pair = db.query(TokenPair).filter(TokenPair.token == token).first()
    if not pair:
        return "Token not found"
    user = db.query(User).filter(User.id == pair.user_id).first()
    user.password = hash_password(new_password)
    print(f"Setting password for {user.username} to {new_password}")
    all_pairs = db.query(TokenPair).filter(TokenPair.user_id == user.id).all()
    for pair in all_pairs:
        db.delete(pair)
    db.commit()
    return "Success"

def get_user(db: Session, user_username: str):
    user = db.query(User).filter(User.username == user_username).first()
    if not user:
        return "Error"
    user_dict = user.__dict__
    del user_dict["password"]
    del user_dict["email"]
    return user_dict


def admin_login(db: Session, admin_username: str, admin_password: str):
    print(admin_username, admin_password)
    admin_acc = db.query(AdminStats).filter(AdminStats.admin_username == admin_username).first()
    print(admin_acc)
    if not admin_acc:
        return "Error"
    if not verify_password(admin_password, admin_acc.admin_password):
        return "Error"
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    jwt_token = create_access_token(data={"user_username": admin_username}, expires_delta=access_token_expires)
    admin_dict = admin_acc.__dict__
    del admin_dict["admin_password"]

    admin_dict["bet_count"] = db.query(StraightBet).count() + db.query(ParlayBet).count()
    admin_dict["total_users"] = db.query(User).count()

    return {"access_token": jwt_token, "admin": admin_dict, "token_type": "bearer"}


def start_match(db: Session, match_id: int):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        return "Error"
    match.result = "Started"
    db.commit()
    return "Success"


def delete_match(db: Session, match_id: int):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        return "Error"
    
    if match.result != "Final":
        return "Can only delete finished matches"

    # Delete associated straight bets
    db.query(StraightBet).filter(StraightBet.match_id == match_id).delete()
    
    # Get all parlay bets for this match
    parlay_bets = db.query(ParlayBet).filter(ParlayBet.match_id == match_id).all()
    
    # Get unique parlay IDs
    parlay_ids = [bet.parlay_id for bet in parlay_bets]
    
    # Delete the parlay bets for this match
    db.query(ParlayBet).filter(ParlayBet.match_id == match_id).delete()
    
    # Delete any parlays that now have no bets
    for parlay_id in parlay_ids:
        remaining_bets = db.query(ParlayBet).filter(ParlayBet.parlay_id == parlay_id).count()
        if remaining_bets == 0:
            db.query(Parlay).filter(Parlay.parlay_id == parlay_id).delete()
    
    db.commit()
    
    # Finally, delete the match
    db.delete(match)
    db.commit()
    return "Success"

def get_admin_users(db: Session):
    users = db.query(User).all()
    if not users:
        return "Error"
    return [{"id": user.id, "username": user.username, "balance": user.balance} for user in users]

def update_user_balance(db: Session, user_id: int, new_balance: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return "User not found"
    
    user.balance = new_balance
    db.commit()
    return "Success"


def round_to_nice_number(odds: float):
    """Round odds to the nearest multiple of 5."""
    return round(odds / 5) * 5

def calculate_odds(probability: float, rake: float = 4.5):
    """Convert probability to American odds with nice rounding (ending in 0 or 5)."""
    rake = 1 - (rake / 100)
    probability = probability * 100
    team1FairDecimal = 1 / (probability / 100);
    team2FairDecimal = 1 / ((100 - probability) / 100);

    team1DecimalOdds = 1 + ((team1FairDecimal - 1) * rake);
    team2DecimalOdds = 1 + ((team2FairDecimal - 1) * rake);

    if team1DecimalOdds < 2:
        team1AmericanOdds = round_to_nice_number(-100 / (team1DecimalOdds - 1))
    else:
        team1AmericanOdds = round_to_nice_number((team1DecimalOdds - 1) * 100)

    if team2DecimalOdds < 2:
        team2AmericanOdds = round_to_nice_number(-100 / (team2DecimalOdds - 1))
    else:
        team2AmericanOdds = round_to_nice_number((team2DecimalOdds - 1) * 100)

    return f"{team1AmericanOdds:+}, {team2AmericanOdds:+}"
        


def create_match_scraper(db: Session, match_data: dict):
    match = db.query(Match).filter(Match.team1 == match_data["team1"]).filter(Match.team2 == match_data["team2"]).filter(Match.result == "Pending").first()
    if match:
        return "Match already exists"
    odds = calculate_odds(match_data["probability"])
    odds = odds.split(", ")
    team1_odds = odds[0]
    team2_odds = odds[1]
    match = Match(team1=match_data["team1"], team2=match_data["team2"], team1_odds=team1_odds, team2_odds=team2_odds, result="Pending", match_type=match_data["match_type"])
    print(f"Match created: {match_data['team1']} vs {match_data['team2']} with odds {team1_odds} and {team2_odds}")
    db.add(match)
    db.commit()
    return "Success"

def set_started_scraper(db: Session, match_data: dict):
    match = db.query(Match).filter(Match.team1 == match_data["team1"]).filter(Match.team2 == match_data["team2"]).filter(Match.result == "Pending").first()
    if not match:
        print(f"Match not found to start: {match_data['team1']} vs {match_data['team2']}")
        return "Match not found"
    print(f"Match starting: {match_data['team1']} vs {match_data['team2']}")
    match.result = "Started"
    db.commit()
    return "Success"

def set_winner_scraper(db: Session, match_data: dict, winner: str):
    match = db.query(Match).filter(Match.team1 == match_data["team1"]).filter(Match.team2 == match_data["team2"]).filter(Match.result == "Started").first()
    if not match:
        return "Match not found"
    print(f"Match finished: {match_data['team1']} vs {match_data['team2']} with winner {winner}")
    match.result = "Final"
    match.winner = winner

    straightBets_list = db.query(StraightBet).filter(StraightBet.match_id == match.id).all()
    updateStraightBetStatus(db, straightBets_list, match.winner)
    
    parlayBets_list = db.query(ParlayBet).filter(ParlayBet.match_id == match.id).all()
    updateParlayBetStatus(db, parlayBets_list, match.winner)

    db.commit()
    return "Success"
