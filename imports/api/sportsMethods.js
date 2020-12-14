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
    gameType === "Team" ? (
      TeamsCollection.update({
        gameId: gameId,
        round: { $exists: false }
      }, {
        $set: { round: 1, status: "playing" }
      }, { multi: true })
    ) : (
      PlayersCollection.update({
        gameId: gameId,
        round: { $exists: false }
      }, {
        $set: { round: 1, status: "playing" }
      }, { multi: true })
    )
  },
  'matchCompleted'(winner, loser, gameType) {
    gameType === "Team" ? (
      TeamsCollection.update({ name: winner }, {
        $inc: { round: 1 }
      }),
      TeamsCollection.update({ name: loser }, {
        $set: { status: "lost" }
      })
    ) : (
      PlayersCollection.update({ name: winner }, {
        $inc: { round: 1 }
      }),
      PlayersCollection.update({ name: loser }, {
        $set: { status: "lost" }
      })
    )
  },
})
