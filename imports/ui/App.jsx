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
import { Modal } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';

export const App = () => {
  const [join, setJoin] = useState(false);
  const [create, setCreate] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [game, setGame] = useState("")
  const [leaveText, setLeaveText] = useState("")
  const [showDelete, setShowDelete] = useState(false)
  const [showRemoved, setShowRemoved] = useState(false)

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
  const deleteUser = () => {
    closeDelete()
    Meteor.call('removeUser');
  }

  const showMenu = () => {
    setJoin(false);
    setCreate(false);
    setShowButtons(true);
  }

  const removed = () => {
    showMenu()
    openRemoved()
  }

  const joinGame = () => {
    setJoin(!join);
    setShowButtons(false);
  }

  const createGame = () => {
    if (PlayersCollection.find({ name: user.username, inGame: true }).count() !== 0) {
      setGame(PlayersCollection.findOne({ name: user.username, inGame: true }).gameId)
      setLeaveText(PlayersCollection.findOne({ name: user.username, inGame: true }).isAdmin ? "end" : "leave")
      openCreate()
    } else {
      setCreate(!join);
      setShowButtons(false)
    }
  }

  const openCreate = () => setShowCreate(true)
  const closeCreate = () => setShowCreate(false)

  const openDelete = () => setShowDelete(true)
  const closeDelete = () => setShowDelete(false)

  const openRemoved = () => setShowRemoved(true)
  const closeRemoved = () => setShowRemoved(false)

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
              <button type="button" class="btn btn-primary" onClick={openDelete}><FaTrash/></button>

              <Modal show={showDelete} onHide={closeDelete}>
                <Modal.Body>
                  <span>Are you sure you want to delete your account?</span>
                </Modal.Body>
                <Modal.Footer>
                  <button type="button" class="btn btn-secondary" onClick={closeDelete}>Cancel</button>
                  <button type="button" class="btn btn-danger" onClick={deleteUser}>Delete</button>
                </Modal.Footer>
              </Modal>
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
                <button type="button" class="btn btn-primary size" onClick={joinGame}>Join Game</button>
              </div>
              <div class="col-12 d-flex justify-content-center">
                <button type="button" class="btn btn-primary size" onClick={createGame}>Create Game</button>

                <Modal show={showCreate} onHide={closeCreate}>
                  <Modal.Body>
                    <span>
                      You are currently in game {game}<br/>
                      By creating a new game you will {leaveText} your current game
                    </span>
                  </Modal.Body>
                  <Modal.Footer>
                    <button type="button" class="btn btn-secondary" onClick={closeCreate}>Cancel</button>
                    <button type="button" class="btn btn-primary" onClick={() => {
                      closeCreate()
                      setCreate(!join)
                      setShowButtons(false)
                    }}>Continue</button>
                  </Modal.Footer>
                </Modal>
              </div>

              <Modal show={showRemoved} onHide={closeRemoved}>
                <Modal.Body>
                  You have been removed from the game
                </Modal.Body>
                <Modal.Footer>
                  <button type="button" class="btn btn-primary" onClick={closeRemoved}>Ok</button>
                </Modal.Footer>
              </Modal>
            </div>
          ) : ( "" )}

          {join ? ( <PlayerJoin
            user={user}
            deletePlayer={deletePlayer}
            goToMenu={showMenu}
            removed={removed}
           /> ) : ( "" )}

          {create ? ( <CreateGame
            user={user}
            deletePlayer={deletePlayer}
            goToMenu={showMenu}
            removed={removed}
          /> ) : ( "" )}

          <div class="d-flex justify-content-center mt-5 mb-2">
            <span class="fw-bold">All players</span>
          </div>
          <div>
            { players.map(player => <Admin
              key={ player._id }
              player={ player }
              onDeleteClick={ deletePlayer }
            />) }
          </div>
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
