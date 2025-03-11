import requests
from bs4 import BeautifulSoup
import json, time
from datetime import datetime

now = datetime.now()
# URL for the DUPR rankings page (replace with the actual URL if necessary)

BASEURL = "https://pickleball.com"

urls = [
    ("https://pickleball.com/rankings?rank_by=rank&type=1&gender=F&week=2025-02-10&page=1&live=", "Women's Singles"),
    ("https://pickleball.com/rankings?rank_by=rank&type=4&gender=F&week=2025-02-10&page=1&live=", "Women's Doubles"),
    ("https://pickleball.com/rankings?rank_by=rank&type=3&gender=F&week=2025-02-10&page=1&live=", "Women's Mixed Doubles"),
    ("https://pickleball.com/rankings?rank_by=rank&type=2&gender=M&week=2025-02-10&page=1&live=", "Men's Singles"),
    ("https://pickleball.com/rankings?rank_by=rank&type=5&gender=M&week=2025-02-10&page=1&live=", "Men's Doubles"),
    ("https://pickleball.com/rankings?rank_by=rank&type=3&gender=M&week=2025-02-10&page=1&live=", "Men's Mixed Doubles"),
    ]

playerAppends = [
    "/stats?active_filter=doubles&show=ppa",
    "/stats?active_filter=mixed&show=ppa",
    "/stats?active_filter=singles&show=ppa",
]

def checkValidFloat(text):
    try:
        value = float(text)
    except:
        value = None
    return value


def checkValidInt(text):
    try:
        value = int(text)
    except:
        value = None
    return value

def scrapeProfile(playerSoup, mixedSoup, singlesSoup):

    try:
        statsTable = playerSoup.find('table', class_='w-full bg-white')
        ranks_points = statsTable.find_all('td', class_='border-t border-gray-200 p-2 font-semibold sm:p-6')
        ratings = statsTable.find_all('td', class_='border-t border-gray-200 bg-white p-2 font-semibold sm:p-6')


        doubles_rank = checkValidInt(ranks_points[0].text.strip('#'))
        doubles_points = checkValidFloat(ranks_points[1].text.strip().replace(",",""))
        doubles_rating = checkValidFloat(ratings[1].text.strip())

        mixed_rank = checkValidInt(ranks_points[2].text.strip('#'))
        mixed_points = checkValidFloat(ranks_points[3].text.strip().replace(",",""))

        singles_rank = checkValidInt(ranks_points[4].text.strip('#'))
        singles_points = checkValidFloat(ranks_points[5].text.strip().replace(",",""))
        singles_rating = checkValidFloat(ratings[-1].text.strip())
                                                                
        doublesTable = playerSoup.find('div', class_='flex size-full flex-col rounded-lg border bg-white px-4 shadow-md sm:h-[88px] sm:flex-row sm:justify-around sm:px-6 sm:py-2')
        doubles_record = doublesTable.find('div', class_="text-xl font-bold text-gray-900").text.strip()

        mixedTable = mixedSoup.find('div', class_='flex size-full flex-col rounded-lg border bg-white px-4 shadow-md sm:h-[88px] sm:flex-row sm:justify-around sm:px-6 sm:py-2')
        mixed_record = mixedTable.find('div', class_="text-xl font-bold text-gray-900").text.strip()

        singlesTable = singlesSoup.find('div', class_='flex size-full flex-col rounded-lg border bg-white px-4 shadow-md sm:h-[88px] sm:flex-row sm:justify-around sm:px-6 sm:py-2')
        singles_record = singlesTable.find('div', class_="text-xl font-bold text-gray-900").text.strip()


    except:
        statsTable = playerSoup.find('div', class_='mb-16 overflow-x-auto rounded-lg border border-gray-200')
        ranks_points = statsTable.find_all('td', class_='border-t border-gray-200 p-2 font-semibold sm:p-6')
        ratings = statsTable.find_all('td', class_='border-t border-gray-200 bg-white p-2 font-semibold sm:p-6')


        doubles_rank = checkValidInt(ranks_points[0].text.strip('#'))
        doubles_points = checkValidFloat(ranks_points[1].text.strip().replace(",",""))
        doubles_rating = checkValidFloat(ratings[1].text.strip())

        mixed_rank = checkValidInt(ranks_points[2].text.strip('#'))
        mixed_points = checkValidFloat(ranks_points[3].text.strip().replace(",",""))

        singles_rank = checkValidInt(ranks_points[4].text.strip('#'))
        singles_points = checkValidFloat(ranks_points[5].text.strip().replace(",",""))
        singles_rating = checkValidFloat(ratings[-1].text.strip())
                                                                
        doubles_record = None
        mixed_record = None
        singles_record = None

    playerData = {
        "doubles": {
        "rank": doubles_rank,
        "points" :  doubles_points,
        "rating" :  doubles_rating,
        "record": doubles_record,
        },

        "mixed" : {
        "rank" :  mixed_rank,
        "points" :  mixed_points,
        "record": mixed_record,
        },

        "singles" : {
        "rank" :  singles_rank,
        "points" :  singles_points,
        "rating" : singles_rating,
        "record": singles_record,
        }
    }
    return playerData







