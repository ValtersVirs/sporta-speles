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
  'leaveTeam'(player, team, gameID) {
    TeamsCollection.update({ gameId: gameID, name: team }, {
      $pull: { players: player }
    })
  },
  'currentPlayer'(name, gameId) {
    PlayersCollection.findOne( { name: name, gameId: gameId } );
  },
})
