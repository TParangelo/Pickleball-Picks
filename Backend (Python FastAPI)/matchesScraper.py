from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time
import json
import crud, database
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../matches-maintainer')))
import matchHandler
import database
from sqlalchemy.orm import Session







match_types = {
    "Mixed Doubles": "tab-button-4",
    "Women's Doubles": "tab-button-0",
    "Men's Doubles": "tab-button-2",
    "Women's Singles": "tab-button-7",
    "Men's Singles": "tab-button-9",
}

grid_ids = {
    "Mixed Doubles": "tab-panel-4",
    "Women's Doubles": "tab-panel-0",
    "Men's Doubles": "tab-panel-2",
    "Women's Singles": "tab-panel-7",
    "Men's Singles": "tab-panel-9",
}



def format_name(name):
    """Formats a player's name as 'F. Lastname' or a doubles team as 'F. Lastname / F. Lastname'."""
    if "/" in name:  # Handle doubles teams
        players = name.split("/")
        formatted_players = []
        for player in players:
            player = player.strip()
            if "Kawamoto" in player:
                formatted_players.append(player)
            elif player == "JW Johnson" or player == "Jorja Johnson":
                if player == "JW Johnson":
                    formatted_players.append("JW. Johnson")
                else:
                    formatted_players.append("Jo. Johnson")
            else:
                parts = player.strip().split()
                if len(parts) >= 2:  # Ensure first and last name exist
                    formatted_players.append(parts[0][0] + ". " + parts[-1])
                else:
                    formatted_players.append(parts[0])  
        return " / ".join(formatted_players)
    else:  # Handle single players
        parts = name.strip().split()
        if len(parts) >= 2:
            return parts[0][0] + ". " + parts[-1]
        return parts[0]  # Handle cases where there's only one name

def format_names(name1, name2):
    return [format_name(name1), format_name(name2)]
    




def process_match(match):
    
        teams_info = match.find_all('div', {'class': 'tournament-single__scores-match-team'})
        team1 = teams_info[0].find('div', {'class': 'tournament-single__scores-match-team-athletes typo-body typo-body--medium'}).text.strip()
        team1_scores_elements = teams_info[0].find_all('span', {'class': 'tournament-single__scores-match-team-score'})
        team1_scores = []
        for score in team1_scores_elements:
            team1_scores.append(score.text.strip())
        team2 = teams_info[1].find('div', {'class': 'tournament-single__scores-match-team-athletes typo-body typo-body--medium'}).text.strip()
        team2_scores_elements = teams_info[1].find_all('span', {'class': 'tournament-single__scores-match-team-score'})
        team2_scores = []
        for score in team2_scores_elements:
            team2_scores.append(score.text.strip())

        game_scores = []
        for i in range(len(team1_scores)):
            game_scores.append(team1_scores[i] + "-" + team2_scores[i])
        return {
            "team1": team1,
            "team2": team2,
            "game_scores": game_scores
        }
    

def find_result(match_data):
    if match_data["game_scores"][0] == "0-0":
        return "Pending", None

    team1_wins = 0
    team2_wins = 0
    total_games = len(match_data["game_scores"])
    first_to = total_games // 2 + 1  # Best of 3 or 5

    for score in match_data["game_scores"]:
        team1_score, team2_score = map(int, score.split("-"))

        # If a game is incomplete (both scores < 11), match is still ongoing
        if team1_score < 11 and team2_score < 11:
            return "Started", None  

        # Check if there's a valid win (win by 2)
        if team1_score >= 11 or team2_score >= 11:
            if team1_score >= team2_score + 2:
                team1_wins += 1
            elif team2_score >= team1_score + 2:
                team2_wins += 1
            else:
                return "Started", None  

        # Check if the match is over
        if team1_wins == first_to:
            return "Final", match_data["team1"]
        elif team2_wins == first_to:
            return "Final", match_data["team2"]

    return "Started", None  # Only return "Started" after processing all scores
            
        
        

def scrape_matches(match_type, db):
    driver = webdriver.Chrome()  
    driver.get(CURRENT_TOURNAMENT_URL)
    try:
        #accept cookies
        wait = WebDriverWait(driver, 10)
        cookies = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Accept']")))
        cookies.click()

        # Wait for the scores tab to be visible
        
        button = wait.until(EC.element_to_be_clickable((By.ID, match_types[match_type])))
        ActionChains(driver).move_to_element(button).perform()
        button.click()
        # Click on the scores tab

        # Wait for the scores to load
        time.sleep(2)

        # Get the page source after the scores are loaded
        page_source = driver.page_source
        soup = BeautifulSoup(page_source, "html.parser")

        # Find all matches
        current_match_type = soup.find('div', {'class': 'tournament-single__scores-event', 'id': grid_ids[match_type]})

        matches = current_match_type.find_all('div', {'class': 'tournament-single__scores-match-main'})

        for match in matches:
            match_data = process_match(match)
            if "TBD" in match_data["team1"] or "TBD" in match_data["team2"]:
                continue
            cur_result, winner = find_result(match_data)
            #print(f"{match_data['team1']} vs {match_data['team2']} - {cur_result} {winner}")
            fromated_names = format_names(match_data["team1"], match_data["team2"])
            if cur_result == "Pending":
                
                #print(fromated_names)
                suggested_odds = matchHandler.calculate_win_probability(fromated_names[0], fromated_names[1], match_type.replace("'", ""))
                if suggested_odds is None:
                    continue
                to_create = {
                    "team1": fromated_names[0],
                    "team2": fromated_names[1],
                    "match_type": match_type.replace("'", ""),
                    "probability": suggested_odds["probability"]
                }
                result = crud.create_match_scraper(db, to_create)

            if cur_result == "Started":
                to_create = {
                    "team1": fromated_names[0],
                    "team2": fromated_names[1],
                    "match_type": match_type.replace("'", ""),
                }
                crud.set_started_scraper(db, to_create)

            if cur_result == "Final":
                to_create = {
                    "team1": fromated_names[0],
                    "team2": fromated_names[1],
                    "match_type": match_type.replace("'", ""),
                }
                if winner == match_data["team1"]:
                    win_team = 1
                else:
                    win_team = 2
                crud.set_winner_scraper(db, to_create, win_team)
                




    except Exception as e:
        print(f"An error occurred: {e}")

    driver.quit()
    return "Success"





