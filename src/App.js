import React, { useState, useEffect, useMemo } from "react";
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

const initialState = {
  gameOver: false,
  moveCount: 0,
  turn: "O",
  winner: ""
};

const TicTacToe = props => {
  const { size: _size = 3, maxSize = 9 } = props;
  const [size, setSize] = useState(_size);
  const emptyBoardLayout = useMemo(() => getBoardLayout(size), [size]);
  const [turn, setTurn] = useState(initialState.turn);
  const [boardData, setBoardData] = useState(emptyBoardLayout);
  const [moveCount, setMoveCount] = useState(initialState.moveCount);
  const [winner, setWinner] = useState(initialState.winner);
  const [gameOver, setGameOver] = useState(initialState.gameOver);
  const [targetSize, setTargetSize] = useState(_size);

  const reset = () => {
    setTurn(initialState.turn);
    setMoveCount(initialState.moveCount);
    setWinner(initialState.winner);
    setGameOver(initialState.gameOver);
  };

  const handlePlayerMove = cell => {
    const { rowIndex, cellIndex } = cell;
    if (!isValidMove(boardData[rowIndex][cellIndex].marker)) return;

    const _newBoardData = JSON.parse(JSON.stringify(boardData));
    _newBoardData[rowIndex][cellIndex].marker = turn;

    const { line, winner, winningCells } = hasWinner(
      _newBoardData,
      turn,
      rowIndex,
      cellIndex
    );

    if (winner) {
      setWinner(winner);
      for (let i = 0; i < winningCells.length; i++) {
        _newBoardData[winningCells[i][0]][winningCells[i][1]].won = true;
        _newBoardData[winningCells[i][0]][winningCells[i][1]].line = line;
      }
    } else {
      setMoveCount(moveCount + 1);
      setTurn(turn => (turn === "O" ? "X" : "O"));
    }

    setBoardData(_newBoardData);
  };

  useEffect(() => {
    if (winner || moveCount === Math.pow(size, 2)) {
      setGameOver(true);
    }
  }, [moveCount, size, winner]);

  useEffect(() => {
    setBoardData(emptyBoardLayout);
    reset();
  }, [emptyBoardLayout]);

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
    setBoardData(emptyBoardLayout);
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
          <input
            className="input-boardsize"
            type="number"
            onChange={e => handleOnChangeInputSize(e)}
            placeholder="size"
            value={targetSize}
          />
          <button disabled={!targetSize} onClick={() => handleCreateBoard()}>
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
