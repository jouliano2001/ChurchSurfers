import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import { GAME, LANE_X, OBSTACLE_SIZES } from "./constants";

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function pickSize() {
  return OBSTACLE_SIZES[Math.floor(Math.random() * OBSTACLE_SIZES.length)];
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function Obstacles({ speedRef, gameOver, obstaclesRef }) {
  const [rows, setRows] = useState([]);
  const bodies = useRef(new Map());

  const lastRowZ = useRef(GAME.spawnZ);
  const gameStartTime = useRef(performance.now() / 1000);

  // Expose a safe clear() API to the parent
  useEffect(() => {
    if (!obstaclesRef) return;
    obstaclesRef.current = {
      clear: () => {
        bodies.current.clear();
        setRows([]);
        lastRowZ.current = GAME.spawnZ;
        gameStartTime.current = performance.now() / 1000;
      },
    };
  }, [obstaclesRef]);

  useFrame((_, dt) => {
    if (gameOver) return;

    const speed = speedRef?.current ?? GAME.startSpeed;
    const currentTime = performance.now() / 1000;
    const gameTime = currentTime - gameStartTime.current;

    // Spawn new row if needed
    const gapZ = Math.max(
      GAME.minGapZ,
      GAME.baseGapZ - GAME.gapShrinkFactor * speed,
    );
    const spawnZ = lastRowZ.current - gapZ;

    if (
      Math.abs(spawnZ - lastRowZ.current) >= gapZ &&
      rows.length < GAME.maxActiveRows
    ) {
      // Determine number of blocked lanes
      const isEarly =
        gameTime < GAME.earlyGameSeconds || speed < GAME.startSpeed + 2;
      const numBlocked = isEarly ? 1 : Math.random() < 0.6 ? 1 : 2; // 60% chance for 1, 40% for 2

      // Choose which lanes to block
      const allLanes = [0, 1, 2];
      shuffle(allLanes);
      const blockedLanes = allLanes.slice(0, numBlocked);

      const rowId = uid();
      const obstacles = blockedLanes.map((laneIndex) => ({
        id: uid(),
        laneIndex,
        size: pickSize(),
      }));

      setRows((prev) => [...prev, { id: rowId, z: spawnZ, obstacles }]);
      lastRowZ.current = spawnZ;
    }

    // Move rows
    const toRemove = [];
    for (const row of rows) {
      row.z += speed * dt;
      if (row.z > GAME.despawnZ) toRemove.push(row.id);
    }

    if (toRemove.length) {
      setRows((prev) => prev.filter((r) => !toRemove.includes(r.id)));
      toRemove.forEach((rowId) => {
        const row = rows.find((r) => r.id === rowId);
        if (row) row.obstacles.forEach((o) => bodies.current.delete(o.id));
      });
    }
  });

  return (
    <group>
      {rows.map((row) =>
        row.obstacles.map((o) => (
          <RigidBody
            key={o.id}
            ref={(rb) => {
              if (rb) bodies.current.set(o.id, rb);
              else bodies.current.delete(o.id);
            }}
            type="kinematicPosition"
            position={[LANE_X[o.laneIndex], 0.6, row.z]}
            colliders="cuboid"
            userData={{ type: "obstacle" }}
          >
            <mesh castShadow receiveShadow>
              <boxGeometry args={[o.size.x, o.size.y, o.size.z]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={0.15}
              />
            </mesh>
          </RigidBody>
        )),
      )}
    </group>
  );
}
