import React, { useEffect, useState, useRef } from "react";
import "./App.css";

/**
 * SerpentQuest Main Container
 * Classic grid-based snake game using React
 * Features: snake movement, food, collisions, score, dark theme styling
 */

// Theme colors
const COLORS = {
  primary: "#222222",      // background
  secondary: "#4CAF50",    // snake
  accent: "#FFEB3B",       // food
  border: "#393939",       // grid border
  text: "#FFEB3B",         // score
  white: "#fff",           // controls, etc
};

const GRID_SIZE = 20;      // 20x20 grid
const CELL_SIZE = 22;      // px, for each cell
const INITIAL_SNAKE = [
  { x: 8, y: 10 },
  { x: 7, y: 10 },
  { x: 6, y: 10 },
];

const DIRECTIONS = {
  ArrowUp:    { x: 0, y: -1 },
  ArrowDown:  { x: 0, y: 1 },
  ArrowLeft:  { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }
};

const OPPOSITE = {
  ArrowUp: "ArrowDown",
  ArrowDown: "ArrowUp",
  ArrowLeft: "ArrowRight",
  ArrowRight: "ArrowLeft"
};

/**
 * Returns true if obj1.x/obj1.y same as obj2.x/obj2.y
 */
function coordsEqual(obj1, obj2) {
  return obj1.x === obj2.x && obj1.y === obj2.y;
}

