import React, { useState, Fragment } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Modal } from 'react-bootstrap';
import { PlayersCollection } from '/imports/api/PlayersCollection';
import { GamesCollection } from '/imports/api/GamesCollection';
import { TeamsCollection } from '/imports/api/TeamsCollection';
import { Player } from './Player';
import { Admin } from './Admin'
import { Tournament } from './Tournament';
import { Leaderboard } from './Leaderboard';
import { Teams } from './Teams'
import { FaRandom, FaTimes, FaCheck } from 'react-icons/fa';

export const GameLobby = ({ playerName, gameId, deletePlayer, goToMenu, removed }) => {
  const [showStartGame, setShowStartGame] = useState(false)
  const [showLeave, setShowLeave] = useState(false)
  const [showRandom, setShowRandom] = useState(false)

  const game = useTracker( () => GamesCollection.findOne( { gameId: gameId } ));
  const curGameTeams = useTracker( () => TeamsCollection.find({ gameId: gameId }, {
    sort: { createdAt: 1 }
  }).fetch());
  const curPlayer = PlayersCollection.findOne( { name: playerName, gameId: gameId } );
  const curGamePlayers = useTracker( () => PlayersCollection.find({ gameId: gameId }, {
    sort: { createdAt: 1 }
  }).fetch());

  const tournamentParticipants = (game.gameType === "Team" ? (
    curGameTeams
  ) : (
    curGamePlayers
  ))

  const gameStart = () => {
    closeStartGame()

    game.gameType === "Leaderboard" ? (
      Meteor.call('leaderboardStart', game.gameId, (err, res) => {
        Meteor.call('gameStart', game.gameId);
      })
    ) : (
      Meteor.call('firstRound', game.gameId, game.gameType, (err, res) => {
        Meteor.call('gameStart', game.gameId);
      })
    )
  }

  const leaveGame = () => {
    Meteor.call('leaveGame', curPlayer, (err, res) => {
      goToMenu();
    })
  }

  const endGame = () => {
    goToMenu();
    Meteor.call('gameEnd', gameId, (err, res) => {
    })
  }

  var gameType
  if (game.gameType === "Individual") gameType = "Individual game"
  else if (game.gameType === "Team") gameType = "Team game"
  else if (game.gameType === "Leaderboard") gameType = "Leaderboard"

  const randomizeTeams = () => {
    let arr = []

    for (let i = 0; i < curGamePlayers.length; i++) {
      arr.push(curGamePlayers[i].name)
    }

    let newArr = [...arr]

    newArr = newArr.sort(() => Math.random() - 0.5)

    Meteor.call('clearTeams', gameId, (err, res) => {
      Meteor.call('randomizeTeams', gameId, newArr, curGameTeams)
    })

    closeRandom()
  }

  const openStartGame = () => setShowStartGame(true)
  const closeStartGame = () => setShowStartGame(false)

  const openLeave = () => setShowLeave(true)
  const closeLeave = () => setShowLeave(false)

  const openRandom = () => setShowRandom(true)
  const closeRandom = () => setShowRandom(false)

  return (
    <div>
      {curPlayer ? (
        <Fragment>
          {game.gameStart ? (
            <Fragment>
              {game.gameType === "Leaderboard" ? (
                <Leaderboard
                  gameId={gameId}
                  name={curPlayer.name}
                  isAdmin={curPlayer.isAdmin}
                  endGame={endGame}
                  goToMenu={goToMenu}
                />
              ) : (
                <Tournament
                  part={tournamentParticipants}
                  gameId={game.gameId}
                  gameType={game.gameType}
                  endGame={endGame}
                  goToMenu={goToMenu}
                  name={curPlayer.name}
                  isAdmin={curPlayer.isAdmin}
                />
              )}
            </Fragment>
          ) : (
            <div class="d-flex align-items-center flex-column">
              <div class="d-flex align-items-center flex-column mb-3">
                <p class="h1">{game.gameId}</p>
                <hr class="m-0" />
                <p class="mb-0 mt-2">{gameType}</p>
                <p class="d-flex mb-2">Overtime {game.isOvertime ?
                  <span class="badge bg-success d-flex justify-content-center align-items-center box-25px ms-1 p-0"><FaCheck/></span> :
                  <span class="badge bg-danger d-flex justify-content-center align-items-center box-25px ms-1 p-0"><FaTimes/></span>}
                </p>
                <hr class="m-0 mb-2" />
                {curPlayer.isAdmin ? (
                  <Fragment>
                    <p class="mb-1">Players in lobby <span class="badge bg-secondary">{curGamePlayers.length}</span></p>
                    <div>
                      { curGamePlayers.map(player => <Admin
                        key={ player._id }
                        player={ player }
                        onDeleteClick={ deletePlayer }
                      />) }
                    </div>

                    <button type="button" class="btn btn-main size" onClick={openStartGame}>Start game</button>

                    <Modal show={showStartGame} onHide={closeStartGame} centered>
                      <Modal.Body>
                        <div class="d-flex justify-content-center">
                          <span>Are you sure you want to start the game?</span>
                        </div>
                      </Modal.Body>
                      <Modal.Footer>
                        <div class="w-100 d-flex justify-content-center">
                          <button type="button" class="btn btn-cancel me-2" onClick={closeStartGame}>Cancel</button>
                          <button type="button" class="btn btn-ok" onClick={gameStart}>Start game</button>
                        </div>
                      </Modal.Footer>
                    </Modal>
                  </Fragment>
                ) : (
                  <Fragment>
                    <p class="mb-2">Players in lobby <span class="badge bg-secondary">{curGamePlayers.length}</span></p>
                    <div>
                      { curGamePlayers.map(player => <Player
                        key={ player._id }
                        player={ player }
                      />) }
                    </div>
                  </Fragment>
                )}
              </div>

              {game.gameType === "Team" ? (
                <Fragment>
                  {curPlayer.isAdmin ? (
                    <Fragment>
                      <button type="button" class="btn btn-main mb-3 btn-sm d-flex align-items-center" onClick={openRandom}><FaRandom/>&nbsp;Teams</button>

                      <Modal show={showRandom} onHide={closeRandom} centered>
                        <Modal.Body>
                          <div class="d-flex justify-content-center">
                            <span>Are you sure you want to randomize teams?</span>
                          </div>
                        </Modal.Body>
                        <Modal.Footer>
                          <div class="w-100 d-flex justify-content-center">
                            <button type="button" class="btn btn-cancel me-2" onClick={closeRandom}>Cancel</button>
                            <button type="button" class="btn btn-ok" onClick={randomizeTeams}>Randomize</button>
                          </div>
                        </Modal.Footer>
                      </Modal>
                    </Fragment>
                  ) : ""}
                  <Teams
                    gameId={game.gameId}
                    player={curPlayer}
                    maxPlayers={game.teamSize}
                    isAdmin={curPlayer.isAdmin}
                  />
                </Fragment>
              ) : "" }

              <div>
                {curPlayer.isAdmin ? (
                  <button type="button" class="btn btn-main2 size" onClick={openLeave}>End game</button>
                ) : (
                  <button type="button" class="btn btn-main2 size" onClick={openLeave}>Leave game</button>
                )}

                <Modal show={showLeave} onHide={closeLeave} centered>
                  <Modal.Body>
                    <div class="d-flex justify-content-center">
                      {curPlayer.isAdmin ? (
                        <span>Are you sure you want to end the game?</span>
                      ) : (
                        <span>Are you sure you want to leave the game?</span>
                      )}
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <div class="w-100 d-flex justify-content-center">
                      <button type="button" class="btn btn-cancel me-2" onClick={closeLeave}>Cancel</button>
                      <button type="button" class="btn btn-ok" onClick={curPlayer.isAdmin ? endGame : leaveGame}>
                        {curPlayer.isAdmin ? "End Game" : "Leave Game"}
                      </button>
                    </div>
                  </Modal.Footer>
                </Modal>
              </div>
            </div>
          )}
        </Fragment>
      ) : (
        <div>
          {removed()}
        </div>
      )}
    </div>
  );
};
