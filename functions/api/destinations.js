const columns = "osm_id, osm_type, name, category, description, address, street, village, district, regency, province, latitude, longitude, website, phone, opening_hours, source, source_url, collected_at";

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

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const osmType = url.searchParams.get("osm_type");
    const osmId = url.searchParams.get("osm_id");

    if (osmType || osmId) {
      if (!osmType || !osmId || !["node", "way", "relation"].includes(osmType)) {
        return jsonResponse({ error: "Parameter osm_type dan osm_id yang valid wajib diisi bersama." }, 400);
      }
      const place = await env.DB.prepare(
        `SELECT ${columns} FROM tourism_places WHERE osm_type = ? AND osm_id = ? LIMIT 1`,
      ).bind(osmType, osmId).first();
      return place ? jsonResponse({ data: place }) : jsonResponse({ error: "Tempat tidak ditemukan." }, 404);
    }

    const pageValue = Number(url.searchParams.get("page") || 1);
    const perPageValue = Number(url.searchParams.get("per_page") || 12);
    const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1;
    const perPage = Number.isSafeInteger(perPageValue) && perPageValue > 0
      ? Math.min(perPageValue, 100)
      : 12;
    const offset = (page - 1) * perPage;
    if (!Number.isSafeInteger(offset)) {
      return jsonResponse({ error: "Nomor halaman di luar batas." }, 400);
    }

    const filters = [];
    const values = [];
    const query = url.searchParams.get("q")?.trim();
    const category = url.searchParams.get("category")?.trim();
    const province = url.searchParams.get("province")?.trim();

    if (query) {
      const pattern = `%${query}%`;
      filters.push("(name LIKE ? COLLATE NOCASE OR address LIKE ? COLLATE NOCASE OR regency LIKE ? COLLATE NOCASE OR province LIKE ? COLLATE NOCASE)");
      values.push(pattern, pattern, pattern, pattern);
    }
    if (category) {
      filters.push("category = ?");
      values.push(category);
    }
    if (province) {
      filters.push("province = ?");
      values.push(province);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const sort = url.searchParams.get("sort") === "collected_at" ? "collected_at DESC, name COLLATE NOCASE" : "name COLLATE NOCASE";
    const [countResult, placesResult] = await Promise.all([
      env.DB.prepare(`SELECT COUNT(*) AS total FROM tourism_places ${where}`).bind(...values).first(),
      env.DB.prepare(`SELECT ${columns} FROM tourism_places ${where} ORDER BY ${sort} LIMIT ? OFFSET ?`)
        .bind(...values, perPage, offset)
        .all(),
    ]);

    const total = Number(countResult?.total || 0);
    return jsonResponse({
      data: placesResult.results || [],
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error("GET /api/destinations failed", error);
    return jsonResponse({ error: "Database destinasi tidak dapat diakses." }, 500);
  }
}
