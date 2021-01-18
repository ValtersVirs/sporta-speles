import React from 'react';

export const Admin = ({ player, onDeleteClick }) => {
  return (
    <div class="d-flex justify-content-center">
      <span>{player.name} {player.gameId}&nbsp;</span>
      <button type="button" class="btn btn-danger btn-sm" onClick={() => onDeleteClick(player)}>&times;</button>
    </div>
  );
};
