import React, { useState, Fragment } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { PlayersCollection } from '/imports/api/PlayersCollection';
import { GamesCollection } from '/imports/api/GamesCollection';
import { TeamsCollection } from '/imports/api/TeamsCollection';
import { Player } from './Player';
import { Admin } from './Admin'
import { Tournament } from './Tournament';
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
    Meteor.call('firstRound', game.gameId, game.gameType, (err, res) => {
      Meteor.call('gameStart', game.gameId);
    })
  }

  const leaveGame = () => {
    Meteor.call('playerDelete', curPlayer._id, (err, res) => {
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

  return (
    <div>
      {curPlayer ? (
        <Fragment>
          {game.gameStart ? (
            <Tournament
              part={tournamentParticipants}
              gameId={game.gameId}
              gameType={game.gameType}
              endGame={endGame}
              isAdmin={curPlayer.isAdmin}
            />
          ) : (
            <div>
              <div>
                <ul>
                  <li>Player: {curPlayer.name}</li>
                  <li>Code: {game.gameId}</li>
                  <li>Overtime: {game.isOvertime ? "✔" : "✘"}</li>
                  <li>Type: {game.gameType}</li>
                </ul>
              </div>
              <div>
              </div>
              Current game players {curGamePlayers.length}
              {curPlayer.isAdmin ? (
                <Fragment>
                  <ul className="players">
                    { curGamePlayers.map(player => <Admin
                      key={ player._id }
                      player={ player }
                      onDeleteClick={ deletePlayer }
                    />) }
                  </ul>

                  <button onClick={gameStart}>Start game</button>
                </Fragment>
              ) : (
                <ul className="players">
                  { curGamePlayers.map(player => <Player
                    key={ player._id }
                    player={ player }
                  />) }
                </ul>
              )}

              {game.gameType === "Team" ? (
                <Teams
                  gameId={game.gameId}
                  player={curPlayer}
                  maxPlayers={game.teamSize}
                />
              ) : "" }

              {curPlayer.isAdmin ? (
                <button onClick={endGame}>End game</button>
              ) : (
                <button onClick={leaveGame}>Leave game</button>
              )}
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
