import React from 'react';
import { SquareProps } from '../../types';

export const Square = React.memo((props: SquareProps) => {
  return (
    <button className="square" onClick={() => props.onClick()}>
      {props.value}
    </button>
  );
});
