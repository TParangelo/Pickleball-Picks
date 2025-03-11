from sqlalchemy import Table, Column, Integer, String, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from database import Base


friendship_table = Table(
    "friendships",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("friend_id", Integer, ForeignKey("users.id"), primary_key=True)
)

class AdminStats(Base):
    __tablename__ = "AdminStats"

    id = Column(Integer, primary_key=True, index=True)
    net_profit = Column(Integer)
    total_users = Column(Integer)
    admin_username = Column(String)
    admin_password = Column(String)

    
    

class TokenPair(Base):
    __tablename__ = "token_pairs"

    token = Column(String, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    email = Column(String, unique=True)

    balance = Column(Integer, default=10000)
    wins = Column(Integer, default = 0)
    losses = Column(Integer, default = 0)
    totalRisked = Column(Integer, default = 0)
    totalWon = Column(Integer, default = 0)


    straight_bets = relationship("StraightBet", back_populates="user")
    parlays = relationship("Parlay", back_populates="user")

    
    # Many-to-Many relationship for friends
    friends = relationship(
        "User",
        secondary=friendship_table,
        primaryjoin=id == friendship_table.c.user_id,
        secondaryjoin=id == friendship_table.c.friend_id,
        backref="added_by"
    )

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    match_type = Column(String)
    team1 = Column(String)
    team2 = Column(String)
    team1_odds = Column(String)
    team2_odds = Column(String)
    
    match_date = Column(String)


    result = Column(String, default="Pending")
    winner = Column(Integer)

    straight_bets = relationship("StraightBet", back_populates="match")
    parlay_bets = relationship("ParlayBet", back_populates="match")

class StraightBet(Base):
    __tablename__ = "straight_bet"

    bet_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    match_id = Column(Integer, ForeignKey("matches.id"))
    winner_team = Column(Integer)
    odds = Column(String)
    wager = Column(Integer)
    payout = Column(Integer)
    status = Column(String, default="Pending")

    user = relationship("User", back_populates="straight_bets")
    match = relationship("Match", back_populates="straight_bets")


class Parlay(Base):
    __tablename__ = "parlays"

    parlay_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    wager = Column(Integer, nullable=False)  # Total wagered amount
    payout = Column(Integer, nullable=False)  # Total potential payout
    status = Column(String, default="Pending")  # Pending, Won, Lost

    user = relationship("User", back_populates="parlays")
    parlay_bets = relationship("ParlayBet", back_populates="parlay")

class ParlayBet(Base):
    __tablename__ = "parlay_bets"

    parlay_bet_id = Column(Integer, primary_key=True, index=True)
    parlay_id = Column(Integer, ForeignKey("parlays.parlay_id"), nullable=False)
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False)
    winner_team = Column(Integer, nullable=False)  # Team chosen to win
    odds = Column(String, nullable=False)  # Odds format (e.g., +200 or -150)
    status = Column(String, default="Pending")  # Pending, Won, Lost

    parlay = relationship("Parlay", back_populates="parlay_bets")
    match = relationship("Match", back_populates="parlay_bets")