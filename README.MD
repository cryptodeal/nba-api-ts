
# NBA-API-TS

## Project Info:

Backend data aggregation, storage, and manipulation for basketball statistics (NBA, ABA, BAA) collected from varying authorities (e.g. [Basketball Reference](https://www.basketball-reference.com), [NBA Stats API](https://www.nba.com/stats/), [ESPN](https://www.espn.com/nba/), etc.)  

Data is aggregated from these sources, looking first to [BasketBall Reference](https://www.basketball-reference.com) as the authority on historical data, and then written to varying mongodb collections, which comprise the dataset used for [Baller Analytics](https://balleranalytics.ai).

## Development:

### Run Unit Tests:
```
pnpm test
```

### Run Coverage Tests:
```
pnpm test:coverage
```

### Import Data:
```
pnpm start
```

## Status:
- [ ] Tests
  - [ ] Unit Tests
    - [ ] API
      - [x] getBoxScore - fetch and format game boxscore data from Basketball Reference (e.g. [GSW @ LAL, 10/19/2021](https://www.basketball-reference.com/boxscores/202110190LAL.html))
      - [x] getPlayerData - fetch player profile meta data from Basketball Reference (e.g. [Steph Curry](https://www.basketball-reference.com/players/c/curryst01.html))
      - [x] getSeasons - fetch seasonList and meta data from [Basketball Reference](https://www.basketball-reference.com/leagues/)
      - [x] getSeasonGames - fetch and format all season games from Basketball Reference (e.g. [2020-21 Games](https://www.basketball-reference.com/leagues/NBA_2021_games.html))
      - [x] getSeasonTx - fetch and format all season transactions from Basketball Reference (e.g. [2020-21 NBA Transactions](https://www.basketball-reference.com/leagues/NBA_2021_transactions.html))
    - [ ] DB
      - [ ] Team2
      - [ ] Game2
        - [x] addOrFindGame - given game, year and league, queries db for existing game and creates game if not found
        - [x] importBoxScores - given Game2 instance, import and save boxscore data to db
      - [ ] Player2
      - [ ] Coach2
      - [ ] Official2
      - [ ] League
  - [ ] Coverage Testing
    - [x] Setup TS Coverage Tests
    - [ ] Set Minimum Coverage Testing %
  - [ ] Add Tests to CI
- [ ] API
  - [ ] [Basketball Reference](https://www.basketball-reference.com) API
    - [ ] Games
      - [x] getBoxScore (fetch boxscore data for game by date, home team abbrev)
    - [ ] Players
      - [x] getPlayerData (fetch Player Bio/Meta by playerUrl)
    - [ ] Teams
      - [ ] Team Meta Data
    - [ ] Seasons
      - [x] getSeasons (returns list of seasons, season meta info)
      - [x] getSeasonGames (returns list of games for season)
    - [ ] Transactions (Tx)
      - [x] getSeasonTx (returns list of transactions for season)
- [ ] DB
  - [ ] Models
    - [ ] Team2
      - [x] Ported From JS
      - [ ] Refined Data Model for TS
    - [ ] Game2
      - [x] Ported From JS
      - [ ] Refined Data Model for TS
    - [ ] Player2
      - [x] Ported From JS
      - [ ] Refined Data Model for TS
    - [ ] Coach2
      - [x] Ported From JS
      - [ ] Refined Data Model for TS
    - [ ] Official2
      - [x] Ported From JS
      - [ ] Refined Data Model for TS
    - [ ] League
      - [x] Ported From JS
      - [ ] Refined Data Model for TS
    - [ ] Team (NBA Stats/Old Model)
      - [ ] Ported From JS
      - [ ] Refined Data Model for TS
    - [ ] Game (NBA Stats/Old Model)
      - [ ] Ported From JS
      - [ ] Refined Data Model for TS
    - [ ] Player (NBA Stats/Old Model)
      - [ ] Ported From JS
      - [ ] Refined Data Model for TS
    - [ ] Coach (NBA Stats/Old Model)
      - [ ] Ported From JS
      - [ ] Refined Data Model for TS
    - [ ] Official (NBA Stats/Old Model)
      - [ ] Ported From JS
      - [ ] Refined Data Model for TS
  - [ ] Controllers
    - [ ] Team2
    - [ ] Game2
      - [x] importBoxScores - given game, date, & opponents, parses and writes boxscore data to mongodb (adds any previously unseen officials & players)
      - [x] addOrFindGame - given game, year and league, queries db for existing game and creates game if not found
    - [ ] Player2
      - [x] addOrFindPlayer - find player in player2 collection by playerUrl; if null -> create a new player in database
      - [x] addPlayerBasicData - given player from dataset, find and store player meta info from player's profile on [Basketball Reference](https://basketball-reference.com)
    - [ ] Coach2
    - [ ] Official2
      - [x] addOrFindOfficial - find official in official2 collection by officialUrl; if null -> create a new official in database
    - [ ] League
    - [ ] Team (NBA Stats/Old Model)
    - [ ] Game (NBA Stats/Old Model)
    - [ ] Coach (NBA Stats/Old Model)
    - [ ] Official (NBA Stats/Old Model)


### Disclosure:

- While Baller Analytics strives to provide the most accurate and complete dataset of historical hoops data, Baller Analytics makes no gaurantee as to the accuracy of the data provided
  - N.B. Migrating the codebase from javascript -> typescript should only improve accuracy of dataset 
- DB Models are constantly in flux as codebase is refactored to typescript; do not bundle with critical apps until stable release becomes available.
  - N.B. Migrating the codebase from javascript -> typescript should only improve accuracy of dataset 
