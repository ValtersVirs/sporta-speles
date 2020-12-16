import React, { useState, useEffect, useRef } from 'react'
import { Meteor } from 'meteor/meteor';
import { PlayersCollection } from '/imports/api/PlayersCollection';
import { Player } from './Player';

export const Tournament = ({ part, gameId, gameType, endGame, isAdmin }) => {
  const [roundList, setRoundList] = useState([""]);
  const partCurrent = useRef("");
  const isInitialMount = useRef(0);

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

      const completedRounds = maxRound - (maxRoundCount === Math.floor(totalParticipants / Math.pow(2, maxRound - 1)) ? 0 : 1)

      const curRound = PlayersCollection.find({
        gameId: gameId,
        round: { $gt: completedRounds - 1 }
      }, {
        sort: { nr: 1 }
      }).fetch()

      partCurrent.current = curRound;

      console.log("useEffect partCurrent");
      console.log(partCurrent.current);

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
          if (isOdd) {
            Meteor.call('nextRound', roundList[roundList.length - 1].name,
              maxRound, gameId, gameType, (err, res) => {
              Meteor.call('swap', gameId, gameType, (err, res) => {
                partCurrent.current = PlayersCollection.find({
                  gameId: gameId,
                  round: { $gt: maxRound - 1 }
                }, {
                  sort: { nr: 1 }
                }).fetch()
                console.log("isOdd partCurrent:");
                console.log(partCurrent.current);
                setRoundList(roundList => [...roundList, partCurrent.current]);
              })
            })
          } else {
            console.log("isntOdd");
            setRoundList(roundList => [...roundList, partCurrent.current]);
          }
        }
      }
    }
  });

  const swap = ( arr1 ) => {
    arr = arr1.slice(0);
    [arr[0], arr[arr.length - 1]] = [arr[arr.length - 1], arr[0]];
    return arr;
  }


  const matchLoser = ( index ) => {
    console.log(`${partCurrent.current[index].name} lost`);
    var loser = partCurrent.current[index].name;
    var winner = index % 2 ? index - 1 : index + 1;
    console.log(`f winner ${partCurrent.current[winner].name} before`);
    console.log(`f loser ${loser} before`);
    partCurrent.current[index].status = "lost";
    Meteor.call('matchCompleted', partCurrent.current[winner].name, loser, gameId, gameType, (err, res) => {
      console.log(`f winner ${partCurrent.current[winner].name} after`);
      console.log(`f loser ${loser} after`);
      console.log('f partCurrent array:');
      console.log(partCurrent.current);
      console.log('f roundList array:');
      console.log(roundList);
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
      for (let j = 0 + (2 * i); j < 2 + (2 * i); j++) {
        match.push(<Participant key={participants[j].name} participant={participants[j]} />)
      }
      round.push(<Match key={i} match={match} matchNr={i} matchLoser={matchLoser} />)
    }
    return (
      <div className="round">
        <div>Round {roundNr}</div>
        <div className="round-list" >{round}</div>
      </div>
    );
  }
}

const Match = ({ match, matchNr, matchLoser }) => {
  const [isDisabled, setIsDisabled] = useState(false);

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
