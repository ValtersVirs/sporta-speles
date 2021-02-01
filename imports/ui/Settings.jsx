import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';

export const Settings = ({ user, goToMenu }) => {
  const [showDelete, setShowDelete] = useState(false)
  const [confirm, setConfirm] = useState('')
  const [disabled, setDisabled] = useState(true)

  useEffect(() => {
    if (confirm === user.username) setDisabled(false)
    else setDisabled(true)
  }, [confirm])

  const deleteUser = () => {
    closeDelete()
    Meteor.call('removeUser');
  }

  const openDelete = () => setShowDelete(true)
  const closeDelete = () => setShowDelete(false)

  return (
    <div class="d-flex flex-column align-items-center">
      <span class="h4 mb-3">Account name: {user.username}</span>
      <button type="button" class="btn btn-main mb-3 d-flex align-items-center" onClick={openDelete}>
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
            <button type="button" class="btn btn-ok" disabled={disabled} onClick={deleteUser}>Delete</button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
