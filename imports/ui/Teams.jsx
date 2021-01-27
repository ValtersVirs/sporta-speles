import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Meteor } from 'meteor/meteor';
import { Modal } from 'react-bootstrap';
import { TeamsCollection } from '/imports/api/TeamsCollection';
import { FaRegEdit } from 'react-icons/fa';

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
  const [saveDisabled, setSaveDisabled] = useState(true)
  const [showNameSet, setShowNameSet] = useState(false)

  var readonly

  if (isAdmin) {
    readonly = false
  } else {
    readonly = true
  }

  const openNameSet = () => setShowNameSet(true)
  const closeNameSet = () => setShowNameSet(false)

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
    Meteor.call('changeTeamName', gameId, team.name, teamName.trim(), (err, res) => {
      openNameSet()
    })
  }

  const onNameChange = e => {
    if (e.target.value.length > 20) return
    else setTeamName(e.target.value)
  }

  useEffect(() => {
    if (refHidden.current.offsetWidth <= 20) {
      refInput.current.style.width = "20px"
    } else if (refHidden.current.offsetWidth <= 300) {
      refInput.current.style.width = `${refHidden.current.offsetWidth + 1}px`
    } else {
      refInput.current.style.width = "300px"
    }

    if (teamName.trim() === "") {
      setSaveDisabled(true)
    } else if (!(teams.every(t => t.name !== teamName.trim()))) {
      setSaveDisabled(true)
    } else {
      setSaveDisabled(false)
    }
  }, [teamName, team.name])

  return (
    <div class="d-flex align-items-center flex-column mb-3">
      <div>
        {isAdmin ? (
          <div class="d-flex justify-content-center">
            <button type="button" class="btn-transparent btn-focus align-middle p-0" disabled={saveDisabled} onClick={handleClick}><FaRegEdit/></button>

            <Modal show={showNameSet} onHide={closeNameSet}>
              <Modal.Body>
                Teams name set to {teamName}
              </Modal.Body>
              <Modal.Footer>
                <button type="button" class="btn btn-primary" onClick={closeNameSet}>Ok</button>
              </Modal.Footer>
            </Modal>
          </div>
        ) : (
          ""
        )}
        <span id="hide" class="fw-bold p-0 m-0" ref={refHidden}>{teamName}</span>
        <input
          class="p-0 m-0 score fw-bold align-middle overflow-hidden d-block"
          type="text"
          ref={refInput}
          value={teamName}
          onChange={onNameChange}
          readOnly={readonly}
        />
      </div>
      { team.players.map(teamPlayer => <TeamPlayer
        key={teamPlayer}
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
