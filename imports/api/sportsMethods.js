import { PlayersCollection } from './PlayersCollection';
import { GamesCollection } from './GamesCollection';
import { TeamsCollection } from './TeamsCollection';

Meteor.methods({
  'playerInsert'(name, gameId, isAdmin) {
    PlayersCollection.insert({
      name: name,
      gameId: gameId,
      isAdmin: isAdmin,
      createdAt: new Date()
    });
  },
  'gameCreate'(gameId, select, isOvertime, teamNumber) {
    if (select === "Team") {
      GamesCollection.insert({
        gameId: gameId,
        gameType: select,
        isOvertime: isOvertime,
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
  'setLoser'(name, gameType) {
  /*  if (gameType === "Team") {
      TeamsCollection.update({ name: name }, {
        $set: { status: "lost" }
      })
    } else {
    PlayersCollection.update({ name: name }, {
      $set: { status: "lost" }
    })}
  */
    PlayersCollection.update({ name: name }, {
      $set: { playerStatus: "lost" }
    })
  },
  'firstRound'(gameId, gameType) {
    const collection = gameType === "Team" ? TeamsCollection : PlayersCollection;

    collection.update({
      gameId: gameId,
      round: { $exists: false }
    }, {
      $set: { round: 1, status: "playing" }
    }, { multi: true })
  },
  'matchCompleted'(winner, loser, gameId, gameType) {
    const collection = gameType === "Team" ? TeamsCollection : PlayersCollection;

    collection.update({ name: winner, gameId: gameId }, {
      $inc: { round: 1 }
    }),
    collection.update({ name: loser, gameId: gameId }, {
      $set: { status: "lost" }
    })
  },
  'nextRound'(name, round, gameId, gameType) {
    const collection = gameType === "Team" ? TeamsCollection : PlayersCollection;

    collection.update({ name: name, gameId: gameId }, {
      $set: { round: round }
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
  'swap'(gameId, gameType) {
    const collection = gameType === "Team" ? TeamsCollection : PlayersCollection;

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
})
