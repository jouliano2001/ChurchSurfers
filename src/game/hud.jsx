export default function Hud({
  score,
  speed,
  gameOver,
  onRestart,
  onBackToStart,
  displayName,
  onMoveLeft,
  onMoveRight,
}) {
  const triggerMoveLeft = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onMoveLeft?.();
  };

  const triggerMoveRight = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onMoveRight?.();
  };

  const pill = {
    background: "rgba(0,0,0,0.45)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: "10px 12px",
    backdropFilter: "blur(6px)",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        padding: 16,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ ...pill, minWidth: 140, color: "white" }}>
          <div style={{ fontSize: 12, opacity: 0.85 }}>Player</div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>
            {displayName || "—"}
          </div>
        </div>

        <div style={{ ...pill, color: "white" }}>
          <div style={{ fontSize: 12, opacity: 0.85 }}>Score</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>
            {Math.floor(score)}
          </div>
        </div>

        <div
          style={{ ...pill, textAlign: "right", minWidth: 90, color: "white" }}
        >
          <div style={{ fontSize: 12, opacity: 0.85 }}>Speed</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>
            {speed.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Mobile controls */}
      {!gameOver && (
        <div
          data-control-zone="lane-buttons"
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 20,
            pointerEvents: "auto",
            touchAction: "manipulation",
          }}
        >
          <button
            type="button"
            onPointerDown={triggerMoveLeft}
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.3)",
              background: "rgba(0,0,0,0.5)",
              color: "white",
              fontSize: 24,
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ←
          </button>
          <button
            type="button"
            onPointerDown={triggerMoveRight}
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.3)",
              background: "rgba(0,0,0,0.5)",
              color: "white",
              fontSize: 24,
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            →
          </button>
        </div>
      )}

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
            <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>
              Game Over
            </div>
            <div style={{ opacity: 0.85, marginBottom: 14 }}>
              Score: <b>{Math.floor(score)}</b>
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                onClick={onBackToStart}
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
                Back to Start
              </button>
            </div>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
              Move: A/D or ←/→ · Swipe left/right on mobile
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