// PUBLIC_INTERFACE
function App() {
  // Game State
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState("ArrowRight");
  const [food, setFood] = useState(randomFood(INITIAL_SNAKE));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [moving, setMoving] = useState(false);

  // For consistent keyboard input & movement interval
  const directionRef = useRef(direction);
  const snakeRef = useRef(snake);
  const movingRef = useRef(moving);

  // Track interval for cleanup
  const intervalRef = useRef(null);

  // PUBLIC_INTERFACE
  // Resets the game to initial state
  function resetGame() {
    setSnake(INITIAL_SNAKE);
    setDirection("ArrowRight");
    setFood(randomFood(INITIAL_SNAKE));
    setScore(0);
    setGameOver(false);
    setMoving(false);
  }

  // PUBLIC_INTERFACE
  // Handle arrow key presses
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!Object.keys(DIRECTIONS).includes(e.key)) {
        if (gameOver && (e.key === ' ' || e.key === 'Enter')) {
          resetGame();
        }
        return;
      }
      // Prevent direct reversal
      if (
        snake.length > 1 &&
        OPPOSITE[e.key] === directionRef.current
      ) {
        return;
      }
      setDirection(e.key);
      directionRef.current = e.key;
      if (!movingRef.current && !gameOver) setMoving(true);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line
  }, [gameOver, snake.length]);

  // PUBLIC_INTERFACE
  // Movement & game engine
  useEffect(() => {
    if (gameOver || !moving) return;
    intervalRef.current = setInterval(() => {
      step();
    }, 105);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line
  }, [direction, moving, gameOver]);

  // Keep refs in sync
  useEffect(() => { directionRef.current = direction; }, [direction]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { movingRef.current = moving; }, [moving]);

  // Steps the snake forward, handles eating, dying, growing
  function step() {
    const newHead = {
      x: snakeRef.current[0].x + DIRECTIONS[directionRef.current].x,
      y: snakeRef.current[0].y + DIRECTIONS[directionRef.current].y,
    };

    // Wall collision
    if (
      newHead.x < 0 || newHead.x >= GRID_SIZE ||
      newHead.y < 0 || newHead.y >= GRID_SIZE
    ) {
      setGameOver(true);
      setMoving(false);
      return;
    }

    // Self collision
    if (snakeRef.current.some((cell) => coordsEqual(cell, newHead))) {
      setGameOver(true);
      setMoving(false);
      return;
    }

    let newSnake;

    // Eating food
    if (coordsEqual(newHead, food)) {
      newSnake = [newHead, ...snakeRef.current];
      setScore((s) => s + 1);
      setFood(randomFood(newSnake));
    } else {
      newSnake = [newHead, ...snakeRef.current.slice(0, -1)];
    }

    setSnake(newSnake);
  }

  // PUBLIC_INTERFACE
  // Generate food at random location not occupied by the snake
  function randomFood(currentSnake) {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (currentSnake.some((cell) => coordsEqual(cell, newFood)));
    return newFood;
  }

  // Style for grid, game area center
  const gridStyle = {
    display: "grid",
    gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
    gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
    border: `3px solid ${COLORS.border}`,
    background: COLORS.primary,
    margin: "0 auto",
    boxShadow: `0 3px 18px 0 rgba(0,0,0,0.55)`,
    position: "relative",
    width: GRID_SIZE * CELL_SIZE,
    height: GRID_SIZE * CELL_SIZE,
    zIndex: 2,
  };

  // Score area styles
  const scoreStyle = {
    textAlign: "center",
    color: COLORS.text,
    fontWeight: 700,
    fontSize: "2rem",
    marginBottom: "12px",
    textShadow: "0 1px 2px #000",
    letterSpacing: "0.1em"
  };

  // Minimal controls
  const controlsStyle = {
    color: COLORS.white,
    marginTop: "18px",
    textAlign: "center",
    fontSize: "1rem",
    opacity: 0.84
  };

  // Game Over overlay styling
  const overStyle = {
    position: "absolute",
    background: "rgba(34,34,34,0.95)",
    zIndex: 3,
    top: 0, left: 0, width: "100%", height: "100%",
    display: "flex",
    alignItems: "center", justifyContent: "center",
    flexDirection: "column",
    color: COLORS.accent,
    fontSize: "2rem",
    fontWeight: 700,
    letterSpacing: "0.03em",
    borderRadius: "4px"
  };

  // Render the cells for grid
  function renderCells() {
    const cells = [];
    for (let y = 0; y < GRID_SIZE; ++y) {
      for (let x = 0; x < GRID_SIZE; ++x) {
        let cellType = null;
        if (coordsEqual({ x, y }, food)) {
          cellType = "food";
        } else {
          const idx = snake.findIndex(seg => seg.x === x && seg.y === y);
          if (idx === 0) cellType = "head";
          else if (idx !== -1) cellType = "body";
        }
        let style = {
          width: CELL_SIZE,
          height: CELL_SIZE,
          boxSizing: "border-box",
          border: `1px solid ${COLORS.border}`,
          background: "transparent",
          transition: "background 0.12s",
        };
        if (cellType === "head") {
          style.background = COLORS.secondary;
          style.boxShadow = "0 0 4px 2px rgba(76,175,80,0.4)";
        } else if (cellType === "body") {
          style.background = "#29613f";
        } else if (cellType === "food") {
          style.background = COLORS.accent;
          style.boxShadow = "0 0 8px 3px rgba(255,235,59,0.28)";
        }
        cells.push(
          <div
            key={`${x}-${y}`}
            style={style}
          ></div>
        );
      }
    }
    return cells;
  }

  // Accessibility/game status for screen readers (minimal)
  const srStatus =
    gameOver
      ? `Game over. Score: ${score}. Press Space or Enter to restart.`
      : `Playing. Current score ${score}. Use arrow keys to move snake.`;

  return (
    <div className="app" style={{ background: COLORS.primary, minHeight: "100vh" }}>
      <nav className="navbar" style={{ background: COLORS.primary, borderBottom: `2px solid ${COLORS.border}` }}>
        <div className="container" style={{ maxWidth: 700 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo" style={{ color: COLORS.accent, fontWeight: 700 }}>
              <span className="logo-symbol" style={{ color: COLORS.secondary, fontWeight: 900 }}>◉</span> SerpentQuest
            </div>
            <span aria-hidden style={{ color: COLORS.white, fontWeight: 500, fontSize: "1.1em", opacity: 0.7 }}>
              SNAKE GAME
            </span>
          </div>
        </div>
      </nav>

      <main style={{
        paddingTop: 96,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "70vh",
        paddingBottom: 32
      }}>
        <div aria-live="polite" style={scoreStyle}>Score: {score}</div>
        <div style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          <div style={gridStyle}>
            {renderCells()}
            {gameOver && (
              <div style={overStyle} tabIndex="0" aria-label={srStatus}>
                <div style={{ fontSize: "2.25rem", marginBottom: 6 }}>Game Over</div>
                <div style={{ color: COLORS.white, fontWeight: 500, marginBottom: 18 }}>
                  Final Score: {score}
                </div>
                <button
                  className="btn btn-large"
                  onClick={resetGame}
                  style={{
                    background: COLORS.secondary,
                    color: COLORS.primary,
                    border: "none",
                    fontWeight: 700,
                    padding: "0.75em 1.7em",
                    borderRadius: 4,
                    fontSize: "1.15rem",
                    cursor: "pointer"
                  }}
                >
                  Restart
                </button>
                <div style={{ marginTop: 12, color: COLORS.white, fontSize: "0.97em", opacity: 0.86 }}>
                  (Or press Space/Enter)
                </div>
              </div>
            )}
          </div>
        </div>
        <div style={controlsStyle}>
          <div>
            <span style={{ color: COLORS.accent, fontWeight: 700 }}>{'⬆️ ⬇️ ⬅️ ➡️ '}</span>
            Use Arrow keys to move. Eat yellow squares (<span style={{ color: COLORS.accent }}>food</span>).
          </div>
          <div>Don't hit the walls or yourself. {moving ? "" : "Press any arrow key to start."}</div>
        </div>
      </main>
      <footer style={{ textAlign: "center", color: "#606060", opacity: 0.65, fontSize: "0.97em", marginTop: 24, marginBottom: 8 }}>
        &copy; {new Date().getFullYear()} SerpentQuest &mdash; KAVIA Demo
      </footer>
    </div>
  );
}

// PUBLIC_INTERFACE
// Export as default App container
export default App;