export default function Hud({ score, speed, gameOver, onRestart }) {
  const pill = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 12,
    padding: "10px 12px",
    backdropFilter: "blur(6px)",
  };

  return (
    <div style={{ position: "fixed", inset: 0, padding: 16, pointerEvents: "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={pill}>
          <div style={{ fontSize: 12, opacity: 0.85 }}>Score</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{Math.floor(score)}</div>
        </div>

        <div style={{ ...pill, textAlign: "right" }}>
          <div style={{ fontSize: 12, opacity: 0.85 }}>Speed</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{speed.toFixed(1)}</div>
        </div>
      </div>

      {gameOver && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: "rgba(0,0,0,0.55)",
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              width: "min(420px, 92vw)",
              background: "rgba(10,14,30,0.9)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 16,
              padding: 18,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>Game Over</div>
            <div style={{ opacity: 0.85, marginBottom: 14 }}>
              Score: <b>{Math.floor(score)}</b>
            </div>

            <button
              onClick={onRestart}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.10)",
                color: "white",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              Restart
            </button>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
              Move: A/D or ←/→ · Jump: W/↑/Space
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
