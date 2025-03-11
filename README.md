# Pickleball-Picks 🏓

A modern virtual betting platform for pickleball matches, featuring real-time odds, ML-powered predictions, and social features. Website can be found at:
https://www.Pickleball-picks.com

## Overview

Pickleball-Picks is a full-stack application that allows users to make virtual predictions on professional pickleball matches. The platform integrates with the PPA (Professional Pickleball Association) website to provide real-time match data and uses machine learning models to calculate odds. Check out the mermaid diagram [HERE](./project_flow.md) to see how everything is connected

## Features

### For Users
- View and bet on live pickleball matches
- Place straight bets and parlays
- Track betting history and balance
- Connect with friends and view leaderboards
- Real-time match updates and odds

### For Administrators
- Create and manage matches
- Set match winners and process bets
- Monitor user activity and statistics
- Manage user accounts and permissions

## Tech Stack

### Frontend
- React 18
- React Router v6
- JWT authentication
- React Query for real-time updates
- Responsive design (Desktop & Mobile)

### Backend
- FastAPI with async support
- SQLAlchemy ORM
- Pydantic for validation
- APScheduler for tasks
- BeautifulSoup4 for web scraping
- Mangum for AWS Lambda compatibility

### Database
- AWS RDS PostgreSQL
- SQLAlchemy migrations
- Transaction management
- Optimized indexing

### Machine Learning
- Scikit-learn Random Forest and Linear Regression
- Voting based results to optimize results
- Separate models for singles, doubles, and mixed matches
- MongoDB for player statistics
- Custom feature engineering
- 80% accuracy on test data

### Infrastructure
- Frontend: Netlify
- Backend API: Render
- Database: AWS RDS
- Ubuntu local server for timed automation tasks

## Security

- JWT-based authentication
- IP-based rate limiting
- Password hashing with bcrypt
- AWS RDS encryption
- CORS policy configuration
- Environment variable protection
- Regular security updates




## Project Structure

```
Pickleball-Picks/
├── frontend/           # React frontend application
├── backend/           # FastAPI backend application
└── data/             # Data on players stats
```


