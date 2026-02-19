import { useEffect, useRef } from "react";
import { RigidBody, CapsuleCollider } from "@react-three/rapier";
import { LANES, PLAYER_HEIGHT, PLAYER_RADIUS, PLAYER_Z } from "./constants";

export default function Runner({ laneIndex, jumpRequested, consumeJump, onHit, gameOver }) {
  const bodyRef = useRef(null);

  // Only snap X to lane. Do NOT overwrite Z/Y (so physics stays stable).
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    const t = body.translation();
    body.setTranslation({ x: LANES[laneIndex], y: t.y, z: t.z }, true);
  }, [laneIndex]);

  // jump
  useEffect(() => {
    if (!jumpRequested || gameOver) return;

    const body = bodyRef.current;
    if (!body) return;

    const t = body.translation();
    if (t.y <= 0.06) {
      const v = body.linvel();
      body.setLinvel({ x: v.x, y: 10, z: v.z }, true);
    }
    consumeJump();
  }, [jumpRequested, consumeJump, gameOver]);

  return (
    <RigidBody
      ref={bodyRef}
      colliders={false}
      type="dynamic"
      // spawn ABOVE the ground so it can settle
      position={[LANES[1], 1.2, PLAYER_Z]}
      enabledRotations={[false, false, false]}
      enabledTranslations={[true, true, false]}
      linearDamping={0.9}
      onCollisionEnter={(e) => {
        const other = e.other?.rigidBodyObject;
        if (other?.userData?.type === "obstacle") onHit?.();
      }}
    >
      {/* physics collider */}
      <CapsuleCollider args={[PLAYER_HEIGHT * 0.35, PLAYER_RADIUS]} />

      {/* DEBUG marker (bright green) */}
      <mesh castShadow>
        <capsuleGeometry args={[PLAYER_RADIUS, PLAYER_HEIGHT, 8, 16]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={1.2} />
      </mesh>

      {/* extra marker to make it impossible to miss */}
      <mesh position={[0, PLAYER_HEIGHT * 0.9, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={2} />
      </mesh>
    </RigidBody>
  );
}
