import React, { useState, Fragment } from 'react';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Modal } from 'react-bootstrap';
import { PlayersCollection } from '/imports/api/PlayersCollection';
import { GameLobby } from './GameLobby';

export const CreateGame = ({ user, deletePlayer, goToMenu }) => {
  const [select, setSelect] = useState('Individual');
  const [teamSize, setTeamSize] = useState('');
  const [teamNumber, setTeamNumber] = useState('');
  const [scoreType, setScoreType] = useState('Time');
  const [isChecked, setIsChecked] = useState(false);
  const [isFilledIn, setIsFilledIn] = useState(false);
  const [randomId, setRandomId] = useState(Random.id(6).toUpperCase());
  const [showCreate, setShowCreate] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();

    if (select === "Team") {
      if (!teamNumber || !teamSize) return;
    }

    openCreate()
  };

  const handleModal = () => {
    const createGame = () => {
      Meteor.call('playerInsert', user.username, randomId, true, (err, res) => {
        Meteor.call('gameCreate', randomId, select, scoreType, isChecked, teamSize, teamNumber, (err, res) => {
          setIsFilledIn(true);
        })}
      )
    }

    closeCreate()

    if (PlayersCollection.find({ name: user.username, inGame: true }).count() !== 0) {
      //if isAdmin === true -> end game  else  leave game
      if (PlayersCollection.findOne({ name: user.username, inGame: true }).isAdmin === true) {
        //isAdmin === true
        Meteor.call('gameEnd', PlayersCollection.findOne({ name: user.username, inGame: true }).gameId)
        createGame();
      } else {
        //isAdmin === false
        PlayersCollection.findOne({ name: user.username }).status ? (
          //game has started
          Meteor.call('leaveStartedGame', user.username)
        ) : (
          //game hasnt started
          Meteor.call('leaveGame', PlayersCollection.findOne({ name: user.username, inGame: true }))
        )
        createGame();
      }
    } else {
      createGame();
    }
  }

  const onChangeNumber = e => {
    const re = /^[0-9\b]+$/;
    if (!e.target.value) {
      setTeamNumber("")
    } else if (re.test(e.target.value)) {
      setTeamNumber(Number(e.target.value))
    }
  }

  const onChangeSize = e => {
    const re = /^[0-9\b]+$/;
    if (!e.target.value) {
      setTeamSize("")
    } else if (re.test(e.target.value)) {
      setTeamSize(Number(e.target.value))
    }
  }

  const openCreate = () => setShowCreate(true)
  const closeCreate = () => setShowCreate(false)

  const selectedOptions = (select) => {
    switch (select) {
      case "Individual":
        return (
          <div class="col-12 mb-3 p-0">
            <div class="form-check">
              <input
                type="checkbox"
                class="form-check-input"
                id="overtimeCheck"
                onClick={e =>setIsChecked(e.target.checked)}
              />
              <label class="form-check-label" htmlFor="overtimeCheck">Overtime</label>
            </div>
          </div>
        );
      case "Team":
        return (
          <Fragment>
            <div class="col-12 mb-3 p-0">
              <input
                type="text"
                class="form-control"
                placeholder="Number of teams"
                value={teamNumber}
                onChange={onChangeNumber}
              />
            </div>
            <div class="col-12 mb-3 p-0">
              <input
                type="text"
                class="form-control"
                placeholder="Team size"
                value={teamSize}
                onChange={onChangeSize}
              />
            </div>
            <div class="col-12 mb-3 p-0">
              <div class="form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="overtimeCheck"
                  onClick={e =>setIsChecked(e.target.checked)}
                />
                <label class="form-check-label" htmlFor="overtimeCheck">Overtime</label>
              </div>
            </div>
          </Fragment>
        );
      case "Leaderboard":
        return (
          <Fragment>
            <label class="form-label p-0">Scoring Type</label>
            <div class="col-12 mb-3 p-0">
              <select class="form-select" value={scoreType} onChange={e => setScoreType(e.target.value)}>
                <option value="Time">Time</option>
                <option value="Points">Points</option>
              </select>
            </div>
          </Fragment>
        );
    }
  }

  return (
    <Fragment>
      {isFilledIn ? (
        <div>
            <GameLobby
              playerName={user.username}
              gameId={randomId}
              deletePlayer={deletePlayer}
              goToMenu={goToMenu}
            />
        </div>
      ) : (
        <div class="d-flex justify-content-center">
          <form class="row size" onSubmit={handleSubmit}>
            <label class="form-label p-0" htmlFor="gameType">Game Type</label>
            <div class="col-12 mb-3 d-flex justify-content-center p-0">
              <select class="form-select" id="gameType" value={select} onChange={e => setSelect(e.target.value)}>
                <option value="Individual">Individual sport</option>
                <option value="Team">Team sport</option>
                <option value="Leaderboard">Leaderboard</option>
              </select>
            </div>
            {selectedOptions(select)}
            <div class="col-12 mb-3 d-flex justify-content-center p-0">
              <button type="submit" class="btn btn-primary size">Create Game</button>

              <Modal show={showCreate} onHide={closeCreate}>
                <Modal.Body>
                  <span>
                    Are you sure you want to create a game?
                  </span>
                </Modal.Body>
                <Modal.Footer>
                  <button type="button" class="btn btn-secondary" onClick={closeCreate}>Cancel</button>
                  <button type="button" class="btn btn-primary" onClick={handleModal}>Create game</button>
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
