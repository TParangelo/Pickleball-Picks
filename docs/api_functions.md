# API Functions Documentation

## Authentication Endpoints

### `POST /login`
Authenticates user and returns JWT token.
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "token": "string",
    "user": {
      "id": "integer",
      "username": "string",
      "email": "string"
    }
  }
  ```
- **Status Codes:**
  - 200: Success
  - 401: Invalid credentials

### `POST /add_user`
Creates new user account.
- **Request Body:**
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "id": "integer",
    "username": "string",
    "email": "string"
  }
  ```
- **Status Codes:**
  - 200: Success
  - 400: Invalid data/Username exists

## Match Endpoints

### `GET /all_matches`
Retrieves list of all matches.
- **Response:**
  ```json
  [
    {
      "id": "integer",
      "team1": "string",
      "team2": "string",
      "match_type": "string",
      "team1_odds": "float",
      "team2_odds": "float",
      "status": "string",
      "start_time": "string"
    }
  ]
  ```
- **Status Codes:**
  - 200: Success
  - 400: Error fetching games

## Betting Endpoints

### `POST /create_straight_pick`
Places a straight bet on a match.
- **Headers:**
  - `Authorization`: Bearer token
- **Request Body:**
  ```json
  {
    "match_id": "integer",
    "winner_team": "integer",
    "wager": "float"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Prediction added successfully!"
  }
  ```

### `POST /create_parlay`
Creates a parlay bet.
- **Headers:**
  - `Authorization`: Bearer token
- **Request Body:**
  ```json
  {
    "wager": "float",
    "bets": [
      {
        "match_id": "integer",
        "winner_team": "integer"
      }
    ]
  }
  ```
- **Response:**
  ```json
  {
    "message": "Prediction added successfully!"
  }
  ```

## User Endpoints

### `GET /users_bets`
Retrieves current user's betting history.
- **Headers:**
  - `Authorization`: Bearer token
- **Response:**
  ```json
  {
    "straight_bets": [
      {
        "id": "integer",
        "match": {
          "id": "integer",
          "team1": "string",
          "team2": "string"
        },
        "wager": "float",
        "odds": "float",
        "status": "string"
      }
    ],
    "parlays": [
      {
        "id": "integer",
        "wager": "float",
        "total_odds": "float",
        "status": "string",
        "bets": [
          {
            "match_id": "integer",
            "winner_team": "integer"
          }
        ]
      }
    ]
  }
  ```

### `GET /leaderboard`
Retrieves global leaderboard.
- **Response:**
  ```json
  [
    {
      "username": "string",
      "balance": "float",
    }
  ]
  ```

### `GET /leaderbaord_both`
Retrieves both global and friends leaderboard.
- **Headers:**
  - `Authorization`: Bearer token
- **Response:**
  ```json
  {
    "global": [
      {
        "username": "string",
        "total_won": "float",
        "win_rate": "float"
      }
    ],
    "friends": [
      {
        "username": "string",
        "total_won": "float",
        "win_rate": "float"
      }
    ]
  }
  ```

## Social Endpoints

### `POST /add_friend`
Adds a friend connection.
- **Headers:**
  - `Authorization`: Bearer token
- **Request Body:**
  ```json
  {
    "friend_id": "integer"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Friend added successfully!"
  }
  ```

### `POST /remove_friend`
Removes a friend connection.
- **Headers:**
  - `Authorization`: Bearer token
- **Request Body:**
  ```json
  {
    "friend_id": "integer"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Friend removed successfully!"
  }
  ```

### `GET /friends_list`
Retrieves user's friends list.
- **Headers:**
  - `Authorization`: Bearer token
- **Response:**
  ```json
  [
    {
      "id": "integer",
      "username": "string"
    }
  ]
  ```

### `GET /all_users/{search_param}`
Gets username and user_id for all users that start with {search_param}
- **Response:**
  ```json
  [
    {
      "id": "integer",
      "username": "string"
    }
  ]
  ```

## Admin Endpoints

### `POST /admin/login`
Admin authentication.
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "token": "string"
  }
  ```

### `POST /admin/create_match`
Creates a new match.
- **Headers:**
  - `Authorization`: Admin token
- **Request Body:**
  ```json
  {
    "team1": "string",
    "team2": "string",
    "match_type": "string",
    "start_time": "datetime",
    "team1_odds": "float",
    "team2_odds": "float"
  }
  ```

### `POST /admin/start_match`
Starts a match.
- **Headers:**
  - `Authorization`: Admin token
- **Request Body:**
  ```json
  {
    "match_id": "integer"
  }
  ```

### `POST /admin/set_winner`
Sets the winner of a match.
- **Headers:**
  - `Authorization`: Admin token
- **Request Body:**
  ```json
  {
    "match_id": "integer",
    "winner": "integer"
  }
  ```

### `DELETE /admin/delete_match/{match_id}`
Deletes a match.
- **Headers:**
  - `Authorization`: Admin token
- **Path Parameters:**
  - `match_id`: Match identifier

### `GET /admin/users`
Retrieves all users (admin only).
- **Headers:**
  - `Authorization`: Admin token
- **Response:**
  ```json
  [
    {
      "id": "integer",
      "username": "string",
      "email": "string",
      "balance": "int"
    }
  ]
  ```

### `POST /admin/update_balance`
Updates a user's balance.
- **Headers:**
  - `Authorization`: Admin token
- **Request Body:**
  ```json
  {
    "user_id": "integer",
    "new_balance": "float"
  }
  ```

