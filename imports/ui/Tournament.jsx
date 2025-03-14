import React, { useState, useEffect, useRef, Fragment } from 'react'
import { Meteor } from 'meteor/meteor';
import { Modal } from 'react-bootstrap';
import { PlayersCollection } from '/imports/api/PlayersCollection';
import { TeamsCollection } from '/imports/api/TeamsCollection';
import { Player } from './Player';
import { Round } from './Round';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

export const Tournament = ({ part, gameId, gameType, endGame, goToMenu, name, isAdmin }) => {
  const [roundList, setRoundList] = useState([""]);
  const partCurrent = useRef("");
  const callOnce = useRef(0);
  const [update, setUpdate] = useState(0);
  const [round, setRound] = useState('')
  const isWinner = useRef(false);
  const [showLeave, setShowLeave] = useState(false);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

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

  useEffect(() => {
    if (round === 0 && roundList.length === 1) {
      setShowLeft(false)
      setShowRight(false)
    } else if (round === 0 && roundList.length > 1) {
      setShowLeft(false)
      setShowRight(true)
    } else if (round === (roundList.length - 1)) {
      setShowLeft(true)
      setShowRight(false)
    } else {
      setShowLeft(true)
      setShowRight(true)
    }
  }, [round])

  const matchLoser = ( index, winnerScore, loserScore, points ) => {
    var loser = partCurrent.current[index].name;
    var winner = index % 2 ? index - 1 : index + 1;
    partCurrent.current[index].status = "lost";
    let winnerName = partCurrent.current[winner].name
    Meteor.call('matchCompleted', winnerName, loser, winnerScore, loserScore, gameId, gameType, points, (err, res) => {
      if (roundList[roundList.length - 1].length === 2) {
        Meteor.call('setWinner', gameId, gameType, winnerName)
      }
    })
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

  const leaveGame = () => {
    Meteor.call('leaveStartedGame', name, (err, res) => {
      goToMenu();
    })
  }

  const openLeave = () => setShowLeave(true)
  const closeLeave = () => setShowLeave(false)

  return (
    <div class="d-flex align-items-center flex-column">
      <div class="row mb-3 size">
        <div class="col-6 d-flex justify-content-start p-0">
          {showLeft ? (
            <button type="button" class="btn btn-main d-flex justify-content-center align-items-center" onClick={prevRound}><FaArrowLeft/></button>
          ) : ""}
        </div>
        <div class="col-6 d-flex justify-content-end p-0">
          {showRight ? (
            <button type="button" class="btn btn-main d-flex justify-content-center align-items-center" onClick={nextRound}><FaArrowRight/></button>
          ) : ""}
        </div>
      </div>
      {tournament[round]}
      {isAdmin ? (
        <button type="button" class="btn btn-main size mt-4" onClick={openLeave}>End game</button>
      ) : (
        <button type="button" class="btn btn-main size mt-4" onClick={openLeave}>Leave game</button>
      )}

      <Modal show={showLeave} onHide={closeLeave} centered>
        <Modal.Body>
          <div class="d-flex justify-content-center">
            {isAdmin ? (
              <span>Are you sure you want to end the game?</span>
            ) : (
              <span>Are you sure you want to leave the game?<br/>You will not be able to join back.</span>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div class="w-100 d-flex justify-content-center">
            <button type="button" class="btn btn-cancel me-2" onClick={closeLeave}>Cancel</button>
            <button type="button" class="btn btn-ok" onClick={isAdmin ? endGame : leaveGame}>
              {isAdmin ? "End Game" : "Leave Game"}
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
