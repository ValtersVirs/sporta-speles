import React, { useState, useEffect, useRef } from 'react'
import { Meteor } from 'meteor/meteor';
import { PlayersCollection } from '/imports/api/PlayersCollection';
import { Player } from './Player';

export const Tournament = ({ part, gameId, gameType, endGame, isAdmin }) => {
  const [partList, setPartList] = useState([""]);
  const partCurrent = useRef("");

  useEffect(() => {
    var participants = []
    const maxRound = PlayersCollection.findOne({ gameId: gameId }, {
      sort: { round: -1 }
    }).round;

    const maxRoundGames = PlayersCollection.find({
      gameId: gameId,
      round: maxRound,
    }).count()

    //completedRounds = maxRound - (x ? 1 : 0)

    console.log(`maxRound = ${maxRound}`);

    for (let n = 0; n < maxRound; n++) {
      participants[n] = PlayersCollection.find({
        gameId: gameId,
        round: { $gt: n },
      }).fetch()
    }

    console.log("participants");
    console.log(participants);

    partCurrent.current = participants[participants.length - 1];
    setPartList(participants);
  }, []);

  console.log("partCurrent:");
  console.log(partCurrent.current);

  const swap = ( arr1 ) => {
    arr = arr1.slice(0);
    [arr[0], arr[arr.length - 1]] = [arr[arr.length - 1], arr[0]];
    return arr;
  }

  const rounds = Math.ceil(Math.log(part.length) / Math.log(2));

  let x;

  const matchLoser = ( index ) => {
    x = partCurrent.current.length % 2 ? 1 : 0;
    console.log(`${partCurrent.current[index].name} lost`);
    var loser = partCurrent.current[index].name;
    var winner = index % 2 ? index - 1 : index + 1;
    partCurrent.current[index].status = "lost";
    Meteor.call('matchCompleted', partCurrent.current[winner].name, loser, gameType)
    console.log(`winner ${partCurrent.current[winner].name}`);
    console.log(`loser ${loser}`);
    console.log('partCurrent array:');
    console.log(partCurrent.current);
    console.log('partList array:');
    console.log(partList);
    if (partCurrent.current.filter(x => x.status === "lost").length == (partCurrent.current.length - x) / 2) {
      partCurrent.current = partCurrent.current.filter(a => a.status !== "lost");
      if (x) partCurrent.current = swap(partCurrent.current);
      console.log(`new partCurrent array`);
      console.log(partCurrent.current);
      console.log(`partCurrent length ${partCurrent.current.length}`);
      setPartList(partList => [...partList, partCurrent.current]);
    }
  };

  const tournament = partList.map((a, index) =>
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
