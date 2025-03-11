import json


playersJSONfileWomen = {}
playersJSONfileMen = {}
with open("pickleScrapePlayers/womenData.json", "r") as f:
    playersJSONfileWomen = json.load(f)

with open("pickleScrapePlayers/menData.json", "r") as f:
    playersJSONfileMen = json.load(f)

mixedDoubles = {}
womenDoubles = {}
womenSingles = {}
menDoubles = {}
menSingles = {}
with open("pickleScrapeMatches/matches/mixedDoubles.json", "r") as f:
    mixedDoubles = json.load(f)
with open("pickleScrapeMatches/matches/womenDoubles.json", "r") as f:
    womenDoubles = json.load(f)
with open("pickleScrapeMatches/matches/womenSingles.json", "r") as f:
    womenSingles = json.load(f)
with open("pickleScrapeMatches/matches/menDoubles.json", "r") as f:
    menDoubles = json.load(f)
with open("pickleScrapeMatches/matches/menSingles.json", "r") as f:
    menSingles = json.load(f)

def fixName(name):
    toks = name.split()
    first = toks[-1]
    last = toks[0]
    newName = f"{first[0]}. {last}"
    
    if newName == "A. Leigh":
        newName = "A. Waters"
    if newName == "H. Tyra":
        newName = "T. Black"
    if newName == "J. Martinez":
        newName = "J. Vich"

    return newName


def addDUPR(matchesFile):
    curFile = {}
    for key, value in matchesFile.items():
        team1Reversed = value["team1"]
        team2Reversed = value["team2"]
        team1 = []
        team2 = []
        for player in team1Reversed:
            toks = player.split()
            name = f"{toks[1]} {toks[0]}"
            team1.append(name)
        for player in team2Reversed:
            toks = player.split()
            name = f"{toks[1]} {toks[0]}"
            team2.append(name)
        print(f"t1: {team1} \t t2: {team2}")

        team1Stats = {}
        team2Stats = {}
        for player in team1:
            if '.' not in player and "Kawamoto" not in player:
                player = fixName(player)
            playerData = playersJSONfileMen.get(player)
            if not playerData:
                playerData = playersJSONfileWomen.get(player)
            elif not playerData:
                print(f"Player {player} not in database")
                continue
            team1Stats[player] = playerData

        for player in team2 :
            if '.' not in player and "Kawamoto" not in player:
                player = fixName(player)
            playerData = playersJSONfileMen.get(player)
            if not playerData:
                playerData = playersJSONfileWomen.get(player)
            elif not playerData:
                print(f"Player {player} not in database")
                continue
            team2Stats[player] = playerData

        #print(json.dumps(team1Stats, indent=4))
        #print(json.dumps(team2Stats, indent=4))
        curFile[key] = {
                "matchType": value["matchType"],
                "date": value["date"],
                "round": value["round"],
                "winner": value["winner"],
                "totalGames": value["totalSets"],
                "team1": team1Stats,
                "team2": team2Stats,
                "setsWon": value["setsWon"],
                "gamesScore": value["gamesScore"]
            }
        #print(json.dumps(curFile, indent=4))
    return curFile

curFile = addDUPR(womenDoubles)
with open("prevMatches/womenDoubles.json", "w") as f:
    json.dump(curFile, f, indent=4)