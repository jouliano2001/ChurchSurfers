import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  const { name, score } = req.body ?? {};
  const cleanName = String(name ?? "")
    .trim()
    .slice(0, 30);
  const cleanScore = Number(score);

  if (!cleanName) return res.status(400).json({ error: "Name required" });
  if (!Number.isFinite(cleanScore) || cleanScore < 0)
    return res.status(400).json({ error: "Invalid score" });

  const { error } = await supabase
    .from("scores")
    .insert({ name: cleanName, score: Math.floor(cleanScore) });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true });
}
