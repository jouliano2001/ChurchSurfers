import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // This throws on cold start if env vars are missing (good: fails fast)
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY server env vars."
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  // Basic CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, score } = req.body || {};

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Name is required." });
    }
    const cleanedName = name.trim().slice(0, 24);

    const numericScore = Number(score);
    if (!Number.isFinite(numericScore) || numericScore < 0) {
      return res.status(400).json({ error: "Score must be a valid number." });
    }

    // Upsert by unique name:
    // - If player exists, update if new score is higher
    // - If not exists, insert new
    const { data: existing, error: existingErr } = await supabase
      .from("scores")
      .select("name, score")
      .eq("name", cleanedName)
      .maybeSingle();

    if (existingErr) throw existingErr;

    if (!existing) {
      const { error: insertErr } = await supabase.from("scores").insert([
        { name: cleanedName, score: Math.floor(numericScore) },
      ]);
      if (insertErr) throw insertErr;

      return res.status(200).json({ ok: true, updated: "inserted" });
    }

    // Only update if higher
    if (Math.floor(numericScore) > existing.score) {
      const { error: updateErr } = await supabase
        .from("scores")
        .update({ score: Math.floor(numericScore) })
        .eq("name", cleanedName);

      if (updateErr) throw updateErr;

      return res.status(200).json({ ok: true, updated: "updated" });
    }

    return res.status(200).json({ ok: true, updated: "kept_best" });
  } catch (err) {
    return res.status(500).json({
      error: err?.message || "Server error",
    });
  }
}