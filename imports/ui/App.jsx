import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { PlayersCollection } from '/imports/api/PlayersCollection';
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

  const deletePlayer = ({ _id }) => Meteor.call('playerDelete', _id);

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
