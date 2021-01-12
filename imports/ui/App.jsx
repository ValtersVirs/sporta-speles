import React, { useState, Fragment } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { PlayersCollection } from '/imports/api/PlayersCollection';
import { Login } from './Login';
import { Admin } from './Admin';
import { PlayerJoin } from './PlayerJoin';
import { CreateGame } from './CreateGame';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';

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
    <Fragment>
    <nav class="navbar navbar-custom navbar-expand navbar-dark bg-dark">
      <div class="container-fluid">
        {user ? (
          <Fragment>
            <div class="mr-auto">
              <span class="navbar-text">User: {user.username}</span>
            </div>
            <div>
              <button type="button" class="btn btn-primary mx-2" onClick={logout}>Logout</button>
              <button type="button" class="btn btn-primary" onClick={deleteUser}>DEL</button>
            </div>
          </Fragment>
        ) : ""}
      </div>
    </nav>
    <div class="container-fluid">
      {user ? (
        <Fragment>
            {showButtons ? (
              <div class="row gap-3">
                <div class="col-12 d-flex justify-content-center">
                  <button type="button" class="btn btn-primary size" onClick={() => {
                    setJoin(!join);
                    setShowButtons(false);
                  }}>Join Game</button>
                </div>
                <div class="col-12 d-flex justify-content-center">
                  <button type="button" class="btn btn-primary size" onClick={() => {
                    if (PlayersCollection.find({ name: user.username, inGame: true }).count() !== 0) {
                      alert(`You are currently in game ${PlayersCollection.findOne({ name: user.username }).gameId}.\nBy creating a new game you will leave/end current game`)
                    }
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
        </Fragment>
      ) : (
        <Fragment>
          {Meteor.loggingIn() ? (
            <div class="d-flex justify-content-center">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <Login goToMenu={showMenu}/>
          )}
        </Fragment>
      )}
    </div>
    </Fragment>
  );
};
