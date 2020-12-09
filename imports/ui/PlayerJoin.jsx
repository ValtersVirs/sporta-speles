import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker'
import { useTracker } from 'meteor/react-meteor-data';
import { PlayersCollection } from '/imports/api/PlayersCollection';
import { GamesCollection } from '/imports/api/GamesCollection';
import { GameLobby } from './GameLobby';
import { Player } from './Player';

export const PlayerJoin = ({ players, deletePlayer }) => {
  const [name, setName] = useState("");
  const [gameId, setGameId] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [isFilledIn, setIsFilledIn] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();

    if (!name ||
     !gameId ||
      GamesCollection.find({ gameId: gameId }).count() === 0 ||
      PlayersCollection.find({ name: name, gameId: gameId }).count() > 0
    ) return;

    Meteor.call('playerInsert', name, gameId, false, (err, res) => {
      setIsFilledIn(true);
    });
  };

  return (
    <div className="player-join">

      {isFilledIn ? (
        <div>
          <div>
            <GameLobby
              players={players}
              playerName={name}
              gameId={gameId}
              deletePlayer={deletePlayer}
            />
          </div>

        </div>
      ) : (
        <form className="fill-form" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Enter game id"
              value={gameId}
              onChange={(e) => setGameId(e.target.value.toUpperCase())}
            />
          </div>

          <button type="submit">Join</button>
        </form>
      )}
    </div>
  );
};
