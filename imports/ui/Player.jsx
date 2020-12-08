import React from 'react';

export const Player = ({ player }) => {
  return (
    <div>
      <span>Name: {player.name} Game id: {player.gameId}</span>
    </div>
  );
};
