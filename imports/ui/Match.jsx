import React, { useState, useEffect } from 'react'
import { Meteor } from 'meteor/meteor';
import { Modal, OverlayTrigger, Tooltip, Collapse } from 'react-bootstrap';
import { GamesCollection } from '/imports/api/GamesCollection';
import { AiOutlineQuestionCircle } from 'react-icons/ai';

export const Match = ({ match, gameId, collection, matchNr, roundNr, participants, isAdmin, disabled, showTeams, matchLoser }) => {
  const [isDisabled, setIsDisabled] = useState(disabled);
  const [teamOne, setTeamOne] = useState('');
  const [teamTwo, setTeamTwo] = useState('');
  const [saveDisabled, setSaveDisabled] = useState(true);
  const [show, setShow] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const isOvertime = GamesCollection.findOne({ gameId: gameId }).isOvertime

  const matchParticipants = participants.map(x => collection.findOne({ name: x.name, gameId: gameId }))

  const gameType = GamesCollection.findOne({ gameId: gameId }).gameType

  var hideButton = ""

  let showTeam

  if (typeof showTeams === "undefined") showTeam = []
  else showTeam = showTeams

  var score = []
  var color = []

  if (isDisabled === true) {
    const loser = matchParticipants.filter(x => {
      return x.status === "lost" && x.round === roundNr
    })

    if (matchParticipants[0].status === "lost") {
      score = [loser[0].loserScore, loser[0].winnerScore]
      color = ["danger", "success"]
    }
    else {
      score = [loser[0].winnerScore, loser[0].loserScore]
      color = ["success", "danger"]
    }

    hideButton = "d-none"
  }

  const showModal = () => setShow(true)
  const closeModal = () => setShow(false)

  const handleClick = (i) => {
    alert(`matchNr = ${matchNr}`)
    matchLoser(i + (2 * matchNr))
    disable();
  };

  const scoreSubmit = () => {
    let points = 0
    if (isOvertime) {
      if (isChecked) points = 2
      else points = 3
    } else points = 1

    if (teamOne > teamTwo) matchLoser(1 + (2 * matchNr), teamOne, teamTwo, points)
    else matchLoser(0 + (2 * matchNr), teamTwo, teamOne, points)
    closeModal()
  }

  const teamOneChange = e => {
    const re = /^[0-9\b]+$/;
    if (!e.target.value) {
      setTeamOne("")
    } else if (re.test(e.target.value)) {
      setTeamOne(Number(e.target.value))
    }
  }

  const teamTwoChange = e => {
    const re = /^[0-9\b]+$/;
    if (!e.target.value) {
      setTeamTwo("")
    } else if (re.test(e.target.value)) {
      setTeamTwo(Number(e.target.value))
    }
  }

  useEffect(() => {
    if (disabled === true) setIsDisabled(true)
  }, [disabled])

  useEffect(() => {
    if (teamOne === '' || teamTwo === '') setSaveDisabled(true)
    else if (teamOne === teamTwo) setSaveDisabled(true)
    else setSaveDisabled(false)
  }, [teamOne, teamTwo])

  const disable = () => setIsDisabled(true);

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Check if game went into overtime
    </Tooltip>
  );

  return (
    <div class="mb-4 w-100">
      <div class="row">
        {match}
      </div>
      {isDisabled ? (
        <div class="row">
          <div class="col-5 d-flex justify-content-center">
            <b class={`text-${color[0]}`}>{score[0]}</b>
          </div>
          <div class="col-2 d-flex justify-content-center">
            <span>:</span>
          </div>
          <div class="col-5 d-flex justify-content-center">
            <b class={`text-${color[1]}`}>{score[1]}</b>
          </div>
        </div>
      ) : (
        ""
      )}

      {gameType === "Team" ? (
        <div class="row">
          <div class="col-5 d-flex justify-content-center">
            <Collapse
              in={showTeam.team1}
            >
              <div class="d-flex flex-column align-items-center">
                {matchParticipants[0].players.map(player => <Player
                  key={player}
                  player={player}
                />)}
              </div>
            </Collapse>
          </div>
          <div class="col-5 offset-2 d-flex justify-content-center">
            <Collapse
              in={showTeam.team2}
            >
              <div class="d-flex flex-column align-items-center">
                {matchParticipants[1].players.map(player => <Player
                  key={player}
                  player={player}
                />)}
              </div>
            </Collapse>
          </div>
        </div>
      ) : (
        ""
      )}

      {isAdmin ? (
        <div class="row">
          <div class="col-12 d-flex justify-content-center">
            <button type="button" class={`btn btn-primary btn-sm ${hideButton}`} onClick={showModal} disabled={isDisabled}>Set score</button>
          </div>
        </div>
      ) : (
        ""
      )}

      <Modal show={show} onHide={closeModal}>
        <Modal.Header>
          <Modal.Title>Set score for teams</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div class="row">
            <div class="col-5 d-flex justify-content-center">
              <input
                type="text"
                class="form-control text-truncate"
                placeholder={matchParticipants[0].name}
                value={teamOne}
                onChange={teamOneChange}
                required
              />
            </div>
            <div class="col-2 d-flex justify-content-center align-items-center">
              <span class="fw-bold">:</span>
            </div>
            <div class="col-5 d-flex justify-content-center">
              <input
                type="text"
                class="form-control text-truncate"
                placeholder={matchParticipants[1].name}
                value={teamTwo}
                onChange={teamTwoChange}
                required
              />
            </div>
          </div>
          {isOvertime ? (
            <div class="row mt-3">
              <div class="col-12">
                <div class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="overtimeCheckboox"
                    onClick={e => setIsChecked(e.target.checked)}
                  />
                  <div class="inline-block position-absolute">
                    <label class="form-check-label" htmlFor="overtimeCheckboox">
                      Overtime
                    </label>
                    <span class="position-absolute top-0 start-100 translate-middle-y">
                      <OverlayTrigger
                        placement="right"
                        trigger={["hover", "click"]}
                        overlay={renderTooltip}
                      >
                        <span><AiOutlineQuestionCircle size="0.75em"/></span>
                      </OverlayTrigger>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : ""}
        </Modal.Body>
        <Modal.Footer>
          <button type="button" class="btn btn-secondary" onClick={closeModal}>Close</button>
          <button type="button" class="btn btn-primary" onClick={scoreSubmit} disabled={saveDisabled}>Save Changes</button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

const Player = ({ player }) => {
  return (
    <div class="text-break text-center">{player}</div>
  );
}
