import React from 'react';
import { Meteor } from 'meteor/meteor';
import { TeamsCollection } from '/imports/api/TeamsCollection';

export const Teams = ({ gameId, player }) => {
  const curGameTeams = TeamsCollection.find({ gameId: gameId }, {
    sort: { createdAt: 1 }
  }).fetch();

  return (
    <div>Teams
      <ul>
        { curGameTeams.map(team => <Team
          key={team._id}
          teams={curGameTeams}
          team={team}
          player={player}
          gameId={gameId}
        />) }
      </ul>
    </div>
  );
}

const Team = ({ teams, team, player, gameId }) => {

  const handleJoinClick = () => {
    for (let n = 0; n < teams.length; n++) {
      if (teams[n].players.includes(player.name)) {
        Meteor.call('leaveTeam', player.name, teams[n].name, gameId)
      }
    }

    Meteor.call('joinTeam', player.name, team.name, gameId)
  }

  const handleLeaveClick = () => {
    Meteor.call('leaveTeam', player.name, team.name, gameId)
  }

  if (team.players.includes(player.name)) {
    var displayJoin = "none";
    var displayLeave = "block";
  } else {
    var displayJoin = "block";
    var displayLeave = "none";
  }

  return (
    <div>
      <span>Team: {team.name}</span>
      <ul>
        { team.players.map(teamPlayer => <TeamPlayer
          player={teamPlayer}
        />) }
      </ul>
      <button onClick={handleJoinClick} style={{display: displayJoin}}>Join team</button>
      <button onClick={handleLeaveClick} style={{display: displayLeave}}>Leave team</button>
    </div>
  );
};

const TeamPlayer = ({ player }) => {
  return (
    <div>
      <span>Name: {player}</span>
    </div>
  );
};
