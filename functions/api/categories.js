import { getDatabase } from "../_shared/database.js";

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function onRequestGet({ env }) {
  try {
    const sql = getDatabase(env);
    const rows = await sql.query(
      "SELECT category, COUNT(*)::integer AS places_count FROM tourism_places WHERE category IS NOT NULL AND btrim(category) <> '' GROUP BY category ORDER BY places_count DESC, category ASC",
    );
    return jsonResponse({ data: rows });
  } catch (error) {
    console.error("GET /api/categories failed", error);
    return jsonResponse({ error: "Kategori dari database Neon tidak dapat diakses." }, 500);
  }
}
