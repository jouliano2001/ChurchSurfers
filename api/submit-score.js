// api/submit-score.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, score } = req.body || {};

    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanScore = Number(score);

    if (!cleanName || cleanName.length < 2 || cleanName.length > 20) {
      return res.status(400).json({ error: "Name must be 2-20 characters." });
    }
    if (!Number.isFinite(cleanScore) || cleanScore < 0) {
      return res
        .status(400)
        .json({ error: "Score must be a valid number >= 0." });
    }

    // Upsert row for this name
    // Requires UNIQUE index on scores(name)
    // Then we update only if the incoming score is higher
    const { data: existing, error: existingErr } = await supabase
      .from("scores")
      .select("id, score")
      .eq("name", cleanName)
      .maybeSingle();

    if (existingErr) {
      return res.status(500).json({ error: existingErr.message });
    }

    if (!existing) {
      const { error: insertErr } = await supabase
        .from("scores")
        .insert([{ name: cleanName, score: cleanScore }]);

      if (insertErr) return res.status(500).json({ error: insertErr.message });
      return res.status(200).json({ ok: true, action: "inserted" });
    }

    // Only update if higher score
    if (cleanScore > existing.score) {
      const { error: updateErr } = await supabase
        .from("scores")
        .update({ score: cleanScore })
        .eq("id", existing.id);

      if (updateErr) return res.status(500).json({ error: updateErr.message });
      return res.status(200).json({ ok: true, action: "updated" });
    }

    return res.status(200).json({ ok: true, action: "kept_best" });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
}
