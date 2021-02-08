import React, { Fragment } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';

export const Admin = ({ player, onDeleteClick, addPlayer, gameType }) => {
  const handleAdd = () => {
    addPlayer(player)
  }

  return (
    <div class="d-flex justify-content-center mb-1">
      <span class="align-bottom">{player.name}</span>
      {player.isAdmin ? "" : (
        <Fragment>
          {gameType === "Team" ? (
            <button type="button" class="btn btn-main btn-sm ms-2 p-0 d-flex justify-content-center align-items-center box-25px"
              onClick={handleAdd}
            ><FaPlus /></button>
          ) : ""}
          <button type="button" class="btn btn-main2 btn-sm ms-2 p-0 d-flex justify-content-center align-items-center box-25px"
            onClick={() => onDeleteClick(player)}
          ><FaTimes/></button>
        </Fragment>
      )}
    </div>
  );
};
