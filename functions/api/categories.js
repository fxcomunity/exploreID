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
    const result = await env.DB.prepare(
      "SELECT category, COUNT(*) AS places_count FROM tourism_places WHERE category IS NOT NULL AND TRIM(category) <> '' GROUP BY category ORDER BY places_count DESC, category COLLATE NOCASE",
    ).all();
    return jsonResponse({ data: result.results || [] });
  } catch (error) {
    console.error("GET /api/categories failed", error);
    return jsonResponse({ error: "Kategori dari database tidak dapat diakses." }, 500);
  }
}
