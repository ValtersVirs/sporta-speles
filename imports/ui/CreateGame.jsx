import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { PlayersCollection } from '/imports/api/PlayersCollection';
import { GameLobby } from './GameLobby';

export const CreateGame = ({ user, deletePlayer, goToMenu, removedGame, removedPlayer }) => {
  const [select, setSelect] = useState('Individual');
  const [teamSize, setTeamSize] = useState('');
  const [teamNumber, setTeamNumber] = useState('');
  const [scoreType, setScoreType] = useState('Time');
  const [isChecked, setIsChecked] = useState(false);
  const [isFilledIn, setIsFilledIn] = useState(false);
  const [randomId, setRandomId] = useState(Random.id(6).toUpperCase());
  const [showCreate, setShowCreate] = useState(false);
  const [custom, setCustom] = useState(false);
  const [teamNames, setTeamNames] = useState([]);
  const [showDuplicates, setShowDuplicates] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();

    if (select === "Team") {
      if (!teamNumber || !teamSize) return;

      if (custom) {
        const trimNames = teamNames.map(name => { return name.trim() })
        console.log(trimNames);
        if (new Set(trimNames).size !== trimNames.length) {
          openDuplicates()
          return
        }
      }
    }

    openCreate()
  };

  const handleModal = () => {
    const createGame = () => {
      Meteor.call('playerInsert', user.username, randomId, true, (err, res) => {
        Meteor.call('gameCreate', randomId, select, scoreType, isChecked, teamSize, teamNumber, custom, teamNames, (err, res) => {
          setIsFilledIn(true);
        })}
      )
    }

    closeCreate()

    if (PlayersCollection.find({ name: user.username, inGame: true }).count() !== 0) {
      if (PlayersCollection.findOne({ name: user.username, inGame: true }).isAdmin === true) {
        Meteor.call('gameEnd', PlayersCollection.findOne({ name: user.username, inGame: true }).gameId)
        createGame();
      } else {
        PlayersCollection.findOne({ name: user.username }).status ? (
          Meteor.call('leaveStartedGame', user.username)
        ) : (
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
      if (e.target.value <= 20) {
        setTeamNumber(Number(e.target.value))
      }
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

  useEffect(() => {
    let teamNameArray = []
    if (teamNames.every(name => name === "")) {
      for (let i = 0; i < teamNumber; i++) {
        teamNameArray[i] = ""
      }
      setTeamNames(teamNameArray)
    } else {
      for (let i = 0; i < teamNumber; i++) {
        teamNameArray[i] = typeof teamNames[i] === "undefined" ? "" : teamNames[i]
      }
      setTeamNames(teamNameArray)
    }
  }, [teamNumber])

  const setTeamName = (newName, i) => {
    setTeamNames(teamNames.map((name, index) => {
      return index === i ? newName : name
    }))
  }

  const openCreate = () => setShowCreate(true)
  const closeCreate = () => setShowCreate(false)

  const openDuplicates = () => setShowDuplicates(true)
  const closeDuplicates = () => setShowDuplicates(false)

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
                required
              />
            </div>
            <div class="col-12 mb-3 p-0">
              <input
                type="text"
                class="form-control"
                placeholder="Team size"
                value={teamSize}
                onChange={onChangeSize}
                required
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
            <div class="col-12 mb-3 p-0">
              <div class="form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="customNames"
                  onClick={e =>setCustom(e.target.checked)}
                />
                <label class="form-check-label" htmlFor="customNames">Custom team names</label>
              </div>
            </div>
            {custom ? (
              <CustomTeamNames
                teams={teamNames}
                setTeamName={setTeamName}
              />
            ) : ""}
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
              removedPlayer={removedPlayer}
              removedGame={removedGame}
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
              <button type="submit" class="btn btn-main size">Create Game</button>

              <Modal show={showCreate} onHide={closeCreate} centered>
                <Modal.Body>
                  <div class="d-flex justify-content-center">
                    <span>Are you sure you want to create a game?</span>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <div class="w-100 d-flex justify-content-center">
                    <button type="button" class="btn btn-cancel me-2" onClick={closeCreate}>Cancel</button>
                    <button type="button" class="btn btn-ok" onClick={handleModal}>Create game</button>
                  </div>
                </Modal.Footer>
              </Modal>

              <Modal show={showDuplicates} onHide={closeDuplicates} centered>
                <Modal.Body>
                  <div class="d-flex justify-content-center">
                    <span>Team names cannot be identical</span>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <div class="w-100 d-flex justify-content-center">
                    <button type="button" class="btn btn-ok" onClick={closeDuplicates}>Ok</button>
                  </div>
                </Modal.Footer>
              </Modal>
            </div>
            <div class="col-12 d-flex justify-content-center p-0">
              <button type="button" class="btn btn-main2" onClick={goToMenu}>Back</button>
            </div>
          </form>
        </div>
      )}
    </Fragment>
  );
};

const CustomTeamNames = ({ teams, setTeamName }) => {

  return (
    <Fragment>
    {teams.length ? (
      <div class="col-12 mb-3 p-0">
        {teams.map((team, index) => <InputTeamName
            key={index}
            index={index}
            setTeamName={setTeamName}
            team={team}
          />
        )}
      </div>
    ) : ""}
    </Fragment>
  );
}

const InputTeamName = ({ index, setTeamName, team }) => {
  const handleOnChange = e => {
    name = e.target.value
    setTeamName(name, index)
  }

  return (
    <div class="mb-1">
      <div>Team {index + 1}: </div>
      <div class="input-group">
        <input
          type="text"
          class="form-control"
          placeholder={`Team's name`}
          value={team}
          required
          onChange={handleOnChange}
        />
      </div>
    </div>
  );
}
