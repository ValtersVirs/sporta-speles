import React from 'react';

export const Admin = ({ player, onDeleteClick }) => {
  return (
    <div>
      <span>Name: {player.name} Game id: {player.gameId}</span>
      <button onClick={() => onDeleteClick(player)}>&times;</button>
    </div>
  );
};
