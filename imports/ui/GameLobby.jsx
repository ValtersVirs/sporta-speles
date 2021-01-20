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

export const GameLobby = ({ playerName, gameId, deletePlayer, goToMenu }) => {
  const [showStartGame, setShowStartGame] = useState(false)
  const [showLeave, setShowLeave] = useState(false)

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

  const removed = () => {
    goToMenu();
    alert("You have been removed from the game");
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
  }

  const openStartGame = () => setShowStartGame(true)
  const closeStartGame = () => setShowStartGame(false)

  const openLeave = () => setShowLeave(true)
  const closeLeave = () => setShowLeave(false)

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
                <p class="mb-0">{gameType}</p>
                <p>Overtime {game.isOvertime ? <span class="badge bg-success">✓</span> : <span class="badge bg-danger">✕</span>}</p>
                {curPlayer.isAdmin ? (
                  <Fragment>
                    <p class="mb-1">Players in lobby <span class="badge bg-secondary">{curGamePlayers.length}</span></p>
                    <ul className="players">
                      { curGamePlayers.map(player => <Admin
                        key={ player._id }
                        player={ player }
                        onDeleteClick={ deletePlayer }
                      />) }
                    </ul>

                    <button type="button" class="btn btn-primary size" onClick={openStartGame}>Start game</button>

                    <Modal show={showStartGame} onHide={closeStartGame}>
                      <Modal.Body>
                        Are you sure you want to start the game?
                      </Modal.Body>
                      <Modal.Footer>
                      <button type="button" class="btn btn-secondary" onClick={closeStartGame}>Cancel</button>
                      <button type="button" class="btn btn-primary" onClick={gameStart}>Start game</button>
                      </Modal.Footer>
                    </Modal>
                  </Fragment>
                ) : (
                  <Fragment>
                    <p class="mb-2">Players in lobby <span class="badge bg-secondary">{curGamePlayers.length}</span></p>
                    <ul className="players">
                      { curGamePlayers.map(player => <Player
                        key={ player._id }
                        player={ player }
                      />) }
                    </ul>
                  </Fragment>
                )}
              </div>

              {game.gameType === "Team" ? (
                <Fragment>
                  <button type="button" class="btn btn-secondary mb-3 btn-sm" onClick={randomizeTeams}>Random teams</button>
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
                  <button type="button" class="btn btn-danger size" onClick={openLeave}>End game</button>
                ) : (
                  <button type="button" class="btn btn-danger size" onClick={openLeave}>Leave game</button>
                )}

                <Modal show={showLeave} onHide={closeLeave}>
                  <Modal.Body>
                    {curPlayer.isAdmin ? (
                      <span>Are you sure you want to end the game?</span>
                    ) : (
                      <span>Are you sure you want to leave the game?</span>
                    )}
                  </Modal.Body>
                  <Modal.Footer>
                    <button type="button" class="btn btn-secondary" onClick={closeLeave}>Cancel</button>
                    <button type="button" class="btn btn-primary" onClick={curPlayer.isAdmin ? endGame : leaveGame}>
                      {curPlayer.isAdmin ? "End Game" : "Leave Game"}
                    </button>
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
