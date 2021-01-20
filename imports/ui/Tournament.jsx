import React, { useState, useEffect, useRef, Fragment } from 'react'
import { Meteor } from 'meteor/meteor';
import { Modal } from 'react-bootstrap';
import { PlayersCollection } from '/imports/api/PlayersCollection';
import { TeamsCollection } from '/imports/api/TeamsCollection';
import { Player } from './Player';

export const Tournament = ({ part, gameId, gameType, endGame, goToMenu, name, isAdmin }) => {
  const [roundList, setRoundList] = useState([""]);
  const partCurrent = useRef("");
  const callOnce = useRef(0);
  const [update, setUpdate] = useState(0);
  const [round, setRound] = useState('')
  const [winner, setWinner] = useState(false);
  const temp = useRef(false);
  const [showLeave, setShowLeave] = useState(false);

  console.log("page re-render");

  const collection = gameType === "Team" ? TeamsCollection : PlayersCollection;

  useEffect(() => {
    Meteor.call('setId', gameId, gameType, (err, res) => {
      var rounds = []
      const maxRound = collection.findOne({ gameId: gameId }, {
        sort: { round: -1 }
      }).round;

      const maxRoundCount = collection.find({
        gameId: gameId,
        round: maxRound,
      }).count()

      const totalParticipants = collection.find({ gameId: gameId }).count()

      const completedRounds = maxRound - (maxRoundCount === Math.ceil(totalParticipants / Math.pow(2, maxRound - 1)) ? 0 : 1)

      for (let n = 0; n < completedRounds; n++) {
        rounds[n] = collection.find({
          gameId: gameId,
          round: { $gt: n },
        }, {
          sort: { nr: 1 }
        }).fetch()
      }

      partCurrent.current = rounds[rounds.length - 1];
      setRoundList(rounds);
    });
  }, []);

  useEffect(() => {
      const maxRound = collection.findOne({ gameId: gameId }, {
        sort: { round: -1 }
      }).round;

      const maxRoundCount = collection.find({
        gameId: gameId,
        round: maxRound,
      }).count();

      const totalParticipants = collection.find({ gameId: gameId }).count()

      let x = totalParticipants
      let i = 0
      let count = 0
      let participantCount = 0

      while (count < maxRound - 1) {
        if (x % 2) {
          if (i == 1) {
            x = x + 1
            i = 0
          } else {
            x = x - 1
            i = 1
          }
        }
        participantCount = x / 2
        x = x / 2

        count++
      }

      const completedRounds = maxRound - (maxRoundCount >= participantCount ? 0 : 1)

      const curRound = collection.find({
        gameId: gameId,
        round: { $gt: completedRounds - 1 }
      }, {
        sort: { nr: 1 }
      }).fetch()

      partCurrent.current = curRound;
  });

  useEffect(() => {
      const maxRound = collection.findOne({ gameId: gameId }, {
        sort: { round: -1 }
      }).round;

      const maxRoundCount = collection.find({
        gameId: gameId,
        round: maxRound,
      }).count();

      const totalParticipants = collection.find({ gameId: gameId }).count()

      let x = totalParticipants
      let i = 0
      let count = 0
      let participantCount = 0

      while (count < maxRound - 1) {
        if (x % 2) {
          if (i == 1) {
            x = x + 1
            i = 0
          } else {
            x = x - 1
            i = 1
          }
        }
        participantCount = x / 2
        x = x / 2

        count++
      }

      let isOdd = roundList[roundList.length - 1].length % 2 ? 1 : 0;

      const completedRounds = maxRound - (maxRoundCount >= participantCount ? 0 : 1)

      if (partCurrent.current.length === (roundList[roundList.length - 1].length - isOdd) / 2) {
        if (partCurrent.current.length !== roundList[roundList.length - 1].length - isOdd) {
          callOnce.current = callOnce.current + 1;
          if (isOdd && callOnce.current === 1 && partCurrent.current !== roundList[roundList.length -1]) {
            Meteor.call('oddParticipant', gameId, gameType, maxRound, (err, res) => {
              if (err) {
              } else {
                partCurrent.current = collection.find({
                  gameId: gameId,
                  round: { $gt: maxRound - 1 }
                }, {
                  sort: { nr: 1 }
                }).fetch()
                callOnce.current = 0;
                setRoundList(roundList => [...roundList, partCurrent.current]);
              }
            })
          } else if (callOnce.current === 1) {
            callOnce.current = 0;
            setRoundList(roundList => [...roundList, partCurrent.current]);
          }
        }
      }
  }, [partCurrent.current])

  useEffect(() => {
      setRound(roundList.length - 1)
  }, [roundList])

  const nextRound = () => {
    if (round < roundList.length - 1) setRound(round + 1)
  }

  const prevRound = () => {
    if (round > 0) setRound(round - 1)
  }

  const matchLoser = ( index, winnerScore, loserScore ) => {
    var loser = partCurrent.current[index].name;
    var winner = index % 2 ? index - 1 : index + 1;
    partCurrent.current[index].status = "lost";
    Meteor.call('matchCompleted', partCurrent.current[winner].name, loser, winnerScore, loserScore, gameId, gameType)
  };

  const tournament = roundList.map((a, index) =>
    <Round
      key={index}
      participants={a}
      roundNr={index + 1}
      gameId={gameId}
      gameType={gameType}
      collection={collection}
      isAdmin={isAdmin}
      matchLoser={matchLoser}
    />
  )

  if (roundList[roundList.length - 1].length === 1 && temp.current === false) {
    temp.current = true
    setWinner(true)
  }

  const leaveGame = () => {
    Meteor.call('leaveStartedGame', name, (err, res) => {
      goToMenu();
    })
  }

  const openLeave = () => setShowLeave(true)
  const closeLeave = () => setShowLeave(false)

  return (
    <div class="d-flex align-items-center flex-column">
      <div class="row mb-3">
        <div class="col-6">
          <button type="button" class="btn btn-secondary" onClick={prevRound}>&lt;</button>
        </div>
        <div class="col-6">
          <button type="button" class="btn btn-secondary" onClick={nextRound}>&gt;</button>
        </div>
      </div>
      <div class="size">{tournament[round]}</div>
      {isAdmin ? (
        <button type="button" class="btn btn-danger size" onClick={openLeave}>End game</button>
      ) : (
        <button type="button" class="btn btn-danger size" onClick={openLeave}>Leave game</button>
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
};

const Ranking = ({ collection, gameId }) => {
  const participants = collection.find({ gameId }, {
    sort: { winner: -1, points: -1, _id: 1 }
  })

  return (
    <div class="d-flex align-items-center flex-column mb-3">
      <p class="h4">Leaderboard</p>
      <table class="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Name</th>
            <th scope="col">Points</th>
          </tr>
        </thead>
        <tbody>
          { participants.map((p, index) => <RankingPlayer
            key={p._id}
            player={p}
            place={index + 1}
          />) }
        </tbody>
      </table>
    </div>
  );
}

const RankingPlayer = ({ player, place }) => {
  return (
    <Fragment>
      <tr>
        <th scope="row">{place}</th>
        <td scope="row">{player.name}</td>
        <td scope="row">{player.points}</td>
      </tr>
    </Fragment>
  );
}

const Round = ({ participants, roundNr, gameId, gameType, collection, isAdmin, matchLoser }) => {
  let round = []

  let a = 0;

  if (participants.length % 2) a = 1;

  if (participants.length === 1) {
    const winnerCount = collection.find({ gameId: gameId, winner: true }).count()

    if (winnerCount === 0) Meteor.call('setWinner', gameId, gameType, participants[0].name)

    return (
      <Ranking
        collection={collection}
        gameId={gameId}
      />
    );
  } else {
    for (let i = 0; i < (participants.length - a) / 2; i++) {
      let match = []
      let disabled = false
      let matchParticipants = []
      for (let j = 0 + (2 * i); j < 2 + (2 * i); j++) {
        if (collection.findOne({ name: participants[j].name, gameId: gameId }).status === "lost") {
          disabled = true;
        }
        matchParticipants = [...matchParticipants, participants[j]]
        if (j % 2) match.push(<div class="col-2 d-flex justify-content-center">vs</div>,<Participant key={participants[j].name} participant={participants[j]} />)
        else match.push(<Participant key={participants[j].name} participant={participants[j]} />)
      }
      round.push(<Match key={i} match={match} gameId={gameId} collection={collection} matchNr={i} participants={matchParticipants} isAdmin={isAdmin} disabled={disabled} matchLoser={matchLoser} />)
    }

    return (
      <div class="d-flex align-items-center flex-column">
        <p class="h4">Round {roundNr}</p>
        <div class="d-flex align-items-center flex-column w-100">{round}</div>
      </div>
    );
  }
}

const Match = ({ match, gameId, collection, matchNr, participants, isAdmin, disabled, matchLoser }) => {
  const [isDisabled, setIsDisabled] = useState(disabled);
  const [teamOne, setTeamOne] = useState('');
  const [teamTwo, setTeamTwo] = useState('');
  const [saveDisabled, setSaveDisabled] = useState(true);
  const [show, setShow] = useState(false)

  const matchParticipants = participants.map(x => collection.findOne({ name: x.name, gameId: gameId }))

  var hideButton = ""

  var score = []
  var color = []

  if (isDisabled === true) {
    const loser = matchParticipants.filter(x => {
      return x.status === "lost"
    })

    if (matchParticipants[0].status === "lost") {
      score = [loser[0].loserScore, loser[0].winnerScore]
      color = ["danger", "success"]
    }
    else {
      score = [loser[0].winnerScore, loser[0].loserScore]
      color = ["success", "danger"]
    }

    hideButton = "d-none"
  }

  const showModal = () => setShow(true)
  const closeModal = () => setShow(false)

  const handleClick = (i) => {
    alert(`matchNr = ${matchNr}`)
    matchLoser(i + (2 * matchNr))
    disable();
  };

  const scoreSubmit = () => {
    if (teamOne > teamTwo) matchLoser(1 + (2 * matchNr), teamOne, teamTwo)
    else matchLoser(0 + (2 * matchNr), teamTwo, teamOne)
    closeModal()
  }

  const teamOneChange = e => {
    const re = /^[0-9\b]+$/;
    if (!e.target.value) {
      setTeamOne("")
    } else if (re.test(e.target.value)) {
      setTeamOne(Number(e.target.value))
    }
  }

  const teamTwoChange = e => {
    const re = /^[0-9\b]+$/;
    if (!e.target.value) {
      setTeamTwo("")
    } else if (re.test(e.target.value)) {
      setTeamTwo(Number(e.target.value))
    }
  }

  useEffect(() => {
    if (disabled === true) setIsDisabled(true)
  }, [disabled])

  useEffect(() => {
    if (teamOne === '' || teamTwo === '') setSaveDisabled(true)
    else if (teamOne === teamTwo) setSaveDisabled(true)
    else setSaveDisabled(false)
  }, [teamOne, teamTwo])

  const disable = () => setIsDisabled(true);

  return (
    <div class="mb-4 w-100">
      <div class="row">
        {match}
      </div>
      {isDisabled ? (
        <div class="row">
          <div class="col-5 d-flex justify-content-center">
            <b class={`text-${color[0]}`}>{score[0]}</b>
          </div>
          <div class="col-2 d-flex justify-content-center">
            <span>:</span>
          </div>
          <div class="col-5 d-flex justify-content-center">
            <b class={`text-${color[1]}`}>{score[1]}</b>
          </div>
        </div>
      ) : (
        ""
      )}
      {isAdmin ? (
        <div class="row">
          <div class="col-12 d-flex justify-content-center">
            <button type="button" class={`btn btn-primary btn-sm ${hideButton}`} onClick={showModal} disabled={isDisabled}>Set score</button>
          </div>
        </div>
      ) : (
        ""
      )}

      <Modal show={show} onHide={closeModal}>
        <Modal.Header>
          <Modal.Title>Set score for teams</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div class="row">
            <div class="col-5 d-flex justify-content-center">
              <input
                type="text"
                class="form-control"
                placeholder="Team 1"
                value={teamOne}
                onChange={teamOneChange}
                required
              />
            </div>
            <div class="col-2 d-flex justify-content-center">
              <span>:</span>
            </div>
            <div class="col-5 d-flex justify-content-center">
              <input
                type="text"
                class="form-control"
                placeholder="Team 2"
                value={teamTwo}
                onChange={teamTwoChange}
                required
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" class="btn btn-secondary" onClick={closeModal}>Close</button>
          <button type="button" class="btn btn-primary" onClick={scoreSubmit} disabled={saveDisabled}>Save Changes</button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

const Participant = ({ participant }) => {
  return (
    <div class="col-5 d-flex justify-content-center">
      <b>{participant.name}</b>
    </div>
  );
}
