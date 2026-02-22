import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Use GET" });

  const limit = Math.min(Number(req.query?.limit ?? 10), 50);

  const { data, error } = await supabase
    .from("scores")
    .select("id,name,score,created_at")
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ data });
}