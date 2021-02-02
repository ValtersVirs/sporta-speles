import { Meteor } from 'meteor/meteor';
import { PlayersCollection } from '/imports/api/PlayersCollection';
import { GamesCollection } from '/imports/api/GamesCollection';
import { TeamsCollection } from '/imports/api/TeamsCollection';

Meteor.publish('allPlayers', function() {
  return PlayersCollection.find({}, { sort: { createdAt: -1 } })
});

Meteor.publish('allGames', function() {
  return GamesCollection.find({})
});

Meteor.publish('allTeams', function() {
  return TeamsCollection.find({})
});

Meteor.publish("allUsers", function () {
  return Meteor.users.find({});
});
