import { RigidBody } from "@react-three/rapier";
import { FLOOR_TOTAL_LEN, FLOOR_WIDTH } from "./constants";

export default function Ground() {
  // A single long slab for both physics + visuals
const centerZ = -FLOOR_TOTAL_LEN / 2 + 20; 
// For len=140, center becomes -50 => road spans z [-120, +20]

  return (
    <group>
      <RigidBody type="fixed" colliders="cuboid" position={[0, -0.5, centerZ]}>
        <mesh receiveShadow>
          <boxGeometry args={[FLOOR_WIDTH, 1, FLOOR_TOTAL_LEN]} />
          <meshStandardMaterial />
        </mesh>
      </RigidBody>

      {/* lane lines */}
      <mesh position={[-1, 0.02, centerZ]} receiveShadow>
        <boxGeometry args={[0.05, 0.02, FLOOR_TOTAL_LEN]} />
        <meshStandardMaterial />
      </mesh>
      <mesh position={[1, 0.02, centerZ]} receiveShadow>
        <boxGeometry args={[0.05, 0.02, FLOOR_TOTAL_LEN]} />
        <meshStandardMaterial />
      </mesh>
    </group>
  );
}
