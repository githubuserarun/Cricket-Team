const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// API 1
// get all players details
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT *
    FROM cricket_team`;

  const playersDetails = await db.all(getPlayersQuery);
  response.send(
    playersDetails.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

// API 2
// Add player details

app.post("/players/", async (request, response) => {
  const newPlayerDetails = request.body;
  const { playerName, jerseyNumber, role } = newPlayerDetails;
  const addDetailsQuery = `
  INSERT INTO
  cricket_team
  (player_name,jersey_number,role)
  VALUES 
  ('${playerName}','${jerseyNumber}','${role}')`;
  const postPlayerDetails = await db.run(addDetailsQuery);
  response.send("Player Added to Team");
});

// API 3
// Get particular player details

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetailsQuery = `
    SELECT
      *
    FROM
      cricket_team
    WHERE
    player_id  = ${playerId};`;
  const player = await db.get(getPlayerDetailsQuery);
  response.send(convertDbObjectToResponseObject(player));
});

//API 4
//Update partcular player details

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const newPlayerDetails = request.body;
  const { playerName, jerseyNumber, role } = newPlayerDetails;
  const updatePlayerDetailsQuery = `
    UPDATE cricket_team
    SET player_name='${playerName}',jersey_number='${jerseyNumber}',role='${role}' 
    WHERE player_id='${playerId}';`;
  const updatedPlayer = await db.run(updatePlayerDetailsQuery);
  response.send("Player Details Updated");
});

//API 5
//Delete player

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM cricket_team
    WHERE player_id='${playerId}';`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
