import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker'
import { useTracker } from 'meteor/react-meteor-data';
import { PlayersCollection } from '/imports/api/PlayersCollection';
import { GamesCollection } from '/imports/api/GamesCollection';
import { GameLobby } from './GameLobby';
import { Player } from './Player';

export const PlayerJoin = ({ user, deletePlayer, goToMenu }) => {
  const [gameId, setGameId] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [isFilledIn, setIsFilledIn] = useState(false);

  if (PlayersCollection.find({ name: user.username }).count() !== 0 && !gameId) {
    setIsFilledIn(true);
    setGameId(PlayersCollection.findOne({ name: user.username }).gameId);
  }

  const handleSubmit = e => {
    e.preventDefault();

    if (!gameId || GamesCollection.find({ gameId: gameId }).count() === 0)
      return;

    Meteor.call('playerInsert', user.username, gameId, false, (err, res) => {
      setIsFilledIn(true);
    });
  };

  return (
    <div className="player-join">
      {isFilledIn ? (
        <div>
          <div>
            <GameLobby
              playerName={user.username}
              gameId={gameId}
              deletePlayer={deletePlayer}
              goToMenu={goToMenu}
            />
          </div>

        </div>
      ) : (
        <form className="fill-form" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              placeholder="Enter game id"
              value={gameId}
              onChange={(e) => setGameId(e.target.value.toUpperCase())}
            />
          </div>

          <button type="submit">Join</button>

          <button onClick={goToMenu}>Back</button>
        </form>
      )}
    </div>
  );
};
