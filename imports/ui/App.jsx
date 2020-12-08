import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { PlayersCollection } from '/imports/api/PlayersCollection';
import { GamesCollection } from '/imports/api/GamesCollection';
import { Admin } from './Admin';
import { PlayerJoin } from './PlayerJoin';
import { CreateGame } from './CreateGame';

export const App = () => {
  const [join, setJoin] = useState(false);
  const [create, setCreate] = useState(false);
  const [showButtons, setShowButtons] = useState(true);

  const players = useTracker( () =>
    PlayersCollection.find({}, {
      sort: { createdAt: -1 }
    }).fetch()
  );

  const deletePlayer = ({ _id }) => PlayersCollection.remove(_id);

  function genMatches(a, match = 0, stage = {}) {
    let isOdd = false
    if (a === 1) {
      return match;
    }
    if (a % 2) {
      isOdd = true;
      a = a - 1;
    }
    match = match + Math.floor(a / 2);

    stage[Object.keys(stage).length] = new Array(Math.floor(a / 2)).fill([[],[]])
    a = Math.floor(a / 2)
    if (isOdd)
      a = a + 1;
    stage = {...stage,... genMatches(a, match, stage)};
    return stage;
  }

  return (
    <div className="app">
      <header>Sport</header>

      <div className="buttons">
        <button className="menu-buttons" onClick={() => {
          setJoin(false);
          setCreate(false);
          setShowButtons(true);
        }}>Reset</button>

        {showButtons ? (
          <div>
            <div>
              <button className="menu-buttons" onClick={() => {
                setJoin(!join);
                setShowButtons(false)
              }}>Join Game</button>
            </div>
            <div>
              <button className="menu-buttons" onClick={() => {
                setCreate(!join);
                setShowButtons(false)
              }}>Create Game</button>
            </div>
          </div>
        ) : ( "" )}

        {join ? ( <PlayerJoin
          players={players}
          deletePlayer={deletePlayer}
        /> ) : ( "" )}

        {create ? ( <CreateGame
          players={players}
          deletePlayer={deletePlayer}
        /> ) : ( "" )}

        All players
        <ul className="players">
          { players.map(player => <Admin
            key={ player._id }
            player={ player }
            onDeleteClick={ deletePlayer }
          />) }
        </ul>
      </div>
    </div>
  );
};
