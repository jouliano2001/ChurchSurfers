import { useEffect, useMemo, useRef, useState } from "react";
import { RigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import {
  DESPAWN_Z,
  LANES,
  OBSTACLE_SIZE,
  SPAWN_INTERVAL_MIN,
  SPAWN_INTERVAL_START,
  SPAWN_Z,
} from "./constants";

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function Obstacles({ speed, time, paused }) {
  const [items, setItems] = useState([]);
  const lastSpawnRef = useRef(0);

  // Store rigidbody refs by id so we can move them in useFrame
  const bodies = useRef(new Map());

  const spawnInterval = useMemo(() => {
    // decreases slowly
    return Math.max(SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_START - time * 0.01);
  }, [time]);

  useEffect(() => {
    if (paused) return;
    if (time - lastSpawnRef.current < spawnInterval) return;

    lastSpawnRef.current = time;

    const laneIndex = randInt(0, 2);
    const id = crypto.randomUUID();

    setItems((prev) => [
      ...prev,
      {
        id,
        laneIndex,
        x: LANES[laneIndex],
        y: OBSTACLE_SIZE.y / 2,
        z: SPAWN_Z,
      },
    ]);
  }, [time, spawnInterval, paused]);

  // Move obstacles smoothly (kinematic bodies)
  useFrame((_, dt) => {
    if (paused) return;

    const toRemove = [];
    for (const o of items) {
      const rb = bodies.current.get(o.id);
      if (!rb) continue;

      const t = rb.translation();
      const nextZ = t.z + speed * dt;

      rb.setNextKinematicTranslation({ x: t.x, y: t.y, z: nextZ });

      if (nextZ > DESPAWN_Z) toRemove.push(o.id);
    }

    if (toRemove.length) {
      setItems((prev) => prev.filter((o) => !toRemove.includes(o.id)));
      for (const id of toRemove) bodies.current.delete(id);
    }
  });

  return (
    <group>
      {items.map((o) => (
        <RigidBody
          key={o.id}
          type="kinematicPosition"
          colliders="cuboid"
          position={[o.x, o.y, o.z]}
          userData={{ type: "obstacle" }}
          ref={(rb) => {
            if (rb) bodies.current.set(o.id, rb);
          }}
        >
          <mesh castShadow>
            <boxGeometry args={[OBSTACLE_SIZE.x, OBSTACLE_SIZE.y, OBSTACLE_SIZE.z]} />
            <meshStandardMaterial />
          </mesh>
        </RigidBody>
      ))}
    </group>
  );
}
