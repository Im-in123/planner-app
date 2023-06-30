import React, { useState, useEffect, useRef } from "react";

const CELL_SIZE = 10;
const CANVAS_SIZE = 320;
const INITIAL_SPEED = 200;

export default function MyCustomWidget() {
  // State variables
  const [snake, setSnake] = useState([
    { x: 2, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 0 },
  ]);

  const getRandomFood = () => {
    return {
      x: Math.floor(Math.random() * (CANVAS_SIZE / CELL_SIZE)),
      y: Math.floor(Math.random() * (CANVAS_SIZE / CELL_SIZE)),
    };
  };
  const [gameStarted, setGameStarted] = useState(false);
  const [food, setFood] = useState(getRandomFood());
  const [direction, setDirection] = useState("RIGHT");
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const gameCanvasRef = useRef(null);

  useEffect(() => {
    // Game loop
    if (gameOver) {
      if (score > highScore) {
        setHighScore(score);
      }
      return;
    }

    const intervalId = setInterval(moveSnake, speed);

    return () => {
      clearInterval(intervalId);
    };
  }, [snake, speed, gameOver, score, highScore]);

  useEffect(() => {
    // Event listener for keyboard input
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleKeyDown = (event) => {
    const { key } = event;

    if (!gameStarted && key === "Enter") {
      setGameStarted(true);
    }

    if (key === "ArrowUp" && direction !== "DOWN") {
      setDirection("UP");
    } else if (key === "ArrowDown" && direction !== "UP") {
      setDirection("DOWN");
    } else if (key === "ArrowLeft") {
      setDirection("LEFT");
    } else if (key === "ArrowRight" && direction !== "LEFT") {
      setDirection("RIGHT");
    }
  };

  const moveSnake = () => {
    // Move the snake
    const head = { x: snake[0].x, y: snake[0].y };

    switch (direction) {
      case "UP":
        head.y -= 1;
        break;
      case "DOWN":
        head.y += 1;
        break;
      case "LEFT":
        head.x -= 1;
        break;
      case "RIGHT":
        head.x += 1;
        break;
      default:
        break;
    }

    const newSnake = [head, ...snake];
    if (head.x === food.x && head.y === food.y) {
      // Snake eats the food
      setFood(getRandomFood());
      setSpeed(speed - 10);
      setScore(score + 1);
    } else {
      newSnake.pop();
    }

    if (
      isSnakeCollision(head) ||
      head.x === -1 ||
      head.y === -1 ||
      head.x === CANVAS_SIZE / CELL_SIZE ||
      head.y === CANVAS_SIZE / CELL_SIZE
    ) {
      // Snake collision or hitting the walls
      setGameOver(true);
    }

    setSnake(newSnake);
  };

  const isSnakeCollision = (head) => {
    // Check if the snake collides with its own body
    for (let i = 1; i < snake.length; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        return true;
      }
    }
    return false;
  };

  const drawCell = (ctx, x, y) => {
    // Draw a cell on the canvas
    ctx.fillStyle = "green";
    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.strokeStyle = "white";
    ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  };

  const drawSnake = (ctx) => {
    // Draw the snake on the canvas
    snake.forEach((cell) => {
      drawCell(ctx, cell.x, cell.y);
    });
  };

  const drawFood = (ctx) => {
    // Draw the food on the canvas
    drawCell(ctx, food.x, food.y);
  };

  const drawGame = () => {
    const canvas = gameCanvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (gameOver) {
      // Game over screen
      ctx.font = "30px Arial";
      ctx.fillStyle = "red";
      ctx.textAlign = "center";
      ctx.fillText("Game Over", CANVAS_SIZE / 2, CANVAS_SIZE / 2);
      ctx.font = "14px Arial";
      ctx.fillStyle = "white";
      ctx.fillText("Score: " + score, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 40);
      ctx.fillText(
        "High Score: " + highScore,
        CANVAS_SIZE / 2,
        CANVAS_SIZE / 2 + 70
      );
      ctx.fillText(
        "Press Enter to Try Again",
        CANVAS_SIZE / 2,
        CANVAS_SIZE / 2 + 100
      );
      return;
    }
    drawSnake(ctx);
    drawFood(ctx);
  };

  const handleRestart = () => {
    // Restart the game
    setSnake([
      { x: 2, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 0 },
    ]);
    setFood(getRandomFood());
    setDirection("RIGHT");
    setSpeed(INITIAL_SPEED);
    setGameOver(false);
    setScore(0);
    setGameStarted(true);
  };

  useEffect(() => {
    // Initial canvas rendering
    const canvas = gameCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!gameStarted) {
      ctx.font = "24px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(
        "Press Enter to Start Game",
        CANVAS_SIZE / 2,
        CANVAS_SIZE / 2
      );
      return;
    }

    drawGame(ctx);
  }, [snake, food, gameOver, score, highScore]);

  useEffect(() => {
    // Event listener for restarting the game after game over
    const handleKeyDown = (event) => {
      if (event.key === "Enter" && gameOver) {
        handleRestart();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameOver]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!gameStarted && event.key === "Enter") {
        handleRestart();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameStarted]);

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Snake Game</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          marginBottom: "10px",
          alignItems: "center",
        }}
      >
        <div style={{ color: "black" }}>Score: {score}</div>
        <div style={{ color: "black" }}>High Score: {highScore}</div>
      </div>
      <canvas
        ref={gameCanvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        style={{
          display: "block",
          margin: "0 auto",
          border: "1px solid black",
        }}
      />
    </div>
  );
}
