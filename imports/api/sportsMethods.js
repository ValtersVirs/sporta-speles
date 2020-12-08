import { GamesCollection } from './GamesCollection';
import { TeamsCollection } from './TeamsCollection';

Meteor.methods({
  'gameStart'(gameId) {
    GamesCollection.update({ gameId: gameId }, {
      $set: { gameStart: true }
    })
  },
  'addTeams'(gameId, number) {
    for (let n = 0; n < number; n++) {
      TeamsCollection.insert({
        gameId: gameId,
        name: `Team ${n + 1}`,
        players: [],
        createdAt: new Date(),
      });
    }
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
  }
})
