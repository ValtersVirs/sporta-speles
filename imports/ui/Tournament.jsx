import React, { useState, useEffect, useRef } from 'react'
import { Meteor } from 'meteor/meteor';
import { PlayersCollection } from '/imports/api/PlayersCollection';
import { Player } from './Player';

export const Tournament = ({ part, gameId, gameType, endGame, isAdmin }) => {
  const [roundList, setRoundList] = useState([""]);
  const partCurrent = useRef("");
  const isInitialMount = useRef(0);
  const callOnce = useRef(0);

  const [update, setUpdate] = useState(0);

  console.log("main roundList");
  console.log(roundList);

  console.log("main partCurrent:");
  console.log(partCurrent.current);

  useEffect(() => {
    Meteor.call('setId', gameId, gameType, (err, res) => {
      var rounds = []
      const maxRound = PlayersCollection.findOne({ gameId: gameId }, {
        sort: { round: -1 }
      }).round;

      const maxRoundCount = PlayersCollection.find({
        gameId: gameId,
        round: maxRound,
      }).count()

      const totalParticipants = PlayersCollection.find({ gameId: gameId }).count()

      const completedRounds = maxRound - (maxRoundCount === Math.ceil(totalParticipants / Math.pow(2, maxRound - 1)) ? 0 : 1)

      console.log(`onMount completedRounds ${completedRounds}`);

      for (let n = 0; n < completedRounds; n++) {
        rounds[n] = PlayersCollection.find({
          gameId: gameId,
          round: { $gt: n },
        }, {
          sort: { nr: 1 }
        }).fetch()
      }

      console.log("onMount rounds:");
      console.log(rounds);

      partCurrent.current = rounds[rounds.length - 1];
      setRoundList(rounds);
    });
  }, []);

  useEffect(() => {
    if (isInitialMount.current <= 2) {
      isInitialMount.current += 1;
    } else {

      console.log("useEffect");

      const maxRound = PlayersCollection.findOne({ gameId: gameId }, {
        sort: { round: -1 }
      }).round;

      const maxRoundCount = PlayersCollection.find({
        gameId: gameId,
        round: maxRound,
      }).count();

      const totalParticipants = PlayersCollection.find({ gameId: gameId }).count()

      const completedRounds = maxRound - (maxRoundCount >= Math.floor(totalParticipants / Math.pow(2, maxRound - 1)) ? 0 : 1)

      let x = totalParticipants
      let i = 0
      let count = 0
      let participantCount = 0

      while (x > 1 || i == 1) {
        participantCount = x
        if (x % 2) {
          if (i == 1) {
            x = x + 1
            participantCount = x
            i = 0
          } else {
            x = x - 1
            participantCount = x
            i = 1
          }
        }
        x = x / 2
        count++
      }

      const curRound = PlayersCollection.find({
        gameId: gameId,
        round: { $gt: completedRounds - 1 }
      }, {
        sort: { nr: 1 }
      }).fetch()

      partCurrent.current = curRound;

      console.log("useEffect partCurrent");
      console.log(partCurrent.current);
    }
  });

  useEffect(() => {
    if (!isInitialMount.current <= 2) {
      const maxRound = PlayersCollection.findOne({ gameId: gameId }, {
        sort: { round: -1 }
      }).round;

      const maxRoundCount = PlayersCollection.find({
        gameId: gameId,
        round: maxRound,
      }).count();

      const totalParticipants = PlayersCollection.find({ gameId: gameId }).count()

      const completedRounds = maxRound - (maxRoundCount >= Math.floor(totalParticipants / Math.pow(2, maxRound - 1)) ? 0 : 1)

      let isOdd = roundList[roundList.length - 1].length % 2 ? 1 : 0;

      console.log("got here 1 ----------------------------");
      console.log("partCurrent.current");
      console.log(partCurrent.current);
      console.log("roundList[roundList.length - 1]");
      console.log(roundList[roundList.length - 1]);

      if (partCurrent.current.length === (roundList[roundList.length - 1].length - isOdd) / 2) {
        console.log("got here 2 ----------------------------");
        console.log("partCurrent.current.length");
        console.log(partCurrent.current.length);
        console.log("roundList[roundList.length - 1].length");
        console.log(roundList[roundList.length - 1].length);
        if (partCurrent.current.length !== roundList[roundList.length - 1].length - isOdd) {
          console.log("got here 3 ----------------------------");
          callOnce.current = callOnce.current + 1;
          console.log(`callOnce = ${callOnce.current}`);
          console.log(`isOdd = ${isOdd}`);
          if (isOdd && callOnce.current === 1 && partCurrent.current !== roundList[roundList.length -1]) {
            console.log("isOdd called");
            console.log(`maxRound = ${maxRound}`);
            Meteor.call('oddParticipant', gameId, gameType, maxRound, (err, res) => {
              if (err) {
                console.log('nextRound error');
                console.log(err);
              } else {
                partCurrent.current = PlayersCollection.find({
                  gameId: gameId,
                  round: { $gt: maxRound - 1 }
                }, {
                  sort: { nr: 1 }
                }).fetch()
                console.log("isOdd partCurrent");
                console.log(partCurrent.current);
                callOnce.current = 0;
                setRoundList(roundList => [...roundList, partCurrent.current]);
              }
            })
          } else if (callOnce.current === 1) {
            console.log("isntOdd");
            callOnce.current = 0;
            setRoundList(roundList => [...roundList, partCurrent.current]);
          }
        }
      }
    }
  }, [partCurrent.current])

  const matchLoser = ( index ) => {
    console.log("f -------------------");
    console.log("f partCurrent.current:");
    console.log(partCurrent.current);
    console.log("f roundList[last]");
    console.log(roundList[roundList.length - 1]);
    var loser = partCurrent.current[index].name;
    var winner = index % 2 ? index - 1 : index + 1;
    console.log(`f winner ${partCurrent.current[winner].name}, index ${winner} before`);
    console.log(`f loser ${loser}, index ${index} before`);
    partCurrent.current[index].status = "lost";
    Meteor.call('matchCompleted', partCurrent.current[winner].name, loser, gameId, gameType, (err, res) => {
      console.log(`f winner ${partCurrent.current[winner].name} after`);
      console.log(`f loser ${loser} after`);
      console.log('f partCurrent array:');
      console.log(partCurrent.current);
      console.log('f roundList array:');
      console.log(roundList);
      console.log("f PlayersCollection.find()");
      console.log(PlayersCollection.find({ gameId: gameId }).fetch());
    })
  };

  const tournament = roundList.map((a, index) =>
    <Round
      key={index}
      participants={a}
      roundNr={index + 1}
      matchLoser={matchLoser}
    />
  )

  return (
    <div>
      Tournament
      <div>{tournament}</div>
      <div><Participants part={part}/></div>
      {isAdmin ? (
          <button onClick={endGame}>End game</button>
      ) : ""}
    </div>
  );
};

