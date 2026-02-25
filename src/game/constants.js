// src/game/constants.js

// 3-lane runner (Subway-like)
export const LANE_WIDTH = 1.6;
export const LANE_X = [-LANE_WIDTH, 0, LANE_WIDTH];
export const LANES = LANE_X; // backward compatibility

export const COLORS = {
  background: "#050814",
  sky: "#050814",
  ground: "#ffffff",
  runner: "#00ff88",
  obstacle: "#ffffff",
  hudText: "#ffffff",
};

// Player dimensions
export const PLAYER_RADIUS = 0.42;
export const PLAYER_HEIGHT = 1.25;

// Runner fixed position (we only move in X lanes)
export const PLAYER_Y = 0.95;
export const PLAYER_Z = 0;

// Obstacle sizes (half-width <= LANE_WIDTH * 0.35 = 0.56)
export const OBSTACLE_SIZES = [
  { x: 0.8, y: 1.1, z: 1.1 },
  { x: 1.0, y: 1.0, z: 1.2 },
  { x: 0.9, y: 1.4, z: 1.2 },
];

// Lane change speed (for smoothing)
export const LANE_CHANGE_SPEED = 8;

// Game tuning
export const GAME = {
  // Camera is at z=9 looking at z=0, so "forward" is negative Z.
  // Spawn obstacles in front (negative Z), then move toward the player (increase z).
  spawnZ: -55,
  despawnZ: 18,

  startSpeed: 12,
  // No speed limit
  maxSpeed: Infinity,
  speedIncrease: 0.25,

  // Spawning: row system
  baseGapZ: 12, // initial gap between rows
  minGapZ: 6, // minimum gap
  gapShrinkFactor: 0.1, // how much gap shrinks with speed
  maxActiveRows: 5, // max rows active
  earlyGameSeconds: 10, // first N seconds: only 1 obstacle per row
};

// Backward-compatible aliases

// Backward-compatible aliases
export const SPAWN_Z = GAME.spawnZ;
export const DESPAWN_Z = GAME.despawnZ;
export const WORLD_SPEED_START = GAME.startSpeed;
export const WORLD_SPEED_RAMP = GAME.speedIncrease;
export const SPAWN_INTERVAL_START = GAME.spawnIntervalStart;
export const SPAWN_INTERVAL_MIN = GAME.spawnIntervalMin;
export const FLOOR_WIDTH = GAME.floorWidth;
export const FLOOR_TOTAL_LEN = GAME.floorLength;

// Optional legacy export
export const OBSTACLE_SIZE = OBSTACLE_SIZES[0];
