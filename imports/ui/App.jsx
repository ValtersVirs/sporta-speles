import React, { useState, useEffect, Fragment } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { PlayersCollection } from '/imports/api/PlayersCollection';
import { Login } from './Login';
import { Admin } from './Admin';
import { PlayerJoin } from './PlayerJoin';
import { CreateGame } from './CreateGame';
import { Settings } from './Settings';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import { BsFillGearFill } from 'react-icons/bs';

export const App = () => {
  const [join, setJoin] = useState(false);
  const [create, setCreate] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [game, setGame] = useState("")
  const [leaveText, setLeaveText] = useState("")
  const [showDelete, setShowDelete] = useState(false)
  const [showRemoved, setShowRemoved] = useState(false)
  const [settings, setSettings] = useState(false)

  useEffect(() => {
    Meteor.subscribe('allPlayers');
    Meteor.subscribe('allGames');
    Meteor.subscribe('allTeams');
  }, [])

  const user = useTracker(() => Meteor.user());

  const players = useTracker( () =>
    PlayersCollection.find({}, {
      sort: { createdAt: -1 }
    }).fetch()
  );

  const deletePlayer = ({ _id }) => Meteor.call('playerDelete', _id);

  const logout = () => Meteor.logout();

  const showMenu = () => {
    setJoin(false);
    setCreate(false);
    setSettings(false);
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

  const openSettings = () => {
    setSettings(true);
    setShowButtons(false);
    setJoin(false);
    setCreate(false);
  }

  const openCreate = () => setShowCreate(true)
  const closeCreate = () => setShowCreate(false)

  const openDelete = () => setShowDelete(true)
  const closeDelete = () => setShowDelete(false)

  const openRemoved = () => setShowRemoved(true)
  const closeRemoved = () => setShowRemoved(false)

  return (
    <Fragment>
    <div class="container-fluid min-100 d-flex flex-column">
      <nav class="navbar navbar-custom navbar-expand navbar-dark fixed-top bg-nav mb-0">
        <div class="container-fluid">
          {user ? (
            <Fragment>
              <div class="mr-auto">
                <span class="navbar-text-main fw-bold">{user.username}</span>
              </div>
              <div class="d-flex">
                <button type="button" class="btn btn-nav mx-2 fw-bold" onClick={logout}>Logout</button>
                <button type="button" class="btn btn-nav d-flex align-items-center" onClick={openSettings}><BsFillGearFill/></button>
              </div>
            </Fragment>
          ) : ""}
        </div>
      </nav>
      <div class="row flex-grow-1 bg-main d-flex flex-column" style={{paddingTop: 100, paddingBottom: 100, marginTop: 110, marginBottom: 50}}>
        <div class="px-4">
        {user ? (
          <Fragment>
            {showButtons ? (
              <div class="row gap-3 d-flex justify-content-center">
                <div class="col-12 d-flex justify-content-center">
                  <button type="button" class="btn btn-main size" onClick={joinGame}>Join Game</button>
                </div>
                <hr class="m-0"/>
                <div class="col-12 d-flex justify-content-center">
                  <button type="button" class="btn btn-main size" onClick={createGame}>Create Game</button>

                  <Modal show={showCreate} onHide={closeCreate} centered>
                    <Modal.Body>
                      <div class="d-flex justify-content-center">
                        <span>
                          You are currently in game {game}<br/>
                          By creating a new game you will {leaveText} your current game
                        </span>
                      </div>
                    </Modal.Body>
                    <Modal.Footer>
                      <div class="w-100 d-flex justify-content-center">
                        <button type="button" class="btn btn-cancel me-2" onClick={closeCreate}>Cancel</button>
                        <button type="button" class="btn btn-ok" onClick={() => {
                          closeCreate()
                          setCreate(!join)
                          setShowButtons(false)
                      }}>Continue</button>
                      </div>
                    </Modal.Footer>
                  </Modal>
                </div>

                <Modal show={showRemoved} onHide={closeRemoved} centered>
                  <Modal.Body>
                    <div class="d-flex justify-content-center">
                      <span>You have been removed from the game</span>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <div class="w-100 d-flex justify-content-center">
                      <button type="button" class="btn btn-ok" onClick={closeRemoved}>Ok</button>
                    </div>
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

            {settings ? ( <Settings
              user={user}
              goToMenu={showMenu}
            /> ) : ( "" )}
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
      </div>
    </div>
    </Fragment>
  );
};
