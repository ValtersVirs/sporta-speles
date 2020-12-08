import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { PlayersCollection } from '/imports/api/PlayersCollection';
import { GamesCollection } from '/imports/api/GamesCollection';
import { TeamsCollection } from '/imports/api/TeamsCollection';
import { Player } from './Player';
import { Admin } from './Admin'
import { Tournament } from './Tournament';
import { Teams } from './Teams'

export const GameLobby = ({ players, playerName, gameId, deletePlayer }) => {
  const game = useTracker( () => GamesCollection.findOne( { gameId: gameId } ));
  const curGameTeams = useTracker( () => TeamsCollection.find({ gameId: gameId }, {
    sort: { createdAt: 1 }
  }).fetch());
  const curPlayer = PlayersCollection.findOne( { name: playerName, gameId: gameId } );
  const curGamePlayers = PlayersCollection.find({ gameId: gameId }, {
    sort: { createdAt: 1 }
  }).fetch();

  const tournamentParticipants = (game.gameType === "Team" ? (
    curGameTeams
  ) : (
    curGamePlayers
  ))

  console.log("test");

  return (
    <div>
      {game.gameStart ? (
        <div>
          <Tournament participants={tournamentParticipants} />
        </div>
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
            <button onClick={() => {
              Meteor.call('gameStart', game.gameId);
            }} >Start game</button>
          </div>
          Current game players {curGamePlayers.length}
          {curPlayer.isAdmin ? (
            <ul className="players">
              { curGamePlayers.map(player => <Admin
                key={ player._id }
                player={ player }
                onDeleteClick={ deletePlayer }
              />) }
            </ul>
          ) : (
            <ul className="players">
              { curGamePlayers.map(player => <Player
                key={ player._id }
                player={ player }
              />) }
            </ul>
          )}

          { game.gameType === "Team" ? (
            <Teams
              gameId={game.gameId}
              player={curPlayer}
            />
          ) : "" }

        </div>
      )}
    </div>
  );
};
