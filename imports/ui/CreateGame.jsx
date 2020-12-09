import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random'
import { GameLobby } from './GameLobby';

export const CreateGame = ({ players, deletePlayer }) => {
  const [name, setName] = useState('');
  const [select, setSelect] = useState('Individual');
  const [teamSize, setTeamSize] = useState('');
  const [teamNumber, setTeamNumber] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isFilledIn, setIsFilledIn] = useState(false);
  const [randomId, setRandomId] = useState(Random.id(6).toUpperCase());

  const handleSubmit = e => {
    e.preventDefault();

    if (!name) return;

    if (select === "Team") {
      if (!teamNumber || !teamSize) return;
    }

    Meteor.call('playerInsert', name, randomId, true, (err, res) => {
      Meteor.call('gameCreate', randomId, select, isChecked, teamNumber, (err, res) => {
        setIsFilledIn(true);
      })}
    )
  };

  const onChangeNumber = e => {
    const re = /^[0-9\b]+$/;
    if (e.target.value === '' || re.test(e.target.value)) {
      setTeamNumber(Number(e.target.value))
    }
  }

  const onChangeSize = e => {
    const re = /^[0-9\b]+$/;
    if (e.target.value === '' || re.test(e.target.value)) {
      setTeamSize(Number(e.target.value))
    }
  }

  const selectedOptions = (select) => {
    switch (select) {
      case "Individual":
        return (
          <div>
          <label>Overtime</label>
            <input
              type="checkbox"
              onClick={e =>setIsChecked(e.target.checked)}
            />
          </div>
        );
      case "Team":
        return (
          <div>

            <div>
              <input
                type="text"
                placeholder="Number of teams"
                value={teamNumber}
                onChange={onChangeNumber}
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Team size"
                value={teamSize}
                onChange={onChangeSize}
              />
            </div>

            <label>Overtime</label>
            <input
              type="checkbox"
              onClick={e =>setIsChecked(e.target.checked)}
              />
          </div>
        );
      case "Leaderboard":
        return <div>Leaderboard</div>
    }
  }

  return (
    <div className="create-game">
      {isFilledIn ? (
        <div>
            <GameLobby
              players={players}
              playerName={name}
              gameId={randomId}
              deletePlayer={deletePlayer}
            />
        </div>
      ) : (
        <form className="fill-form" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <label>Game Type</label>
            <select value={select} onChange={e => setSelect(e.target.value)}>
              <option value="Individual">Individual sport</option>
              <option value="Team">Team sport</option>
              <option value="Leaderboard">Leaderboard</option>
            </select>
          </div>

          {selectedOptions(select)}

          <button type="submit">Create Game</button>
        </form>
      )}
    </div>
  );
};
