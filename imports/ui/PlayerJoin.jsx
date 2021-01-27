import React, { useState, Fragment } from 'react';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker'
import { useTracker } from 'meteor/react-meteor-data';
import { Modal } from 'react-bootstrap';
import { PlayersCollection } from '/imports/api/PlayersCollection';
import { GamesCollection } from '/imports/api/GamesCollection';
import { GameLobby } from './GameLobby';
import { Player } from './Player';

export const PlayerJoin = ({ user, deletePlayer, goToMenu, removed }) => {
  const [gameId, setGameId] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [isFilledIn, setIsFilledIn] = useState(false);
  const [showStarted, setShowStarted] = useState(false);

  const openStarted = () => setShowStarted(true)
  const closeStarted = () => setShowStarted(false)

  if (PlayersCollection.find({ name: user.username, inGame: true }).count() !== 0 && !gameId) {
    setIsFilledIn(true);
    setGameId(PlayersCollection.findOne({ name: user.username, inGame: true }).gameId);
  }

  const handleSubmit = e => {
    e.preventDefault();

    if (!gameId || GamesCollection.find({ gameId: gameId }).count() === 0)
      return;

    if (GamesCollection.findOne({ gameId: gameId}).gameStart === true) {
      openStarted()
      return;
    }

    Meteor.call('playerInsert', user.username, gameId, false, (err, res) => {
      setIsFilledIn(true);
    });
  };

  return (
    <Fragment>
      {isFilledIn ? (
        <GameLobby
          playerName={user.username}
          gameId={gameId}
          deletePlayer={deletePlayer}
          goToMenu={goToMenu}
          removed={removed}
        />
      ) : (
        <div class="d-flex justify-content-center">
          <form class="row gap-3 size" onSubmit={handleSubmit}>
            <div class="col-12 d-flex justify-content-center p-0">
              <input
                type="text"
                class="form-control"
                placeholder="Game id"
                value={gameId}
                onChange={(e) => setGameId(e.target.value.toUpperCase())}
              />
            </div>
            <div class="col-12 d-flex justify-content-center p-0">
              <button type="submit" class="btn btn-primary size">Join</button>

              <Modal show={showStarted} onHide={closeStarted}>
                <Modal.Body>
                  <span>
                    The game has already started
                  </span>
                </Modal.Body>
                <Modal.Footer>
                  <button type="button" class="btn btn-secondary" onClick={closeStarted}>Ok</button>
                </Modal.Footer>
              </Modal>
            </div>
            <div class="col-12 d-flex justify-content-center p-0">
              <button type="button" class="btn btn-secondary" onClick={goToMenu}>Back</button>
            </div>
          </form>
        </div>
      )}
    </Fragment>
  );
};
