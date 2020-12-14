import React, { useState, Fragment } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { PlayersCollection } from '/imports/api/PlayersCollection';
import { Login } from './Login';
import { Admin } from './Admin';
import { PlayerJoin } from './PlayerJoin';
import { CreateGame } from './CreateGame';

export const App = () => {
  const [join, setJoin] = useState(false);
  const [create, setCreate] = useState(false);
  const [showButtons, setShowButtons] = useState(true);

  Meteor.subscribe('allPlayers');
  Meteor.subscribe('allGames');
  Meteor.subscribe('allTeams');

  const user = useTracker(() => Meteor.user());

  const players = useTracker( () =>
    PlayersCollection.find({}, {
      sort: { createdAt: -1 }
    }).fetch()
  );

  const deletePlayer = ({ _id }) => Meteor.call('playerDelete', _id);

  const logout = () => Meteor.logout();
  const deleteUser = () => Meteor.call('removeUser');

  const showMenu = () => {
    setJoin(false);
    setCreate(false);
    setShowButtons(true);
  }

  return (
    <div className="app">
      <header>Sport</header>

      {user ? (
        <Fragment>
        <div className="account">
          user: {user.username}
          <button onClick={logout}>Logout</button>
          <button onClick={deleteUser}>Delete account</button>
        </div>

          <div className="buttons">
            <button className="menu-buttons" onClick={() => showMenu()}>Reset</button>

            {showButtons ? (
              <div>
                <div>
                  <button className="menu-buttons" onClick={() => {
                    setJoin(!join);
                    setShowButtons(false);
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
              user={user}
              deletePlayer={deletePlayer}
              goToMenu={showMenu}
             /> ) : ( "" )}

            {create ? ( <CreateGame
              user={user}
              deletePlayer={deletePlayer}
              goToMenu={showMenu}
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
        </Fragment>
      ) : (
        <Fragment>
          {Meteor.loggingIn() ? (
            "logging in"
          ) : (
            <Login goToMenu={showMenu}/>
          )}
        </Fragment>
      )}
    </div>
  );
};
