import { RigidBody } from "@react-three/rapier";
import { COLORS, GAME, LANE_WIDTH, LANE_X } from "./constants";

export default function Ground() {
  const zStart = GAME.despawnZ - 10;
  const zEnd = GAME.spawnZ + 20;
  const len = zEnd - zStart;
  const centerZ = (zStart + zEnd) / 2;

  return (
    <group>
      <RigidBody type="fixed" colliders="cuboid" position={[0, -0.6, centerZ]}>
        <mesh receiveShadow>
          <boxGeometry args={[GAME.floorWidth, 1, len]} />
          <meshStandardMaterial
            color={COLORS.ground}
            emissive={COLORS.ground}
            emissiveIntensity={0.25}
          />
        </mesh>
      </RigidBody>

      {/* Lane center lines */}
      {LANE_X.map((x, i) => (
        <mesh key={i} position={[x, 0.01, centerZ]} receiveShadow>
          <boxGeometry args={[0.1, 0.01, len]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}

      {/* Lane separators */}
      <mesh position={[-LANE_WIDTH / 2, 0.02, centerZ]} receiveShadow>
        <boxGeometry args={[0.06, 0.02, len]} />
        <meshStandardMaterial
          color="#cfd7ff"
          emissive="#cfd7ff"
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[LANE_WIDTH / 2, 0.02, centerZ]} receiveShadow>
        <boxGeometry args={[0.06, 0.02, len]} />
        <meshStandardMaterial
          color="#cfd7ff"
          emissive="#cfd7ff"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}
