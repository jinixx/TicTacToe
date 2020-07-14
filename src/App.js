import React, { useState, useEffect, useMemo, useRef } from "react";
import { useHistoryTravel } from "ahooks";
import { IconO, IconX } from "./Icons";
import "./styles.scss";

const TurnIndicator = props => <p>Current turn: {props.turn}</p>;
const GameOver = props => (
  <p>
    Game over! {props.winner ? `Player ${props.winner} won!` : "Draw game 😩."}
  </p>
);

const Cell = props => {
  const { cellIndex, data, gameOver, onPlayerMove, rowIndex } = props;
  const { line, marker, won } = data[rowIndex][cellIndex];

  return (
    <div
      className={`board-cell${won ? " won " + line : ""}${
        gameOver ? " disabled" : ""
      }`}
      onClick={() => onPlayerMove({ rowIndex, cellIndex })}
    >
      {marker === "O" ? (
        <IconO className="marker-O" />
      ) : marker === "X" ? (
        <IconX className="marker-X" />
      ) : (
        ""
      )}
    </div>
  );
};

const Row = props => {
  const { data, gameOver, onPlayerMove, rowIndex } = props;
  return (
    <div className="board-row">
      {data[rowIndex].map((cell, index) => (
        <Cell
          key={index}
          cellIndex={index}
          data={data}
          gameOver={gameOver}
          onPlayerMove={onPlayerMove}
          rowIndex={rowIndex}
        />
      ))}
    </div>
  );
};

const initialStateForTimeTravel = {
  boardData: null,
  gameOver: false,
  moveCount: 0,
  turn: "O",
  winner: ""
};

const TicTacToe = props => {
  const { size: _size = 3, maxSize = 9 } = props;
  const [size, setSize] = useState(_size);
  initialStateForTimeTravel.boardData = useMemo(() => getBoardLayout(size), [
    size
  ]);

  // controller data
  const [targetSize, setTargetSize] = useState(_size);

  const {
    value,
    setValue,
    backLength,
    forwardLength,
    back,
    forward,
    go
  } = useHistoryTravel(initialStateForTimeTravel);

  const { boardData, gameOver, moveCount, turn, winner } = value;

  const handlePlayerMove = cell => {
    const { rowIndex, cellIndex } = cell;
    if (!isValidMove(boardData[rowIndex][cellIndex].marker)) return;

    const newState = { ...value };
    const _newBoardData = JSON.parse(JSON.stringify(boardData));
    _newBoardData[rowIndex][cellIndex].marker = turn;

    const { line, winner, winningCells } = hasWinner(
      _newBoardData,
      turn,
      rowIndex,
      cellIndex
    );

    if (winner) {
      newState.winner = winner;
      newState.gameOver = true;
      for (let i = 0; i < winningCells.length; i++) {
        _newBoardData[winningCells[i][0]][winningCells[i][1]].won = true;
        _newBoardData[winningCells[i][0]][winningCells[i][1]].line = line;
      }
    } else {
      newState.moveCount++;
      newState.turn = turn === "O" ? "X" : "O";
      if (newState.moveCount === Math.pow(size, 2)) {
        newState.gameOver = true;
      }
    }

    newState.boardData = _newBoardData;

    setValue(newState);
  };

  const reset = () => {
    setValue(initialStateForTimeTravel);
  };

  const firstUpdate = useRef(true);
  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    reset();
  }, [initialStateForTimeTravel.boardData]);

  const handleOnChangeInputSize = e => {
    setTargetSize(e.target.value.slice(0, 1));
  };

  const handleCreateBoard = () => {
    if (targetSize >= 3 && targetSize <= maxSize) {
      setSize(targetSize);
    } else {
      setTargetSize(size);
    }
  };

  const handleOnReset = () => {
    reset();
  };

  return (
    <div className="board-container">
      {gameOver ? <GameOver winner={winner} /> : <TurnIndicator turn={turn} />}
      <div className="board">
        <div className="board-inner">
          {boardData.map((row, index) => (
            <Row
              key={index}
              data={boardData}
              onPlayerMove={handlePlayerMove}
              rowIndex={index}
              gameOver={gameOver}
            />
          ))}
        </div>
      </div>
      <div className="board-controls">
        <div>
          <button
            className="btn-undo"
            disabled={backLength === 0}
            onClick={back}
          >
            Undo
          </button>
          <button
            className="btn-redo"
            disabled={forwardLength === 0}
            onClick={forward}
          >
            Redo
          </button>
        </div>
        <div>
          <input
            className="input-boardsize"
            type="number"
            onChange={handleOnChangeInputSize}
            placeholder="size"
            value={targetSize}
          />
          <button disabled={!targetSize} onClick={handleCreateBoard}>
            Create board
          </button>
        </div>
        <button onClick={handleOnReset}>Reset</button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div className="App">
      <h1>Tic Tac Toe</h1>
      <p>
        useHistoryTravel by ahooks is missing a reset method to reset history,
        when create new board or reset, does not reset history at the moment.
      </p>
      <TicTacToe size={3} maxSize={9} />
    </div>
  );
}

function getBoardLayout(size = 3) {
  const _boardData = [];

  for (let i = 0; i < size; i++) {
    _boardData.push([]);
    for (let j = 0; j < size; j++) {
      _boardData[i].push({
        line: "",
        marker: "",
        won: false
      });
    }
  }

  return _boardData;
}

function isValidMove(cell) {
  return !cell;
}

function hasWinner(_boardData, marker, rowIndex, cellIndex) {
  const size = _boardData.length;
  // col
  let winningCells = [];

  for (let i = 0; i < size; i++) {
    if (_boardData[i][cellIndex].marker !== marker) break;
    winningCells.push([i, cellIndex]);
    if (i === size - 1) {
      return {
        line: "vertical",
        winner: marker,
        winningCells
      };
    }
  }

  winningCells = [];
  // row
  for (let i = 0; i < size; i++) {
    if (_boardData[rowIndex][i].marker !== marker) break;
    winningCells.push([rowIndex, i]);
    if (i === size - 1) {
      return {
        line: "horizontal",
        winner: marker,
        winningCells
      };
    }
  }

  // diagonal
  if (rowIndex === cellIndex) {
    winningCells = [];
    for (let i = 0; i < size; i++) {
      if (_boardData[i][i].marker !== marker) break;
      winningCells.push([i, i]);
      if (i === size - 1) {
        return {
          line: "diagonal",
          winner: marker,
          winningCells
        };
      }
    }
  }

  // inverted diagonal
  if (rowIndex + cellIndex === size - 1) {
    winningCells = [];
    for (let i = 0; i < size; i++) {
      if (_boardData[i][size - 1 - i].marker !== marker) break;
      winningCells.push([i, size - 1 - i]);
      if (i === size - 1) {
        return {
          line: "inverted-diagonal",
          winner: marker,
          winningCells
        };
      }
    }
  }

  return {};
}
