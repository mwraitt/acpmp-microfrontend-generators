export type BoardProps = {
  squares: ReadonlyArray<string>;
  onClick: Function;
};

export type SquareProps = {
  value: string;
  onClick: Function;
};
