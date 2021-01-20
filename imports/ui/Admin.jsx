import React from 'react';

export const Admin = ({ player, onDeleteClick }) => {
  return (
    <div class="d-flex justify-content-center mb-1">
      <span class="align-bottom">{player.name} {player.gameId}</span>
      <button type="button" class="btn btn-danger btn-sm ms-2 p-0 fw-bold fs-6"
        style={{height: "25px", width: "25px"}}
        onClick={() => onDeleteClick(player)}
      >&#x2715;</button>
    </div>
  );
};