playersJSONfileWomen = {}
playersJSONfileMen = {}

with open("womenData.json", "r") as f:
    playersJSONfileWomen = json.load(f)



with open("menData.json", "r") as f:
    playersJSONfileMen = json.load(f)


playersSeen = set()
playersSeen.add("J. Kawamoto")
for key in playersJSONfileWomen:
    print(key)
    playersSeen.add(key)
for key in playersJSONfileMen:
    print(key)
    playersSeen.add(key)



#url = urls[0][0]
# Make a request to the website
def start():
    playerJSONfile = {}
    for url, disc in urls:

        url = urls[4][0]    #change what list to look through
        disc = urls[4][1]   

        time.sleep(.5)
        print(f"Making request: {url}")
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')

        tableEntries = soup.find_all('div', class_='container m-0 flex w-full items-center justify-between border-b border-gray-200 py-2 pl-3')
        count = 0
        for row in tableEntries:
            time.sleep(.5)

            names = row.find_all('p', class_='text-sm text-gray-900')
            name = f"{names[0].text.strip()} {names[1].text.strip()}"

            if not name in playersSeen:
                playersSeen.add(name)
                href = row.find('a', class_='flex w-2/5 items-center justify-start space-x-1 overflow-hidden rounded-full').get('href')
                print(href)

                print(f"Making request: {BASEURL}{href}{playerAppends[0]}")
                playerPage = requests.get(f"{BASEURL}{href}{playerAppends[0]}")
                playerSoup = BeautifulSoup(playerPage.text, 'html.parser')

                print(f"Making request: {BASEURL}{href}{playerAppends[1]}")
                mixedPage = requests.get(f"{BASEURL}{href}{playerAppends[1]}")
                mixedSoup = BeautifulSoup(mixedPage.text, 'html.parser')

                
                print(f"Making request: {BASEURL}{href}{playerAppends[2]}")
                singlesPage = requests.get(f"{BASEURL}{href}{playerAppends[2]}")
                singlesSoup = BeautifulSoup(singlesPage.text, 'html.parser')


                #print(playerSoup)
                data = scrapeProfile(playerSoup, mixedSoup, singlesSoup)
                player = {
                    "name": name,
                    "data": data
                    }
                if(disc.startswith("W")):
                    playersJSONfileWomen[name] = data
                if(disc.startswith("M")):
                    playersJSONfileMen[name] = data
                count+=1
                if(count > 3):
                    break



        break



start()

#print(json.dumps(playersJSONfileWomen, indent=4))

with open("womenData.json", "w") as f:
    json.dump(playersJSONfileWomen, f, indent=4)

with open("menData.json", "w") as f:
    json.dump(playersJSONfileMen, f, indent=4)
        
        

        


