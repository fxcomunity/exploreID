# Cloudflare Pages + Neon PostgreSQL

ExploreID serves its static frontend from Cloudflare Pages and its API from Pages Functions. The API reads place and category records from Neon PostgreSQL; it does not use Cloudflare D1. Frontend files contain no copied destination/category records.

## Database contents

- `database/schema.sql` creates the PostgreSQL `tourism_places` table and indexes.
- `database/import_openstreetmap.sql` imports all 16,794 records from the supplied CSV.
- Blank CSV attributes become SQL `NULL`; source values, coordinates, OSM identifiers, source URLs, and collection timestamps are retained.
- Re-running the import updates the existing `(osm_type, osm_id)` record instead of creating duplicates.

The CSV includes accommodations and other OSM object categories in addition to attractions. Its category values are not reclassified or presented as official tourism categories.

## Set up Neon

1. Create a Neon project and copy its connection string from the Neon dashboard. Use the pooled connection string for serverless deployments.
2. Open the Neon SQL Editor and run `database/schema.sql`.
3. Then run `database/import_openstreetmap.sql`.
4. Verify the import:

   ```sql
   SELECT COUNT(*) AS total FROM tourism_places;
   SELECT COUNT(DISTINCT category) AS categories
   FROM tourism_places
   WHERE category IS NOT NULL AND btrim(category) <> '';
   ```

   The initial dataset contains 16,794 records. Category count is derived from source tags and should not be treated as an official taxonomy.

## Develop and deploy Pages

Install dependencies and run the local Pages development server from the project root:

```powershell
npm install
npm run dev
```

For local API development, create a `.dev.vars` file in the project root (it is ignored by Git) and add the Neon connection string:

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
```

Do not commit `.dev.vars`, print the connection string in logs, or expose it to browser JavaScript.

Deploy using Wrangler:

```powershell
npx wrangler login
npx wrangler pages project create exploreid
npx wrangler pages secret put DATABASE_URL --project-name=exploreid
npm run deploy
```

When prompted for `DATABASE_URL`, paste the Neon connection string. For a project already connected to Git, configure `DATABASE_URL` as an encrypted secret in Cloudflare Pages project settings for each required environment. Set the build output directory to `public`. Keep `functions/` and `wrangler.toml` at the repository root.

Cloudflare Pages Functions require Pages/Workers to run. Serving the `public/` folder through Apache/Laragon only serves static assets and cannot execute the database API.

## API

- `GET /api/categories` returns source category values and record counts.
- `GET /api/destinations?q=...&category=...&province=...&page=1&per_page=12` searches and paginates records.
- `GET /api/destinations?osm_type=node&osm_id=253598001` returns one record.

Wishlist and itinerary selections remain browser-local until account authentication and per-user database endpoints are implemented.
