from pydantic import BaseModel, conint, condecimal
from typing import List
from datetime import datetime

# For creating a user
class TokenPairCreate(BaseModel):
    email: str


class MatchProbability(BaseModel):
    team1: str
    team2: str
    match_type: str


class TokenPair(BaseModel):
    token: str
    user_id: int

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminStats(BaseModel):
    id: int
    net_profit: int
    total_users: int
    admin_username: str
    admin_password: str


class ResetPassword(BaseModel):
    token: str
    newPassword: str

class UserCreate(BaseModel):
    username: str
    password: str
    email: str

class LoginAcc(BaseModel):
    email: str
    password: str

class AddFriend(BaseModel):
    user_id: int
    friend_id: int

# For creating a match
class MatchCreate(BaseModel):
    team1: str
    team2: str
    team1_odds: str
    team2_odds: str
    match_type: str
    match_date: str


# For creating a prediction
class StraightBetCreate(BaseModel):
    user_id: int
    match_id: int
    winner_team: str
    wager: int
    odds: str

# Response model for User
class User(BaseModel):
    id: int
    username: str
    email: str
    friends: List[int] = []  # List of friend user IDs
    
    class Config:
        orm_mode = True

# Response model for Match
class Match(BaseModel):
    id: int
    match_type: str
    team1: str
    team2: str
    team1_odds: str
    team2_odds: str
    match_date: str
    result: str = "Pending"
    winner:int


    class Config:
        orm_mode = True


class SetWinner(BaseModel):
    match_id: int
    winner: int

# Response model for Prediction
class StraightBet(BaseModel):
    id: int
    user_id: int
    match_id: int
    winner_team: int
    wager:int
    odds: str
    payout: int
    status : str = "Pending"

    class Config:
        orm_mode = True


class ParlayBetCreate(BaseModel):
    match_id: int
    winner_team: str  # Ensure it's a positive integer (e.g., Team 1 or Team 2)
    odds: str  # American odds format (e.g., "+200" or "-150")

# Schema for creating a full parlay
class Parlay(BaseModel):
    user_id: int
    wager: int  # Must be greater than 0
    bets: List[ParlayBetCreate]  # A list of bets in the parlay


class CreateParlay(BaseModel):
    user_id: int
    wager: int
    odds: str
    bets: List[ParlayBetCreate]  # Return all bets inside the parlay

# Schema for returning an individual parlay bet
class ParlayBet(BaseModel):
    parlay_bet_id: int
    parlay_id: int # ID of the parlay this bet belongs to
    match_id: int
    winner_team: int  # Ensure it's a positive integer (e.g., Team 1 or Team 2)
    odds: str
    status: str  # "Pending", "Won", "Lost"

    class Config:
        orm_mode = True

# Schema for returning a full parlay
class ParlayResponse(BaseModel):
    parlay_id: int
    user_id: int
    wager: int
    potential_payout: int
    status: str  # "Pending", "Won", "Lost"
    bets: List[ParlayBet]  # Return all bets inside the parlay

    class Config:
        orm_mode = True

class MatchId(BaseModel):
    match_id: int

class UpdateUserBalance(BaseModel):
    user_id: int
    new_balance: int