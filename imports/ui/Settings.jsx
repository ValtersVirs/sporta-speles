import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { Modal } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';

import { TeamsCollection } from '/imports/api/TeamsCollection';

export const Settings = ({ user, goToMenu }) => {
  const [showDelete, setShowDelete] = useState(false)
  const [confirm, setConfirm] = useState('')
  const [disabledDelete, setDisabledDelete] = useState(true)
  const [showName, setShowName] = useState(false)
  const [name, setName] = useState('')
  const [disabledName, setDisabledName] = useState(true)

  useEffect(() => {
    Meteor.subscribe('allUsers');
  }, [])

  const users = Meteor.users.find({}, { fields: { username: 1 } }).fetch()

  const usernames = users.map(user => {
    return user.username
  })

  useEffect(() => {
    if (confirm === user.username) setDisabledDelete(false)
    else setDisabledDelete(true)
  }, [confirm])

  useEffect(() => {
    if (usernames.includes(name) || name === "") setDisabledName(true)
    else setDisabledName(false)
  }, [name])

  const deleteUser = () => {
    closeDelete()
    Meteor.call('removeUser');
  }

  const changeName = () => {
    closeName()
    Meteor.call('updateName', user.username, name)
  }

  const openDelete = () => setShowDelete(true)
  const closeDelete = () => setShowDelete(false)

  const openName = () => setShowName(true)
  const closeName = () => setShowName(false)

  return (
    <div class="d-flex flex-column align-items-center">
      <span class="h4 m-0">Account name: {user.username}</span>
      <hr />
      <span class="h5">Stats</span>
      <span>Tournamet games: {user.profile.games}</span>
      <span>Tournamet wins: {user.profile.wins}</span>
      <hr />
      <button type="button" class="btn btn-main mb-3 d-flex align-items-center justify-content-center size" onClick={openName}>Change name</button>

      <Modal show={showName} onHide={closeName} centered>
        <Modal.Body>
          <div class="d-flex flex-column align-items-center">
            <span class="mb-2">Type your new name</span>
            <div>
              <input
                type="text"
                class="form-control"
                name="username"
                required
                onChange={e => setName(e.target.value)}
              />
            </div>
            {disabledName && name !== "" ? (
              <span class="text-danger text-center size">Name unavailable</span>
            ) : ""}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div class="w-100 d-flex justify-content-center">
            <button type="button" class="btn btn-cancel me-2" onClick={closeName}>Cancel</button>
            <button type="button" class="btn btn-ok" disabled={disabledName} onClick={changeName}>Change</button>
          </div>
        </Modal.Footer>
      </Modal>

      <button type="button" class="btn btn-main mb-3 d-flex align-items-center justify-content-center size" onClick={openDelete}>
        <FaTrash/>
        <span class="ms-1">Delete account</span>
      </button>
      <button type="button" class="btn btn-main2" onClick={goToMenu}>Back</button>

      <Modal show={showDelete} onHide={closeDelete} centered>
        <Modal.Body>
          <div class="d-flex flex-column align-items-center">
            <span class="mb-2">Type {user.username} to confirm deletion</span>
            <div>
              <input
                type="text"
                placeholder={user.username}
                class="form-control"
                name="username"
                required
                onChange={e => setConfirm(e.target.value)}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div class="w-100 d-flex justify-content-center">
            <button type="button" class="btn btn-cancel me-2" onClick={closeDelete}>Cancel</button>
            <button type="button" class="btn btn-ok" disabled={disabledDelete} onClick={deleteUser}>Delete</button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
