import { getDatabase } from "../_shared/database.js";

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
      if (!/^[1-9]\d*$/.test(osmId)) {
        return jsonResponse({ error: "osm_id harus berupa bilangan bulat positif." }, 400);
      }
      if (BigInt(osmId) > 9223372036854775807n) {
        return jsonResponse({ error: "osm_id berada di luar rentang yang didukung." }, 400);
      }
      const sql = getDatabase(env);
      const place = await sql.query(
        `SELECT ${columns} FROM tourism_places WHERE osm_type = $1 AND osm_id = $2::bigint LIMIT 1`,
        [osmType, osmId],
      ).then((rows) => rows[0] || null);
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

    const sql = getDatabase(env);
    const filters = [];
    const values = [];
    const query = url.searchParams.get("q")?.trim();
    const category = url.searchParams.get("category")?.trim();
    const province = url.searchParams.get("province")?.trim();

    if (query) {
      const pattern = `%${query}%`;
      const firstIndex = values.length + 1;
      values.push(pattern, pattern, pattern, pattern);
      filters.push(`(name ILIKE $${firstIndex} OR address ILIKE $${firstIndex + 1} OR regency ILIKE $${firstIndex + 2} OR province ILIKE $${firstIndex + 3})`);
    }
    if (category) {
      values.push(category);
      filters.push(`category = $${values.length}`);
    }
    if (province) {
      values.push(province);
      filters.push(`province = $${values.length}`);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const sort = url.searchParams.get("sort") === "collected_at" ? "collected_at DESC NULLS LAST, name ASC" : "name ASC";
    const [countRows, placesRows] = await Promise.all([
      sql.query(`SELECT COUNT(*)::integer AS total FROM tourism_places ${where}`, values),
      sql.query(
        `SELECT ${columns} FROM tourism_places ${where} ORDER BY ${sort} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
        [...values, perPage, offset],
      ),
    ]);

    const total = Number(countRows[0]?.total || 0);
    return jsonResponse({
      data: placesRows,
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error("GET /api/destinations failed", error);
    return jsonResponse({ error: "Database Neon tidak dapat diakses." }, 500);
  }
}
