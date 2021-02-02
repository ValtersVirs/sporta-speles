import { PlayersCollection } from './PlayersCollection';
import { GamesCollection } from './GamesCollection';
import { TeamsCollection } from './TeamsCollection';
import { Meteor } from 'meteor/meteor';

Meteor.methods({
  'playerInsert'(name, gameId, isAdmin) {
    PlayersCollection.insert({
      name: name,
      gameId: gameId,
      isAdmin: isAdmin,
      inGame: true,
      createdAt: new Date()
    });
  },
  'gameCreate'(gameId, select, scoreType, isOvertime, teamSize, teamNumber) {
    if (select === "Team") {
      GamesCollection.insert({
        gameId: gameId,
        gameType: select,
        isOvertime: isOvertime,
        teamSize: teamSize,
        numberOfTeams: teamNumber,
      });

      for (let n = 0; n < teamNumber; n++) {
        TeamsCollection.insert({
          gameId: gameId,
          name: `Team ${n + 1}`,
          players: [],
          createdAt: new Date(),
        });
      }
    } else if (select === "Leaderboard") {
      GamesCollection.insert({
        gameId: gameId,
        gameType: select,
        scoreType: scoreType,
        isOvertime: isOvertime,
      });
    } else {
      GamesCollection.insert({
        gameId: gameId,
        gameType: select,
        isOvertime: isOvertime,
      });
    }
  },
  'playerDelete'(id) {
    PlayersCollection.remove(id);
  },
  'gameEnd'(gameId) {
    PlayersCollection.remove({ gameId: gameId });
    TeamsCollection.remove({ gameId: gameId });
    GamesCollection.remove({ gameId: gameId });
  },
  'gameStart'(gameId) {
    GamesCollection.update({ gameId: gameId }, {
      $set: { gameStart: true }
    })
  },
  'joinTeam'(player, team, gameId) {
    TeamsCollection.update({ gameId: gameId, name: team }, {
      $push: { players: player }
    })
  },
  'leaveTeam'(player, team, gameId) {
    TeamsCollection.update({ gameId: gameId, name: team }, {
      $pull: { players: player }
    })
  },
  'currentPlayer'(name, gameId) {
    PlayersCollection.findOne( { name: name, gameId: gameId } );
  },
  'removeUser'() {
    Meteor.users.remove(this.userId);
  },
  'firstRound'(gameId, gameType) {
    const collection = gameType === "Team" ? TeamsCollection : PlayersCollection;

    collection.update({
      gameId: gameId,
      round: { $exists: false }
    }, {
      $set: { round: 1, status: "playing", points: 0, winner: false }
    }, { multi: true })
  },
  'matchCompleted'(winner, loser, winnerScore, loserScore, gameId, gameType, points) {
    const collection = gameType === "Team" ? TeamsCollection : PlayersCollection;

    collection.update({ name: winner, gameId: gameId }, {
      $inc: { round: 1, points: points }
    }),
    collection.update({ name: loser, gameId: gameId }, {
      $set: { status: "lost", winnerScore: winnerScore, loserScore: loserScore }
    })
  },
  'oddParticipant'(gameId, gameType, round) {
    const collection = gameType === "Team" ? TeamsCollection : PlayersCollection;

    const nr = collection.findOne({
      gameId: gameId,
      status: "playing"
     }, {
      sort: { nr: -1 }
    }).nr;

    collection.update({ gameId: gameId, nr: nr }, {
      $set: { round: round }
    })

    let value1 = collection.findOne({
      gameId: gameId,
      status: "playing"
     }, {
      sort: { nr: 1 }
    }).nr;
    let value2 = collection.findOne({
      gameId: gameId,
      status: "playing"
    }, {
      sort: { nr: -1 }
    }).nr;

    collection.update({
      gameId: gameId,
      status: "playing",
      nr: value1
    }, {
      $set: { nr: value2 }
    })
    collection.update({
      gameId: gameId,
      status: "playing",
      nr: value2
    }, {
      $set: { nr: value1 }
    })
  },
  'setId'(gameId, gameType) {
    let count = 0;
    const collection = gameType === "Team" ? TeamsCollection : PlayersCollection;

    collection.find({ gameId: gameId }, {
      sort: { _id: 1 }
    }).forEach(x => {
      count++;
      collection.update({
        _id: x._id,
        nr: { $exists: false }
      }, {
        $set: { nr: count }
      })
    })
  },
  'setWinner'(gameId, gameType, name) {
    const collection = gameType === "Team" ? TeamsCollection : PlayersCollection;

    collection.update({ gameId: gameId, name: name }, {
      $set: { winner: true }
    })
  },
  'leaveGame'(player) {
    TeamsCollection.update({ gameId: player.gameId }, {
      $pull: { players: player.name }
    }, { multi: true })
    PlayersCollection.remove({ name: player.name, inGame: true });
  },
  'leaveStartedGame'(name) {
    PlayersCollection.update({ name: name, inGame: true }, {
      $set: { inGame: false }
    })
  },
  'leaderboardStart'(gameId) {
    PlayersCollection.update({ gameId }, {
      $set: { points: "" }
    }, { multi: true })
  },
  'addPoints'(player) {
    PlayersCollection.update({ name: player.name, gameId: player.gameId }, {
      $inc: { points: 1 }
    })
  },
  'removePoints'(player) {
    PlayersCollection.update({ name: player.name, gameId: player.gameId }, {
      $inc: { points: -1 }
    })
  },
  'updateScore'(player, score) {
    PlayersCollection.update({ name: player.name, gameId: player.gameId }, {
      $set: { points: score }
    })
  },
  'leaveLeaderboardGame'(name) {
    PlayersCollection.update({ name: name, inGame: true }, {
      $set: { inGame: false, points: "DQ" }
    })
  },
  'disqualify'(name) {
    PlayersCollection.update({ name: name, inGame: true }, {
      $set: { points: "DQ" }
    })
  },
  'changeTeamName'(gameId, oldName, newName) {
    TeamsCollection.update({ gameId: gameId, name: oldName }, {
      $set: { name: newName }
    })
  },
  'clearTeams'(gameId) {
    TeamsCollection.update({ gameId: gameId }, {
      $set: { players: [] }
    }, { multi: true })
  },
  'randomizeTeams'(gameId, players, teams) {
    let team = 0
    let playerCount = 0
    for (let i = 0; i < players.length; i++) {
      Meteor.call('joinTeam', players[i], teams[team].name, gameId)
      team++
      if (team === teams.length) {
        team = 0
        playerCount++
      }
      if (playerCount === GamesCollection.findOne({ gameId: gameId }).teamSize) break
    }
  },
  'updateName'(oldName, newName) {
    Meteor.users.update({ username: oldName }, {
      $set: { username: newName }
    })

    PlayersCollection.update({ name: oldName }, {
      $set: { name: newName }
    })

    TeamsCollection.update({ players: oldName }, {
      $set: { "players.$[element]": newName }
    }, {
      arrayFilters: [ { element: oldName } ]
    })
  },
})
