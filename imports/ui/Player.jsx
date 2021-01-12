import React from 'react';

export const Player = ({ player }) => {
  return (
    <div class="d-flex justify-content-center">
      <span>{player.name}</span>
    </div>
  );
};
