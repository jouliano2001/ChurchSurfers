import { useCallback, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, PerspectiveCamera } from "@react-three/drei";
import { Physics } from "@react-three/rapier";

import Hud from "./Hud";
import Ground from "./Ground";
import Runner from "./Runner";
import Obstacles from "./Obstacles";
import { useKeyboard } from "./useKeyboard";
import { WORLD_SPEED_RAMP, WORLD_SPEED_START } from "./constants";

function Scene({ gameOver, onGameOver, scoreRef, speedRef, restartToken }) {
  const keys = useKeyboard();

  const [laneIndex, setLaneIndex] = useState(1);
  const [jumpRequested, setJumpRequested] = useState(false);

  const timeRef = useRef(0);
  const canSwitchRef = useRef(true);

  useFrame((_, dt) => {
    if (gameOver) return;

    timeRef.current += dt;

    // speed + score
    speedRef.current = WORLD_SPEED_START + timeRef.current * WORLD_SPEED_RAMP;
    scoreRef.current += dt * (10 + speedRef.current * 0.3);

    // lane switching (edge-trigger)
    const left = keys.current.left;
    const right = keys.current.right;

    if (canSwitchRef.current) {
      if (left) {
        setLaneIndex((x) => Math.max(0, x - 1));
        canSwitchRef.current = false;
      } else if (right) {
        setLaneIndex((x) => Math.min(2, x + 1));
        canSwitchRef.current = false;
      }
    }
    if (!left && !right) canSwitchRef.current = true;

    // jump (edge-trigger)
    if (keys.current.jump) setJumpRequested(true);
  });

  const consumeJump = useCallback(() => setJumpRequested(false), []);

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

        <Obstacles
          speed={speedRef.current}
          time={timeRef.current}
          paused={gameOver}
        />
      </Physics>
    </>
  );
}

export default function Game() {
  const [gameOver, setGameOver] = useState(false);
  const [restartToken, setRestartToken] = useState(0);

  const scoreRef = useRef(0);
  const speedRef = useRef(WORLD_SPEED_START);

  const [hudScore, setHudScore] = useState(0);
  const [hudSpeed, setHudSpeed] = useState(WORLD_SPEED_START);

  const onGameOver = useCallback(() => setGameOver(true), []);

  const restart = useCallback(() => {
    setGameOver(false);
    scoreRef.current = 0;
    speedRef.current = WORLD_SPEED_START;
    setHudScore(0);
    setHudSpeed(WORLD_SPEED_START);
    setRestartToken((x) => x + 1);
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
      />
    </>
  );
}
