import React, { useState } from 'react'
import { Player } from './Player';

export const Tournament = ({ participants }) => {
  const [partList, setPartList] = useState([participants]);

  let partCurrent = partList[partList.length - 1].slice(0);

  const swap = ( arr1 ) => {
    arr = arr1.slice(0);
    [arr[0], arr[arr.length - 1]] = [arr[arr.length - 1], arr[0]];
    return arr;
  }

  const rounds = Math.ceil(Math.log(participants.length) / Math.log(2));

  let matchCount = 0;
  let roundCount = 0;

  let x = 0;

  if (partCurrent.length % 2) x = 1;

  const matchLoser = ( index ) => {
    console.log(`${partCurrent[index].name} lost`);
    partCurrent.splice(index, 1, 'removed');
    console.log('partCurrent array:');
    console.log(partCurrent);
    console.log('partList array:');
    console.log(partList);
    matchCount++;
    console.log(`matches played ${matchCount}`);
    if (matchCount == (partCurrent.length - x) / 2) {
      partCurrent = partCurrent.filter(a => a !== 'removed');
      if (x) partCurrent = swap(partCurrent);
      matchCount = 0;
      roundCount ++;
      console.log(`new partCurrent array`);
      console.log(partCurrent);
      console.log(`partCurrent length ${partCurrent.length}`);
      setPartList(partList => [...partList, partCurrent]);
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
      <div><Participants part={participants} /></div>
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
