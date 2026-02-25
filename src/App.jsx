import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import Game from "./game/game";

function getStoredName() {
  try {
    return localStorage.getItem("cs_name") || "";
  } catch {
    return "";
  }
}

function setStoredName(name) {
  try {
    localStorage.setItem("cs_name", name);
  } catch {
    // ignore
  }
}

async function fetchLeaderboard() {
  const { data, error } = await supabase
    .from("scores")
    .select("name, score")
    .order("score", { ascending: false })
    .limit(10);
  if (error) throw new Error(error.message);
  return { leaderboard: data };
}

export default function App() {
  const [screen, setScreen] = useState("start"); // "start" | "game"
  const [name, setName] = useState(getStoredName());
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLb, setLoadingLb] = useState(true);
  const [lbError, setLbError] = useState("");

  const canStart = useMemo(() => name.trim().length >= 2, [name]);

  useEffect(() => {
    let alive = true;
    setLoadingLb(true);
    setLbError("");

    fetchLeaderboard()
      .then((data) => {
        if (!alive) return;
        setLeaderboard(data.leaderboard || []);
      })
      .catch((e) => {
        if (!alive) return;
        setLbError(e?.message || "Could not load leaderboard");
      })
      .finally(() => {
        if (!alive) return;
        setLoadingLb(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh" }}>
      {screen === "start" ? (
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              width: "min(820px, 96vw)",
              display: "flex",
              flexDirection: window.innerWidth < 768 ? "column" : "row",
              gap: 14,
              alignItems: window.innerWidth < 768 ? "stretch" : "start",
            }}
          >
            <div
              style={{
                background: "rgba(10,14,30,0.9)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 16,
                padding: 18,
              }}
            >
              <div style={{ fontSize: 30, fontWeight: 900 }}>ChurchSurfers</div>
              <div style={{ opacity: 0.85, marginTop: 6, marginBottom: 14 }}>
                Enter a display name (this is what gets saved in the database).
              </div>

              <label style={{ fontSize: 12, opacity: 0.85 }}>
                Display name
              </label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setStoredName(e.target.value);
                }}
                placeholder="e.g. Jouliano"
                maxLength={24}
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  marginTop: 6,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.06)",
                  color: "white",
                  outline: "none",
                  fontWeight: 700,
                }}
              />

              <button
                disabled={!canStart}
                onClick={() => setScreen("game")}
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: canStart
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(255,255,255,0.06)",
                  color: "white",
                  cursor: canStart ? "pointer" : "not-allowed",
                  fontWeight: 900,
                }}
              >
                Start
              </button>

              <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
                Move with the on-screen left/right buttons
              </div>
            </div>

            <div
              style={{
                background: "rgba(10,14,30,0.9)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 16,
                padding: 18,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>
                Global Leaderboard
              </div>

              {loadingLb ? (
                <div style={{ opacity: 0.85 }}>Loading…</div>
              ) : lbError ? (
                <div style={{ opacity: 0.85 }}>{lbError}</div>
              ) : leaderboard.length === 0 ? (
                <div style={{ opacity: 0.85 }}>No scores yet.</div>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {leaderboard.map((row, idx) => (
                    <div
                      key={`${row.name}-${idx}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        padding: "10px 12px",
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        fontWeight: 800,
                      }}
                    >
                      <div style={{ opacity: 0.9 }}>
                        {idx + 1}. {row.name}
                      </div>
                      <div>{row.score}</div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={async () => {
                  setLoadingLb(true);
                  setLbError("");
                  try {
                    const data = await fetchLeaderboard();
                    setLeaderboard(data.leaderboard || []);
                  } catch (e) {
                    setLbError(e?.message || "Could not load leaderboard");
                  } finally {
                    setLoadingLb(false);
                  }
                }}
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.10)",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      ) : (
        <Game
          displayName={name.trim()}
          onBackToStart={() => setScreen("start")}
        />
      )}
    </div>
  );
}
