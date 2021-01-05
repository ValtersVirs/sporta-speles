import React, { useState, useEffect, useRef } from 'react'
import { Meteor } from 'meteor/meteor';
import { PlayersCollection } from '/imports/api/PlayersCollection';
import { TeamsCollection } from '/imports/api/TeamsCollection';
import { Player } from './Player';

export const Tournament = ({ part, gameId, gameType, endGame, goToMenu, name, isAdmin }) => {
  const [roundList, setRoundList] = useState([""]);
  const partCurrent = useRef("");
  const callOnce = useRef(0);
  const [update, setUpdate] = useState(0);
  const [winner, setWinner] = useState(false);
  const temp = useRef(false);

  const collection = gameType === "Team" ? TeamsCollection : PlayersCollection;

  console.log("main roundList");
  console.log(roundList);

  console.log("main partCurrent:");
  console.log(partCurrent.current);

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

      console.log(`onMount completedRounds ${completedRounds}`);

      for (let n = 0; n < completedRounds; n++) {
        rounds[n] = collection.find({
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
      console.log("useEffect");

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

      console.log("----------------------- calc 1");

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
        console.log(`participantCount = ${participantCount}`);

        count++
      }

      console.log(`maxRound = ${maxRound}`);
      console.log(`maxRoundCount = ${maxRoundCount}`);
      console.log(`participantCount = ${participantCount}`);

      const completedRounds = maxRound - (maxRoundCount >= participantCount ? 0 : 1)

      console.log(`completedRounds = ${completedRounds}`);

      const curRound = collection.find({
        gameId: gameId,
        round: { $gt: completedRounds - 1 }
      }, {
        sort: { nr: 1 }
      }).fetch()

      partCurrent.current = curRound;

      console.log("useEffect partCurrent");
      console.log(partCurrent.current);
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

      console.log("----------------------- calc 2");

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
        console.log(`participantCount = ${participantCount}`);

        count++
      }

      let isOdd = roundList[roundList.length - 1].length % 2 ? 1 : 0;

      console.log(`maxRound = ${maxRound}`);
      console.log(`maxRoundCount = ${maxRoundCount}`);
      console.log(`participantCount = ${participantCount}`);
      console.log(`isOdd = ${isOdd}`);

      const completedRounds = maxRound - (maxRoundCount >= participantCount ? 0 : 1)

      console.log(`completedRounds = ${completedRounds}`);

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
                partCurrent.current = collection.find({
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
      console.log("f collection.find()");
      console.log(collection.find({ gameId: gameId }).fetch());
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

  return (
    <div>
      Tournament
      <div>{tournament}</div>
      <div><Participants part={part}/></div>
      {isAdmin ? (
        <button onClick={endGame}>End game</button>
      ) : (
        <button onClick={leaveGame}>Leave game</button>
      )}
      {winner ? (
          <Leaderboard
            collection={collection}
            gameId={gameId}
          />
      ) : (
        ""
      )}
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

const Leaderboard = ({ collection, gameId }) => {
  const participants = collection.find({ gameId }, {
    sort: { winner: -1, points: -1, _id: 1 }
  })

  return (
    <div>
      Leaderboard
      <ul>
        { participants.map((p, index) => <LeaderboardPlayer
            key={p._id}
            player={p}
            place={index + 1}
          />) }
      </ul>
    </div>
  );
}

const LeaderboardPlayer = ({ player, place }) => {
  return (
    <div>
      <span>Place {place} | Points: {player.points} | Name: {player.name}</span>
    </div>
  );
}

const Round = ({ participants, roundNr, gameId, gameType, collection, matchLoser }) => {
  let round = []

  let a = 0;

  if (participants.length % 2) a = 1;

  if (participants.length === 1) {
    const winnerCount = collection.find({ gameId: gameId, winner: true }).count()

    if (winnerCount === 0) Meteor.call('setWinner', gameId, gameType, participants[0].name)

    return (
      <div>Winner {participants[0].name}</div>
    );
  } else {
    for (let i = 0; i < (participants.length - a) / 2; i++) {
      let match = []
      let disabled = false
      for (let j = 0 + (2 * i); j < 2 + (2 * i); j++) {
        if (collection.findOne({ name: participants[j].name, gameId: gameId }).status === "lost") {
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
