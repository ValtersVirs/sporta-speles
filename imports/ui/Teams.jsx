import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Meteor } from 'meteor/meteor';
import { TeamsCollection } from '/imports/api/TeamsCollection';

export const Teams = ({ gameId, player, maxPlayers, isAdmin }) => {
  const curGameTeams = TeamsCollection.find({ gameId: gameId }, {
    sort: { createdAt: 1 }
  }).fetch();

  return (
    <div>
      { curGameTeams.map(team => <Team
        key={team._id}
        teams={curGameTeams}
        team={team}
        player={player}
        gameId={gameId}
        maxPlayers={maxPlayers}
        isAdmin={isAdmin}
      />) }
    </div>
  );
}

const Team = ({ teams, team, player, gameId, maxPlayers, isAdmin }) => {
  const [teamName, setTeamName] = useState(team.name)
  const refHidden = useRef(null)
  const refInput = useRef(null)

  var readonly

  if (isAdmin) {
    readonly = false
  } else {
    readonly = true
  }

  useEffect(() => {
    setTeamName(team.name)
  }, [team.name])

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

  if (team.players.length >= maxPlayers) {
    displayJoin = "none";
  }

  const handleClick = () => {
    if (TeamsCollection.find({ gameId: gameId, name: teamName }).count()) {
      alert(`${teamName} already exists`)
    } else {
      Meteor.call('changeTeamName', gameId, team.name, teamName)
      alert(`Team name set to ${teamName}`)
    }
  }

  const onNameChange = e => {
    setTeamName(e.target.value)
  }

  useEffect(() => {
    refInput.current.style.width = `${refHidden.current.offsetWidth}px`
  }, [teamName])

  const formLength = teamName.length ? teamName.length : 1

  return (
    <div class="d-flex align-items-center flex-column mb-3">
      <div>
        <span id="hide" class="p-0 m-0" ref={refHidden}>{teamName}&nbsp;&nbsp;</span>
        <input
          class="p-0 m-0 score fw-bold"
          type="text"
          ref={refInput}
          value={teamName}
          onChange={onNameChange}
          readOnly={readonly}
        />
        {isAdmin ? (
          <span class="badge bg-secondary" role="button" onClick={handleClick}>edit</span>
        ) : (
          ""
        )}
      </div>
      { team.players.map(teamPlayer => <TeamPlayer
        player={teamPlayer}
      />) }
      <button type="button" class="btn btn-primary btn-sm size-100px" onClick={handleJoinClick} style={{display: displayJoin}}>Join team</button>
      <button type="button" class="btn btn-danger btn-sm size-100px" onClick={handleLeaveClick} style={{display: displayLeave}}>Leave team</button>
    </div>
  );
};

const TeamPlayer = ({ player }) => {
  return (
    <span>{player}</span>
  );
};
