// src/game/constants.js

export const LANES = [-2, 0, 2]; // x positions for 3 lanes
export const PLAYER_Z = -2;

export const WORLD_SPEED_START = 10; // units/sec
export const WORLD_SPEED_RAMP = 0.5;

export const FLOOR_WIDTH = 8;
export const FLOOR_TOTAL_LEN = 140;

export const SPAWN_Z = -60;
export const DESPAWN_Z = 14;

export const SPAWN_INTERVAL_START = 0.9;
export const SPAWN_INTERVAL_MIN = 0.35;

export const PLAYER_RADIUS = 0.45;
export const PLAYER_HEIGHT = 1.2;

export const OBSTACLE_SIZE = { x: 1.3, y: 1.3, z: 1.3 };

// ✅ ADD THIS (fixes the crash)
export const COLORS = {
  sky: "#87CEEB",
  ground: "#3b3b3b",
  lane: "#1f1f1f",
  player: "#ffd54a",
  obstacle: "#ff4d4d",
  uiBg: "rgba(0,0,0,0.65)",
  uiText: "#ffffff",
};