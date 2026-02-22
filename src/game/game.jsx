import { useCallback, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, PerspectiveCamera } from "@react-three/drei";
import { Physics } from "@react-three/rapier";

import Hud from "./hud";
import Ground from "./ground";
import Runner from "./runner";
import Obstacles from "./obstacles";
import { WORLD_SPEED_RAMP, WORLD_SPEED_START } from "./constants";

function Scene({ gameOver, onGameOver, scoreRef, speedRef, restartToken }) {
  // const keys = useKeyboard(); // Removed, handling inputs directly

  const [laneIndex, setLaneIndex] = useState(1);
  const [jumpRequested, setJumpRequested] = useState(false);

  const timeRef = useRef(0);
  // const canSwitchRef = useRef(true); // Removed, not needed

  const { gl } = useThree(); // Access the canvas element

  // Add direct input handling for keys and touches
  useEffect(() => {
    let touchStartX = 0;

    const handleKeyDown = (e) => {
      if (gameOver) return;
      if (e.code === "ArrowLeft" || e.key.toLowerCase() === "a") {
        setLaneIndex((x) => Math.max(0, x - 1));
      } else if (e.code === "ArrowRight" || e.key.toLowerCase() === "d") {
        setLaneIndex((x) => Math.min(2, x + 1));
      } else if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        setJumpRequested(true);
      }
    };

    const handleTouchStart = (e) => {
      if (gameOver) return;
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      if (gameOver) return;
      const touchEndX = e.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartX;
      const threshold = 50; // Minimum swipe distance

      if (Math.abs(deltaX) > threshold) {
        // Swipe detected
        if (deltaX > 0) {
          // Swipe right -> move right
          setLaneIndex((x) => Math.min(2, x + 1));
        } else {
          // Swipe left -> move left
          setLaneIndex((x) => Math.max(0, x - 1));
        }
      } else {
        // Tap -> jump
        setJumpRequested(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    gl.domElement.addEventListener("touchstart", handleTouchStart);
    gl.domElement.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      gl.domElement.removeEventListener("touchstart", handleTouchStart);
      gl.domElement.removeEventListener("touchend", handleTouchEnd);
    };
  }, [gameOver, gl]);

  useFrame((_, dt) => {
    if (gameOver) return;

    timeRef.current += dt;

    // speed + score
    speedRef.current = WORLD_SPEED_START + timeRef.current * WORLD_SPEED_RAMP;
    scoreRef.current += dt * (10 + speedRef.current * 0.3);

    // lane switching and jump handled in useEffect
  });

  const consumeJump = useCallback(() => setJumpRequested(false), []);

  // Add direct jump handling for keys and touches
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        setJumpRequested(true);
      }
    };

    const handleTouchStart = (e) => {
      if (gameOver) return;
      e.preventDefault();
      setJumpRequested(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    gl.domElement.addEventListener("touchstart", handleTouchStart); // Listen on canvas for mobile

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      gl.domElement.removeEventListener("touchstart", handleTouchStart);
    };
  }, [gameOver, gl]);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 6, 12]}
        fov={55}
        onUpdate={(cam) => cam.lookAt(0, 1, -20)}
      />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[6, 10, 4]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <Environment preset="city" />
      <fog attach="fog" args={["#060914", 10, 70]} />

      <Physics gravity={[0, -30, 0]} key={restartToken}>
        <Ground />

        <Runner
          laneIndex={laneIndex}
          jumpRequested={jumpRequested}
          consumeJump={consumeJump}
          onHit={onGameOver}
          gameOver={gameOver}
        />

        <Obstacles speed={speedRef} time={timeRef} paused={gameOver} />
      </Physics>
    </>
  );
}

function StartScreen({ onStart, scores }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        textAlign: "center",
      }}
    >
      <div>
        <h1>Church Surfers</h1>
        <button
          onClick={onStart}
          style={{
            padding: "10px 20px",
            fontSize: 18,
            margin: "20px",
            cursor: "pointer",
          }}
        >
          Start Game
        </button>
        <h2>High Scores</h2>
        <table style={{ margin: "0 auto", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid white", padding: 8 }}>Score</th>
              <th style={{ border: "1px solid white", padding: 8 }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score, i) => (
              <tr key={i}>
                <td style={{ border: "1px solid white", padding: 8 }}>
                  {score.value}
                </td>
                <td style={{ border: "1px solid white", padding: 8 }}>
                  {score.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Game() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [restartToken, setRestartToken] = useState(0);
  const [scores, setScores] = useState(
    () => JSON.parse(localStorage.getItem("gameScores")) || [],
  );

  const scoreRef = useRef(0);
  const speedRef = useRef(WORLD_SPEED_START);

  const [hudScore, setHudScore] = useState(0);
  const [hudSpeed, setHudSpeed] = useState(WORLD_SPEED_START);

  const onGameOver = useCallback(() => {
    setGameOver(true);
    const newScores = [
      ...scores,
      {
        value: Math.floor(scoreRef.current),
        date: new Date().toLocaleDateString(),
      },
    ];
    newScores.sort((a, b) => b.value - a.value);
    setScores(newScores.slice(0, 10));
    localStorage.setItem("gameScores", JSON.stringify(newScores.slice(0, 10)));
  }, [scores]);

  const restart = useCallback(() => {
    setGameOver(false);
    scoreRef.current = 0;
    speedRef.current = WORLD_SPEED_START;
    setHudScore(0);
    setHudSpeed(WORLD_SPEED_START);
    setRestartToken((x) => x + 1);
  }, []);

  const startGame = useCallback(() => {
    setGameStarted(true);
    restart();
  }, [restart]);

  const backToStart = useCallback(() => {
    setGameStarted(false);
    setGameOver(false);
  }, []);

  // Update HUD at ~10fps (avoid rerendering every frame)
  function HudTicker() {
    const acc = useRef(0);
    useFrame((_, dt) => {
      acc.current += dt;
      if (acc.current >= 0.1) {
        acc.current = 0;
        setHudScore(scoreRef.current);
        setHudSpeed(speedRef.current);
      }
    });
    return null;
  }

  if (!gameStarted) {
    return <StartScreen onStart={startGame} scores={scores} />;
  }

  return (
    <>
      <Canvas shadows dpr={[1, 2]}>
        <color attach="background" args={["#060914"]} />
        <HudTicker />
        <Scene
          gameOver={gameOver}
          onGameOver={onGameOver}
          scoreRef={scoreRef}
          speedRef={speedRef}
          restartToken={restartToken}
        />
      </Canvas>

      <Hud
        score={hudScore}
        speed={hudSpeed}
        gameOver={gameOver}
        onRestart={restart}
        onBackToStart={backToStart}
      />
    </>
  );
}
