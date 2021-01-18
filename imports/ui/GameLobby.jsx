import React, { useState, Fragment } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { PlayersCollection } from '/imports/api/PlayersCollection';
import { GamesCollection } from '/imports/api/GamesCollection';
import { TeamsCollection } from '/imports/api/TeamsCollection';
import { Player } from './Player';
import { Admin } from './Admin'
import { Tournament } from './Tournament';
import { Leaderboard } from './Leaderboard';
import { Teams } from './Teams'

export const GameLobby = ({ playerName, gameId, deletePlayer, goToMenu }) => {
  const game = useTracker( () => GamesCollection.findOne( { gameId: gameId } ));
  const curGameTeams = useTracker( () => TeamsCollection.find({ gameId: gameId }, {
    sort: { createdAt: 1 }
  }).fetch());
  const curPlayer = PlayersCollection.findOne( { name: playerName, gameId: gameId } );
  const curGamePlayers = useTracker( () => PlayersCollection.find({ gameId: gameId }, {
    sort: { createdAt: 1 }
  }).fetch());

  const tournamentParticipants = (game.gameType === "Team" ? (
    curGameTeams
  ) : (
    curGamePlayers
  ))

  const gameStart = () => {
    game.gameType === "Leaderboard" ? (
      Meteor.call('leaderboardStart', game.gameId, (err, res) => {
        Meteor.call('gameStart', game.gameId);
      })
    ) : (
      Meteor.call('firstRound', game.gameId, game.gameType, (err, res) => {
        Meteor.call('gameStart', game.gameId);
      })
    )
  }

  const leaveGame = () => {
    Meteor.call('leaveGame', curPlayer, (err, res) => {
      goToMenu();
    })
  }

  const endGame = () => {
    Meteor.call('gameEnd', gameId, (err, res) => {
      goToMenu();
    })
  }

  const removed = () => {
    goToMenu();
    alert("You have been removed from the game");
  }

  var gameType
  if (game.gameType === "Individual") gameType = "Individual game"
  else if (game.gameType === "Team") gameType = "Team game"
  else if (game.gameType === "Leaderboard") gameType = "Leaderboard"


  return (
    <div>
      {curPlayer ? (
        <Fragment>
          {game.gameStart ? (
            <Fragment>
              {game.gameType === "Leaderboard" ? (
                <Leaderboard
                  gameId={gameId}
                  name={curPlayer.name}
                  isAdmin={curPlayer.isAdmin}
                  endGame={endGame}
                  goToMenu={goToMenu}
                />
              ) : (
                <Tournament
                  part={tournamentParticipants}
                  gameId={game.gameId}
                  gameType={game.gameType}
                  endGame={endGame}
                  goToMenu={goToMenu}
                  name={curPlayer.name}
                  isAdmin={curPlayer.isAdmin}
                />
              )}
            </Fragment>
          ) : (
            <div class="d-flex align-items-center flex-column">
              <div class="d-flex align-items-center flex-column mb-3">
                <p class="h1">{game.gameId}</p>
                <p class="mb-0">{gameType}</p>
                <p>Overtime {game.isOvertime ? <span class="badge bg-success">✓</span> : <span class="badge bg-danger">✕</span>}</p>
                {curPlayer.isAdmin ? (
                  <Fragment>
                    <p class="mb-1">Players in lobby <span class="badge bg-secondary">{curGamePlayers.length}</span></p>
                    <ul className="players">
                      { curGamePlayers.map(player => <Admin
                        key={ player._id }
                        player={ player }
                        onDeleteClick={ deletePlayer }
                      />) }
                    </ul>

                    <button type="button" class="btn btn-primary size" onClick={gameStart}>Start game</button>
                  </Fragment>
                ) : (
                  <Fragment>
                    <p class="mb-2">Players in lobby <span class="badge bg-secondary">{curGamePlayers.length}</span></p>
                    <ul className="players">
                      { curGamePlayers.map(player => <Player
                        key={ player._id }
                        player={ player }
                      />) }
                    </ul>
                  </Fragment>
                )}
              </div>

              {game.gameType === "Team" ? (
                <Teams
                  gameId={game.gameId}
                  player={curPlayer}
                  maxPlayers={game.teamSize}
                  isAdmin={curPlayer.isAdmin}
                />
              ) : "" }

              <div>
              {curPlayer.isAdmin ? (
                <button type="button" class="btn btn-danger size" onClick={endGame}>End game</button>
              ) : (
                <button type="button" class="btn btn-danger size" onClick={leaveGame}>Leave game</button>
              )}
              </div>
            </div>
          )}
        </Fragment>
      ) : (
        <div>
          {removed()}
        </div>
      )}
    </div>
  );
};
