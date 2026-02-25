import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { COLORS, GAME, LANE_WIDTH, LANE_X } from "./constants";

export default function Ground({ speedRef }) {
  const roadTex = useTexture("/road.png");
  const repeatY = 12;

  roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping;
  roadTex.repeat.set(1, repeatY);
  roadTex.anisotropy = 8;

  const zStart = GAME.spawnZ - 20;
  const zEnd = GAME.despawnZ + 10;
  const len = zEnd - zStart;
  const centerZ = (zStart + zEnd) / 2;
  const uvPerWorldUnit = repeatY / len;

  useFrame((_, dt) => {
    const speed = speedRef?.current ?? GAME.startSpeed;
    // Move in the same world direction as obstacles (+Z), scaled by world speed.
    roadTex.offset.y += speed * dt * uvPerWorldUnit;
  });

  return (
    <group>
      <RigidBody type="fixed" colliders="cuboid" position={[0, -0.6, centerZ]}>
        <mesh receiveShadow>
          <boxGeometry args={[GAME.floorWidth, 1, len]} />
          <meshStandardMaterial
            map={roadTex}
            color="#ffffff"
            emissive="#000000"
            emissiveIntensity={0}
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
