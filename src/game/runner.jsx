import { useEffect, useRef } from "react";
import { RigidBody, CapsuleCollider } from "@react-three/rapier";
import {
  LANE_X,
  PLAYER_HEIGHT,
  PLAYER_RADIUS,
  PLAYER_Y,
  PLAYER_Z,
} from "./constants";

export default function Runner({ laneIndex, onHit }) {
  const bodyRef = useRef(null);

  // Snap instantly to lane on change
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    try {
      const t = body.translation();
      body.setTranslation(
        {
          x: LANE_X[laneIndex] ?? 0,
          y: t.y,
          z: t.z,
        },
        true,
      );
    } catch {
      // ignore
    }
  }, [laneIndex]);

  return (
    <RigidBody
      ref={bodyRef}
      colliders={false}
      type="dynamic"
      position={[LANE_X[1], PLAYER_Y, PLAYER_Z]}
      enabledRotations={[false, false, false]}
      // Allow only X translation (lanes). Lock Y/Z.
      enabledTranslations={[true, false, false]}
      gravityScale={0}
      linearDamping={1.2}
      userData={{ type: "runner" }}
      onCollisionEnter={(e) => {
        const other = e.other?.rigidBodyObject;
        if (other?.userData?.type === "obstacle") onHit?.();
      }}
    >
      <CapsuleCollider args={[PLAYER_HEIGHT * 0.35, PLAYER_RADIUS]} />

      <mesh castShadow>
        <capsuleGeometry args={[PLAYER_RADIUS, PLAYER_HEIGHT, 8, 16]} />
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={1.2}
        />
      </mesh>

      <mesh position={[0, PLAYER_HEIGHT * 0.9, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color="#00aaff"
          emissive="#00aaff"
          emissiveIntensity={2}
        />
      </mesh>
    </RigidBody>
  );
}
