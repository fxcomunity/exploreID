# Cloudflare Pages + D1

ExploreID now reads place and category records from the Cloudflare D1 API. Frontend files contain no copied destination/category records. The supplied OpenStreetMap CSV is converted into `database/import_openstreetmap.sql`.

## Database contents

- `database/schema.sql` creates the D1-compatible `tourism_places` table and indexes.
- `database/import_openstreetmap.sql` imports all 16,794 records from the supplied CSV.
- Blank CSV attributes become SQL `NULL`; source values, coordinates, OSM identifiers, source URLs, and collection timestamps are retained.
- Re-running the import updates the existing `(osm_type, osm_id)` record instead of creating duplicates.

The CSV includes accommodations and other OSM object categories in addition to attractions. Its category values are not reclassified or presented as official tourism categories.

## Create and import the D1 database

Run these commands from the project root in PowerShell, with Node.js/npm and a Cloudflare account available:

```powershell
npx wrangler login
npx wrangler d1 create exploreid-db
```

Copy the `database_id` from the create output into `wrangler.toml`, replacing `GANTI_DENGAN_DATABASE_ID_CLOUDFLARE`.

Apply the schema and data to the remote database:

```powershell
npx wrangler d1 execute exploreid-db --remote --file=database/schema.sql
npx wrangler d1 execute exploreid-db --remote --file=database/import_openstreetmap.sql
```

Check the imported row count:

```powershell
npx wrangler d1 execute exploreid-db --remote --command="SELECT COUNT(*) AS total FROM tourism_places;"
```

The expected initial row count is `16794`.

## Develop and deploy Pages

The D1 binding in `wrangler.toml` is named `DB` and is used by `functions/api/destinations.js` and `functions/api/categories.js`.

```powershell
npx wrangler pages dev
npx wrangler pages deploy public
```

Alternatively, connect the repository to Cloudflare Pages and set the output directory to `public`. The `public/` folder contains only files intended for browser delivery; the SQL import file and project documentation stay outside the deployment output. Keep the `functions/` directory and `wrangler.toml` in the project root so Pages can deploy the API functions and D1 binding.

The Pages settings must include the D1 database binding:

| Variable name | Value |
|---|---|
| `DB` | The `exploreid-db` D1 database |

For production, also configure the same D1 binding in the Pages project's settings. A local Apache/Laragon server can serve the static pages, but it does not run Cloudflare Pages Functions or connect to D1; API-backed pages therefore need Cloudflare Pages/Workers or a separate backend.

## API

- `GET /api/categories` returns source category values and record counts.
- `GET /api/destinations?q=...&category=...&province=...&page=1&per_page=12` searches and paginates records.
- `GET /api/destinations?osm_type=node&osm_id=253598001` returns one record.

Wishlist and itinerary selections remain browser-local until account authentication and per-user database endpoints are implemented.
