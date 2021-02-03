import React from 'react';
import { FaTimes } from 'react-icons/fa';

export const Admin = ({ player, onDeleteClick }) => {
  return (
    <div class="d-flex justify-content-center mb-1">
      <span class="align-bottom">{player.name}</span>
      {player.isAdmin ? "" : (
        <button type="button" class="btn btn-main2 btn-sm ms-2 p-0 d-flex justify-content-center align-items-center box-25px"
          onClick={() => onDeleteClick(player)}
        ><FaTimes/></button>
      )}
    </div>
  );
};
