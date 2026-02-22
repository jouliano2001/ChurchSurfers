import { Canvas, useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Ground from "./ground";
import Runner from "./runner";
import Obstacles from "./obstacles";
import Hud from "./hud";
import { COLORS, GAME } from "./constants";

async function submitScore({ name, score }) {
  const res = await fetch("/api/submit-score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, score }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || "Failed to submit score");
  }
  return data;
}

export default function Game({ displayName, onBackToStart }) {
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(GAME.startSpeed);
  const [gameOver, setGameOver] = useState(false);

  const [best, setBest] = useState(() => {
    const v = localStorage.getItem("bestScore");
    return v ? Number(v) : 0;
  });

  const [submitState, setSubmitState] = useState("idle"); // idle | submitting | done | error
  const [submitError, setSubmitError] = useState("");

  const runnerRef = useRef();
  const obstaclesRef = useRef([]);

  const timeRef = useRef(0);
  const lastTRef = useRef(0);

  const onCollide = useCallback(() => {
    setGameOver(true);
  }, []);

  const reset = useCallback(() => {
    setScore(0);
    setSpeed(GAME.startSpeed);
    setGameOver(false);
    setSubmitState("idle");
    setSubmitError("");
    timeRef.current = 0;
    lastTRef.current = 0;

    // Clear obstacles
    obstaclesRef.current = [];

    // Reset runner
    if (runnerRef.current?.reset) runnerRef.current.reset();
  }, []);

  // Main loop
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const dt = t - (lastTRef.current || t);
    lastTRef.current = t;

    if (gameOver) return;

    timeRef.current += dt;

    // Score increases over time (scaled by speed)
    setScore((s) => s + dt * 10 * speed);

    // Speed ramps
    setSpeed((sp) => Math.min(GAME.maxSpeed, sp + dt * GAME.speedIncrease));
  });

  // Save local best
  useEffect(() => {
    if (gameOver) {
      const s = Math.floor(score);
      if (s > best) {
        setBest(s);
        localStorage.setItem("bestScore", String(s));
      }
    }
  }, [gameOver, score, best]);

  // Submit to DB once per game over
  useEffect(() => {
    if (!gameOver) return;
    if (!displayName || displayName.length < 2) return;
    if (submitState !== "idle") return;

    const s = Math.floor(score);
    setSubmitState("submitting");
    setSubmitError("");

    submitScore({ name: displayName, score: s })
      .then(() => {
        setSubmitState("done");
      })
      .catch((e) => {
        setSubmitState("error");
        setSubmitError(e?.message || "Submit failed");
      });
  }, [gameOver, score, displayName, submitState]);

  const bg = useMemo(
    () => ({
      background:
        "radial-gradient(1200px 600px at 50% 30%, rgba(84,120,255,0.25), rgba(0,0,0,0.9))",
      minHeight: "100vh",
    }),
    [],
  );

  return (
    <div style={bg}>
      <Canvas
        camera={{ position: [0, 2.5, 6], fov: 55 }}
        style={{ height: "100vh" }}
      >
        <color attach="background" args={[COLORS.sky]} />

        <ambientLight intensity={0.8} />
        <directionalLight position={[4, 6, 3]} intensity={1.1} />

        <Ground speed={speed} time={timeRef.current} />
        <Runner ref={runnerRef} gameOver={gameOver} />
        <Obstacles
          obstaclesRef={obstaclesRef}
          speed={speed}
          time={timeRef.current}
          runnerRef={runnerRef}
          onCollide={onCollide}
        />
      </Canvas>

      <Hud
        score={score}
        speed={speed}
        gameOver={gameOver}
        onRestart={reset}
        onBackToStart={onBackToStart}
      />

      {/* Small status footer */}
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
