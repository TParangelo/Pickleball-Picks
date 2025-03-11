# Database Schema Documentation

## Core Tables

### Users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    balance INTEGER DEFAULT 10000,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    totalRisked INTEGER DEFAULT 0,
    totalWon INTEGER DEFAULT 0
);
```

### Matches
```sql
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    match_type VARCHAR(50) NOT NULL,
    team1 VARCHAR(100) NOT NULL,
    team2 VARCHAR(100) NOT NULL,
    team1_odds VARCHAR(20),
    team2_odds VARCHAR(20),
    match_date VARCHAR(50),
    result VARCHAR(20) DEFAULT 'Pending',
    winner INTEGER
);
```

## Betting Tables

### StraightBet
```sql
CREATE TABLE straight_bet (
    bet_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    match_id INTEGER REFERENCES matches(id),
    winner_team INTEGER NOT NULL,
    odds VARCHAR(20) NOT NULL,
    wager INTEGER NOT NULL,
    payout INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending'
);
```

### Parlays
```sql
CREATE TABLE parlays (
    parlay_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    wager INTEGER NOT NULL,
    payout INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending'
);
```

### ParlayBets
```sql
CREATE TABLE parlay_bets (
    parlay_bet_id SERIAL PRIMARY KEY,
    parlay_id INTEGER REFERENCES parlays(parlay_id) NOT NULL,
    match_id INTEGER REFERENCES matches(id) NOT NULL,
    winner_team INTEGER NOT NULL,
    odds VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending'
);
```

## Social Tables

### Friendships
```sql
CREATE TABLE friendships (
    user_id INTEGER REFERENCES users(id),
    friend_id INTEGER REFERENCES users(id),
    PRIMARY KEY (user_id, friend_id)
);
```

## Admin Tables

### AdminStats
```sql
CREATE TABLE AdminStats (
    id SERIAL PRIMARY KEY,
    net_profit INTEGER,
    total_users INTEGER,
    admin_username VARCHAR(50),
    admin_password VARCHAR(255)
);
```

### TokenPairs
```sql
CREATE TABLE token_pairs (
    token VARCHAR(255) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id)
);
```

## Relationships

### User Relationships
- One-to-Many with `straight_bet` (user -> straight_bets)
- One-to-Many with `parlays` (user -> parlays)
- Many-to-Many with `users` through `friendships` (user -> friends)

### Match Relationships
- One-to-Many with `straight_bet` (match -> straight_bets)
- One-to-Many with `parlay_bets` (match -> parlay_bets)

### Parlay Relationships
- One-to-Many with `parlay_bets` (parlay -> parlay_bets)
- Many-to-One with `users` (parlay -> user)

## Indexes

```sql
-- Users indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Matches indexes
CREATE INDEX idx_matches_type ON matches(match_type);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_status ON matches(result);

-- Bets indexes
CREATE INDEX idx_straight_bet_user ON straight_bet(user_id);
CREATE INDEX idx_straight_bet_match ON straight_bet(match_id);
CREATE INDEX idx_straight_bet_status ON straight_bet(status);

-- Parlays indexes
CREATE INDEX idx_parlays_user ON parlays(user_id);
CREATE INDEX idx_parlays_status ON parlays(status);

-- Parlay bets indexes
CREATE INDEX idx_parlay_bets_parlay ON parlay_bets(parlay_id);
CREATE INDEX idx_parlay_bets_match ON parlay_bets(match_id);
CREATE INDEX idx_parlay_bets_status ON parlay_bets(status);
```