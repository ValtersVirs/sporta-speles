import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Meteor } from 'meteor/meteor';
import { Modal, Collapse } from 'react-bootstrap';
import { GamesCollection } from '/imports/api/GamesCollection';
import { Match } from './Match';

export const Round = ({ participants, roundNr, gameId, gameType, collection, isAdmin, matchLoser }) => {
  const [showTeam, setShowTeam] = useState(() => {
    let arr = []
    let a = 0
    if (participants.length % 2) a = 1;
    for (let i = 0; i < (participants.length - a) / 2; i++) {
      arr = [...arr, {team1: false, team2: false}]
    }
    return arr
  })

  useEffect(() => {
    let arr = []
    let a = 0
    if (participants.length % 2) a = 1;
    for (let i = 0; i < (participants.length - a) / 2; i++) {
      arr = [...arr, {team1: false, team2: false}]
    }
    setShowTeam(arr)
  }, [participants])

  let round = []

  let a = 0;

  const openTeam = (playerNr, matchNr) => {
    let newTeam = [...showTeam]
    if (playerNr === 0) {
      newTeam[matchNr].team1 = !newTeam[matchNr].team1
    } else {
      newTeam[matchNr].team2 = !newTeam[matchNr].team2
    }
    setShowTeam(newTeam)
  }

  if (participants.length % 2) a = 1;

  if (participants.length === 1) {
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
        let number = j % 2
        if (j % 2) match.push(<div key={2} class="col-2 d-flex justify-content-center align-items-center">vs</div>,
          <Participant
            key={participants[j].name}
            participant={participants[j]}
            playerNr={number}
            matchNr={i}
            openTeam={openTeam}
            gameType={gameType}
          />)
        else {
          match.push(<Participant
            key={participants[j].name}
            participant={participants[j]}
            playerNr={number}
            matchNr={i}
            openTeam={openTeam}
            gameType={gameType}
          />)
        }
      }
      round.push(<Match
        key={i}
        match={match}
        gameId={gameId}
        collection={collection}
        matchNr={i}
        maxMatches={(participants.length - a) / 2}
        roundNr={roundNr}
        participants={matchParticipants}
        isAdmin={isAdmin}
        disabled={disabled}
        showTeams={showTeam[i]}
        matchLoser={matchLoser}
      />)
    }

    return (
      <div class="d-flex align-items-center flex-column size">
        <p class="h4">Round {roundNr}</p>
        <div class="d-flex align-items-center flex-column w-100">{round}</div>
      </div>
    );
  }
}

const Participant = ({ participant, playerNr, matchNr, openTeam, gameType }) => {
  const handleClick = () => {
    openTeam(playerNr, matchNr)
  }

  return (
    <Fragment>
    {gameType === "Team" ? (
      <div class="col-5 d-flex justify-content-center align-items-center">
        <div onClick={handleClick} role="button" style={{maxWidth: (224 / 12 * 5) - 24}} class="break-word text-center fw-bold">{participant.name}</div>
      </div>
    ) : (
      <div class="col-5 d-flex justify-content-center align-items-center">
        <div style={{maxWidth: (224 / 12 * 5) - 24}} class="break-word text-center fw-bold">{participant.name}</div>
      </div>
    )}
    </Fragment>
  );
}

const Ranking = ({ collection, gameId }) => {
  const participants = collection.find({ gameId }, {
    sort: { points: -1, wins: -1, winner: -1, _id: 1 }
  })

  return (
    <div class="d-flex align-items-center flex-column mb-3">
      <p class="h4">Leaderboard</p>
      <div style={{minWidth: 200, maxWidth: 300}}>
        <table class="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col" style={{maxWidth: 100}}>Name</th>
              <th scope="col">Points</th>
              <th scope="col">Wins</th>
            </tr>
          </thead>
          <tbody>
            { participants.map((p, index) => <RankingPlayer
              key={p._id}
              participant={p}
              place={index + 1}
              gameId={gameId}
            />) }
          </tbody>
        </table>
      </div>
    </div>
  );
}

const RankingPlayer = ({ participant, place, gameId }) => {
  const [open, setOpen] = useState(false)
  const refRow = useRef(null)

  const gameType = GamesCollection.findOne({ gameId: gameId }).gameType

  const togglePlayers = () => {
    if (participant.players.length) setOpen(!open)
  }

  return (
    <Fragment>
      {gameType === "Team" ? (
        <Fragment>
          <tr role="button" onClick={togglePlayers} aria-controls={`collapse${place}`} aria-expanded={open}>
            <th scope="row">{place}</th>
            <td scope="row" class="text-break">{participant.name}</td>
            <td scope="row">{participant.points}</td>
            <td scope="row">{participant.wins}</td>
          </tr>
          <tr>
            <td class="p-0" style={{borderBottom: "none"}} ref={refRow} colSpan="4">
              <Collapse
                in={open}
                onEnter={() => refRow.current.style.borderBottom = "1px solid white"}
                onExited={() => refRow.current.style.borderBottom = "none"}
              >
                <div id={`collapse${place}`}>
                  <div class="m-0 d-flex flex-column align-items-center" style={{padding: 8}}>
                    {participant.players.map(player => <Player
                      key={player}
                      player={player}
                    />)}
                  </div>
                </div>
              </Collapse>
            </td>
          </tr>
        </Fragment>
      ) : (
        <tr>
          <th scope="row">{place}</th>
          <td scope="row">{participant.name}</td>
          <td scope="row">{participant.points}</td>
          <td scope="row">{participant.wins}</td>
        </tr>
      )}
    </Fragment>
  );
}

const Player = ({ player }) => {
  return (
    <span class="text-break text-center">{player}</span>
  );
}
