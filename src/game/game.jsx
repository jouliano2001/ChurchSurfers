import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Physics } from "@react-three/rapier";
import { supabase } from "../supabaseClient";
import Ground from "./ground";
import Runner from "./runner";
import Obstacles from "./obstacles";
import Hud from "./hud";
import { COLORS, GAME, LANES } from "./constants";

async function submitScore({ name, score }) {
  const { error } = await supabase.from("scores").insert({ name, score });
  if (error) throw new Error(error.message);
}

function CameraRig({ laneIndex }) {
  const { camera } = useThree();

  useFrame((_, dt) => {
    // Keep camera centered so lane changes move the PLAYER, not the world visually.
    // If you want slight follow, set followStrength to a small value like 0.05.
    const followStrength = 0.0;
    const targetX = (LANES[laneIndex] ?? 0) * followStrength;

    const desired = { x: targetX, y: 3.6, z: 9.0 };

    camera.position.x += (desired.x - camera.position.x) * Math.min(1, dt * 6);
    camera.position.y += (desired.y - camera.position.y) * Math.min(1, dt * 6);
    camera.position.z += (desired.z - camera.position.z) * Math.min(1, dt * 6);

    camera.lookAt(0, 1.1, 0);
  });

  return null;
}

export default function Game({ displayName, onBackToStart }) {
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(GAME.startSpeed);
  const [gameOver, setGameOver] = useState(false);
  const [laneIndex, setLaneIndex] = useState(1);

  const [best, setBest] = useState(() => {
    const v = localStorage.getItem("bestScore");
    return v ? Number(v) : 0;
  });

  const [submitState, setSubmitState] = useState("idle"); // idle | submitting | done | error
  const [submitError, setSubmitError] = useState("");

  const obstaclesApiRef = useRef(null);

  const lastTRef = useRef(0);
  const speedRef = useRef(GAME.startSpeed);

  const onHit = useCallback(() => {
    setGameOver(true);
  }, []);

  const moveLane = useCallback(
    (dir) => {
      if (gameOver) return;
      setLaneIndex((current) => {
        const maxLane = LANES.length - 1;
        return Math.max(0, Math.min(maxLane, current + dir));
      });
    },
    [gameOver],
  );

  const onMoveLeft = useCallback(() => {
    moveLane(-1);
  }, [moveLane]);

  const onMoveRight = useCallback(() => {
    moveLane(1);
  }, [moveLane]);

  const reset = useCallback(() => {
    setScore(0);
    setSpeed(GAME.startSpeed);
    speedRef.current = GAME.startSpeed;

    setGameOver(false);
    setSubmitState("idle");
    setSubmitError("");

    lastTRef.current = 0;

    obstaclesApiRef.current?.clear?.();
    setLaneIndex(1);
  }, []);

  // RAF loop for speed + score
  useEffect(() => {
    let raf = 0;
    let mounted = true;

    const tick = () => {
      const t = performance.now() / 1000;
      const dt = t - (lastTRef.current || t);
      lastTRef.current = t;

      if (!gameOver) {
        setSpeed((sp) => {
          const next = Math.min(GAME.maxSpeed, sp + dt * GAME.speedIncrease);
          speedRef.current = next;
          return next;
        });

        setScore((s) => s + dt * 10 * speedRef.current);
      }

      if (mounted) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
    };
  }, [gameOver]);

  // Local best
  useEffect(() => {
    if (!gameOver) return;
    const s = Math.floor(score);
    if (s > best) {
      setBest(s);
      localStorage.setItem("bestScore", String(s));
    }
  }, [gameOver, score, best]);

  // Submit once
  useEffect(() => {
    if (!gameOver) return;
    if (!displayName || displayName.length < 2) return;
    if (submitState !== "idle") return;

    const s = Math.floor(score);
    setSubmitState("submitting");
    setSubmitError("");

    submitScore({ name: displayName, score: s })
      .then(() => setSubmitState("done"))
      .catch((e) => {
        setSubmitState("error");
        setSubmitError(e?.message || "Submit failed");
      });
  }, [gameOver, score, displayName, submitState]);

  const bg = useMemo(
    () => ({
      background:
        "radial-gradient(1200px 600px at 50% 30%, rgba(84,120,255,0.25), rgba(0,0,0,0.9))",
      minHeight: "100svh",
    }),
    [],
  );

  return (
    <div style={bg}>
      <Canvas
        camera={{ position: [0, 3.6, 9], fov: 55, near: 0.1, far: 200 }}
        style={{ height: "100svh", width: "100vw" }}
      >
        <color attach="background" args={[COLORS.sky]} />

        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 7, 4]} intensity={1.1} castShadow />

        <CameraRig laneIndex={laneIndex} />

        <Physics gravity={[0, 0, 0]}>
          <Ground speedRef={speedRef} />
          <Runner laneIndex={laneIndex} onHit={onHit} />
          <Obstacles
            speedRef={speedRef}
            gameOver={gameOver}
            obstaclesRef={obstaclesApiRef}
          />
        </Physics>
      </Canvas>

      <Hud
        score={score}
        speed={speed}
        gameOver={gameOver}
        onRestart={reset}
        onBackToStart={onBackToStart}
        displayName={displayName}
        onMoveLeft={onMoveLeft}
        onMoveRight={onMoveRight}
      />

      <div
        style={{
          position: "fixed",
          left: 16,
          bottom: 12,
          fontSize: 12,
          opacity: 0.85,
          pointerEvents: "none",
        }}
      >
        <div>
          Local best: <b>{best}</b>
        </div>
        <div>
          Player: <b>{displayName || "?"}</b>
        </div>

        {gameOver && (
          <div style={{ marginTop: 6 }}>
            {submitState === "submitting" && "Submitting score…"}
            {submitState === "done" && "Score saved to global leaderboard ✅"}
            {submitState === "error" && (
              <>
                Submit failed: <b>{submitError}</b>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