const Participants = ({ part }) => {
  return (
    <div>
    Participants
    <ul className="players">
      { part.map(p => <Player
        key={ p._id }
        player={ p }
      />) }
    </ul>
    </div>
  );
};

const Round = ({ participants, roundNr, matchLoser }) => {
  let round = []

  let a = 0;

  if (participants.length % 2) a = 1;

  if (participants.length === 1) {
    return <div>Winner {participants[0].name}</div>
  } else {
    for (let i = 0; i < (participants.length - a) / 2; i++) {
      let match = []
      let disabled = false
      for (let j = 0 + (2 * i); j < 2 + (2 * i); j++) {
        if (PlayersCollection.findOne({ name: participants[j].name }).status === "lost") {
          disabled = true;
        }
        match.push(<Participant key={participants[j].name} participant={participants[j]} />)
      }
      round.push(<Match key={i} match={match} matchNr={i} disabled={disabled} matchLoser={matchLoser} />)
    }
    return (
      <div className="round">
        <div>Round {roundNr}</div>
        <div className="round-list" >{round}</div>
      </div>
    );
  }
}

const Match = ({ match, matchNr, disabled, matchLoser }) => {
  const [isDisabled, setIsDisabled] = useState(disabled);

  const handleClick = (i) => {
    matchLoser(i + (2 * matchNr))
    disable();
  };

  const disable = () => setIsDisabled(true);

  return (
    <div>
      <ul className="match-list" >{match}</ul>
      <button onClick={() => handleClick(1)} disabled={isDisabled} >win 1</button>
      <button onClick={() => handleClick(0)} disabled={isDisabled} >win 2</button>
    </div>
  );
};

const Participant = ({ participant }) => {
  return (
    <div>
      <span>{participant.name}</span>
    </div>
  );
}
