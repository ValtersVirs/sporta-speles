import React, { useState, useEffect, Fragment } from 'react';
import { Meteor } from 'meteor/meteor';
import { Modal } from 'react-bootstrap';
import { PlayersCollection } from '/imports/api/PlayersCollection';
import { GamesCollection } from '/imports/api/GamesCollection';

export const Leaderboard = ({ gameId, name, isAdmin, endGame, goToMenu }) => {
  const [disqualified, setDisqualified] = useState(false)
  const [showLeave, setShowLeave] = useState(false)

  const leaveGame = () => {
    Meteor.call('leaveLeaderboardGame', name, (err, res) => {
      goToMenu();
    })
  }

  const openLeave = () => setShowLeave(true)
  const closeLeave = () => setShowLeave(false)

  return (
    <div class="d-flex align-items-center flex-column">
      <div>
        Leaderboard
      </div>
      <div>
        <LeaderboardPlayers
          gameId={gameId}
          isAdmin={isAdmin}
        />
      </div>
      {isAdmin ? (
        <button type="button" class="btn btn-danger" onClick={openLeave}>End game</button>
      ) : (
        <button type="button" class="btn btn-danger" onClick={openLeave}>Leave game</button>
      )}

      <Modal show={showLeave} onHide={closeLeave}>
        <Modal.Body>
          {isAdmin ? (
            <span>Are you sure you want to end the game?</span>
          ) : (
            <span>Are you sure you want to leave the game?<br/>You will not be able to join back.</span>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button type="button" class="btn btn-secondary" onClick={closeLeave}>Cancel</button>
          <button type="button" class="btn btn-primary" onClick={isAdmin ? endGame : leaveGame}>
            {isAdmin ? "End Game" : "Leave Game"}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

const LeaderboardPlayers = ({ gameId, isAdmin }) => {
  const scoreType = GamesCollection.findOne({ gameId: gameId }).scoreType

  if (scoreType === "Time") {
    var players = PlayersCollection.find({ gameId: gameId }, {
      sort: { points: 1, _id: 1 }
    }).fetch()
  } else {
    const hasScore = PlayersCollection.find({ gameId: gameId, points: {
      $type: "double"
    } }, {
      sort: { points: -1, _id: 1 }
    }).fetch()

    const noScore = PlayersCollection.find({ gameId: gameId, points: {
      $type: "string"
    } }, {
      sort: { _id: 1 }
    }).fetch()

    var players = [...hasScore, ...noScore]
  }

  return (
    <div>

      <table class="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Name</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, index) => <LeaderboardPlayer
            key={p.name}
            player={p}
            isAdmin={isAdmin}
            scoreType={scoreType}
            placeTemp={index + 1}
          /> )}
        </tbody>
      </table>
    </div>
  );
}

const LeaderboardPlayer = ({ player, isAdmin, scoreType, placeTemp }) => {
  const [score, setScore] = useState(player.points);

  const addPoints = () => {
    Meteor.call('addPoints', player);
  }

  const removePoints = () => {
    Meteor.call('removePoints', player);
  }

  const saveScore = () => {
    if (scoreType === "Time") {
      if (score === "") {
        Meteor.call('updateScore', player, score);
      } else if (/[0-5][0-9]:[0-5][0-9]\.[0-9]{2}/.test(score)) {
        const mm = Number(score.match(/(?:.*?[0-9]+){0}.*?([0-9]+)/s)[1])
        const ss = Number(score.match(/(?:.*?[0-9]+){1}.*?([0-9]+)/s)[1])
        const ms = Number(score.match(/(?:.*?[0-9]+){2}.*?([0-9]+)/s)[1])
        console.log(`minutes = ${mm}`);
        console.log(`seconds = ${ss}`);
        console.log(`milliseconds = ${ms}`);

        const convertedScore = ms + ss * 100 + mm * 100 * 60

        Meteor.call('updateScore', player, convertedScore);
      } else {
        alert("error")
      }
    } else {
      Meteor.call('updateScore', player, score);
    }
  }

  useEffect(() => {
    if (scoreType === "Time") {
      if (!player.points) {
        setScore("")
      } else if (player.points === "DQ") {
        setScore("")
      } else {
        let points = player.points
        let mm = Math.floor(points / 6000)
        points = points - mm * 6000
        let ss = Math.floor(points / 100)
        points = points - ss * 100
        let ms = points

        if (mm < 10) mm = `0${mm}`
        if (ss < 10) ss = `0${ss}`
        if (ms < 10) ms = `0${ms}`

        const convertedScore = `${mm}:${ss}.${ms}`
        setScore(convertedScore)
      }
    } else {
      setScore(player.points)
    }
  }, [player.points])

  const points = (player.points && player.points !== "DQ") || player.points === 0 ? `${score}` : ""

  const place = player.points === "DQ" ? `X` : player.points || player.points === 0 ? `${placeTemp}` : ""

  const onScoreChange = e => {
    if (scoreType === "Time") {
      const re = new RegExp ([
        '^(?:',
        '[0-5]|',
        '[0-5][0-9]|',
        '[0-5][0-9]:|',
        '[0-5][0-9]:[0-5]|',
        '[0-5][0-9]:[0-5][0-9]|',
        '[0-5][0-9]:[0-5][0-9]\\.|',
        '[0-5][0-9]:[0-5][0-9]\\.[0-9]{1,2})$'
      ].join(''));

      if (re.test(e.target.value)) {
        setScore(e.target.value)
      } else if (e.target.value === '') {
        setScore('')
      }
    } else {
      const re = /^[0-9\b]+$/;
      if (re.test(e.target.value)) {
        setScore(Number(e.target.value))
      } else if (e.target.value === '') {
        setScore('')
      }
    }
  }

  const disqualify = () => {
    Meteor.call('disqualify', player.name, (err, res) => {

    })
  }

  const placeholder = scoreType === "Time" ? "mm:ss.ms" : "points"

  return (
    <Fragment>
      <tr>
        <th scope="row" class="align-middle">{place}</th>
        <td class="align-middle">{player.name}</td>
        <td>
          {isAdmin ? (
            <Fragment>
              <input
                className="score"
                type="text"
                size="8"
                placeholder={placeholder}
                value={score}
                onChange={onScoreChange}
              />
              <button type="button" class="btn btn-primary btn-sm me-1" onClick={saveScore}>Save</button>
              <button type="button" class="btn btn-danger btn-sm" onClick={disqualify}>&times;</button>
            </Fragment>
          ) : (
            <Fragment>
              {points}
            </Fragment>
          )}
        </td>
      </tr>
    </Fragment>
  );
}
