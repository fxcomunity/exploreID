# WORLD MONITOR – Project Overview

**Tagline:** *"Understand the World. Monitor Every Change."*

## 1. Vision
A professional, modular, data‑driven platform that visualises global‑scale information (economics, environment, geopolitics, disasters, energy, technology, transport) through an interactive dark‑theme dashboard.

## 2. High‑level Architecture
```
client (React + Vite)  <--->  Cloudflare Workers (edge API)  <--->  FastAPI (Python)  <--->  PostgreSQL + PostGIS (Neon)
```
- **Frontend** – React, TypeScript, Tailwind, Shadcn/UI, MapLibre GL for maps.
- **Edge layer** – Cloudflare Workers expose lightweight REST endpoints (caching, auth, rate‑limit).
- **Backend** – FastAPI handles data aggregation, analysis, AI‑generated summaries.
- **Database** – PostgreSQL with PostGIS for spatial queries; hosted on Neon.
- **Data Ingestion** – Separate scheduled workers (could be Cloudflare Cron Triggers or external scripts) pull from open APIs, store raw data, and update materialised views.

## 3. Core Modules (Pages)
| # | Page | Description |
|---|------|-------------|
| 1 | Landing Page | Intro, CTA, brief feature list |
| 2 | Global Dashboard | High‑level KPIs, event feed |
| 3 | Live World Map | MapLibre map with toggleable layers |
| 4 | Geopolitical Monitor | Conflict, sanctions, diplomatic changes |
| 5 | Economic Monitor | GDP, inflation, FX, commodities |
| 6 | Environment Monitor | Temp, CO₂, air quality, deforestation |
| 7 | Disaster Monitor | Earthquake, tsunami, flood, fire, etc |
| 8 | Energy Monitor | Oil, gas, coal, renewables, consumption |
| 9 | Technology Monitor | AI breakthroughs, space, semiconductors |
|10 | Transport Monitor | Shipping lanes, flights, ports |
|11 | Country Intelligence | Country profile & side‑by‑side comparison |
|12 | Data Explorer | Raw datasets, download, query builder |
|13 | Analytics Center | Anomaly detection, trend analysis, AI summaries |
|14 | Notification Center | User‑configurable alerts |
|15 | Settings | Theme, language, notification prefs |
|16 | Admin Dashboard | Data source health, API keys, jobs |

## 4. Database Schema (PostgreSQL)
```sql
-- countries ----------------------------------------------------------
CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    iso_code CHAR(2) NOT NULL UNIQUE,
    name TEXT NOT NULL,
    flag_url TEXT,
    capital TEXT,
    population BIGINT,
    area_sq_km NUMERIC,
    latitude NUMERIC,
    longitude NUMERIC,
    geom GEOMETRY(Point, 4326)   -- PostGIS point for map centering
);

-- country_indicators -------------------------------------------------
CREATE TABLE country_indicators (
    id SERIAL PRIMARY KEY,
    country_id INT REFERENCES countries(id),
    indicator TEXT NOT NULL,
    value NUMERIC,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    source TEXT,
    raw_json JSONB,
    UNIQUE (country_id, indicator, recorded_at)
);

-- global_events ------------------------------------------------------
CREATE TABLE global_events (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES event_categories(id),
    title TEXT NOT NULL,
    description TEXT,
    event_time TIMESTAMP WITH TIME ZONE,
    location GEOMETRY(Point, 4326),
    payload JSONB,
    source TEXT,
    verified BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- event_categories ---------------------------------------------------
CREATE TABLE event_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- disaster_events ----------------------------------------------------
CREATE TABLE disaster_events (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    magnitude NUMERIC,
    location GEOMETRY(Point, 4326),
    occurred_at TIMESTAMP WITH TIME ZONE,
    source TEXT,
    verified BOOLEAN,
    raw JSONB
);

-- economic_indicators ------------------------------------------------
CREATE TABLE economic_indicators (
    id SERIAL PRIMARY KEY,
    country_id INT REFERENCES countries(id),
    indicator TEXT NOT NULL,
    value NUMERIC,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    source TEXT,
    UNIQUE (country_id, indicator, recorded_at)
);

-- environmental_indicators -------------------------------------------
CREATE TABLE environmental_indicators (
    id SERIAL PRIMARY KEY,
    country_id INT REFERENCES countries(id),
    indicator TEXT NOT NULL,
    value NUMERIC,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    source TEXT,
    UNIQUE (country_id, indicator, recorded_at)
);

-- energy_indicators --------------------------------------------------
CREATE TABLE energy_indicators (
    id SERIAL PRIMARY KEY,
    country_id INT REFERENCES countries(id),
    indicator TEXT NOT NULL,
    value NUMERIC,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    source TEXT,
    UNIQUE (country_id, indicator, recorded_at)
);

-- geopolitical_events ------------------------------------------------
CREATE TABLE geopolitical_events (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_time TIMESTAMP WITH TIME ZONE,
    involved_countries INT[],
    source TEXT,
    verified BOOLEAN,
    raw JSONB
);

-- technology_events --------------------------------------------------
CREATE TABLE technology_events (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_time TIMESTAMP WITH TIME ZONE,
    category TEXT,
    source TEXT,
    verified BOOLEAN,
    raw JSONB
);

-- transport_events ---------------------------------------------------
CREATE TABLE transport_events (
    id SERIAL PRIMARY KEY,
    type TEXT,
    route TEXT,
    location GEOMETRY(LineString, 4326),
    event_time TIMESTAMP WITH TIME ZONE,
    source TEXT,
    raw JSONB
);

-- data_sources -------------------------------------------------------
CREATE TABLE data_sources (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    api_endpoint TEXT,
    docs_url TEXT,
    license TEXT,
    frequency TEXT,
    last_success TIMESTAMP WITH TIME ZONE
);

-- data_updates --------------------------------------------------------
CREATE TABLE data_updates (
    id SERIAL PRIMARY KEY,
    source_id INT REFERENCES data_sources(id),
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    status TEXT,
    rows_inserted INT,
    rows_updated INT,
    error TEXT
);

-- monitoring_alerts --------------------------------------------------
CREATE TABLE monitoring_alerts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    category TEXT,
    country_id INT REFERENCES countries(id),
    threshold NUMERIC,
    comparator TEXT,
    last_triggered TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT TRUE
);

-- user_preferences ---------------------------------------------------
CREATE TABLE user_preferences (
    user_id INT PRIMARY KEY REFERENCES users(id),
    theme TEXT DEFAULT 'dark',
    language TEXT DEFAULT 'id',
    notification_settings JSONB
);

-- users ---------------------------------------------------------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 5. Data Integration Checklist (first wave)
| Domain | Primary Source | API / Download | Update Frequency | Comments |
|--------|----------------|----------------|------------------|----------|
| Countries & basic stats | World Bank / UN | REST/CSV | Daily | Populate `countries` and `country_indicators`.
| Economic | IMF, World Bank, OECD | REST/JSON | Daily‑hourly | GDP, inflation, FX, commodity prices.
| Environment | NASA (GISTEMP), NOAA, ESA, WMO | REST/JSON | Hourly‑daily | Temp, CO₂, air quality, deforestation.
| Disasters | USGS (earthquakes), NOAA (storms), BMKG, BNPB | GeoJSON/REST | Real‑time | Feed into `disaster_events`.
| Energy | IEA, EIA | REST/CSV | Daily | Oil, gas, coal, renewables.
| Geopolitics | ACLED, UN OCHA, various diplomatic feeds | JSON/CSV | Daily | Conflicts, sanctions, diplomatic changes.
| Tech & Science | arXiv, NASA, ESA, IEEE Xplore RSS | RSS/JSON | Daily | AI breakthroughs, space launches.
| Transport | AIS (ship), OpenSky (flights) | JSON/CSV | Near‑real‑time | Shipping lanes, flight routes.

## 6. Development Phases (MVP → Full)
### Phase 1 – Foundation (2 weeks)
- Initialize monorepo (`/frontend`, `/backend`).
- Set up Vite+React+TS, Tailwind, Shadcn UI scaffold.
- Create FastAPI skeleton with JWT auth & health endpoint.
- Add `docker-compose.yml` (or Cloudflare dev environment) for local PostgreSQL + Neon connection.
- Implement basic layout: dark sidebar, top navigation, placeholder pages.
- Integrate MapLibre with a world basemap.

### Phase 2 – Core Data (4 weeks)
- Write ingestion scripts (Python) for country list + economic indicators.
- Populate DB, expose `/api/countries`, `/api/economic`.
- Build Global Dashboard components (KPIs, recent events feed).
- Add layer toggles on the map (countries, economic heat map).

### Phase 3 – Monitoring & Alerts (3 weeks)
- Implement disaster/event ingestion (USGS, NOAA).
- Build Disaster Monitor page with event cards and map pins.
- Notification service (email via SendGrid, push via Cloudflare Workers KV).
- User preferences UI.

### Phase 4 – Analytics & AI (4 weeks)
- Add historic data endpoints, D3/Recharts charts.
- Simple anomaly detection (z‑score on numeric indicators).
- FastAPI endpoint that calls OpenAI/Claude to generate summary texts.

### Phase 5 – Advanced Visuals & Ops (ongoing)
- optional 3D globe (Three.js + map tiles).
- Admin Dashboard for source health, job logs.
- CI/CD pipeline (GitHub Actions → Cloudflare Pages Workers).
- Documentation, SDK for external developers.

## 7. UI/UX Design Guidelines
- **Dark Intelligence**: background `#0A0F24`, accent `#00BFFF` (cyan). Use status colors: red (#FF4D4F), yellow (#FAAD14), green (#52C41A).
- **Typography**: Inter (or system UI) with weight 400/600.
- **Components**: Shadcn UI cards, tabs, collapsible sections, toast notifications, loading skeletons.
- **Map**: MapLibre GL with OSM vector tiles; custom layer styling (transparent dark basemap).
- **Interactions**: Hover over country → tooltip with key indicators; click → slide‑out panel with country intelligence.
- **Animations**: Framer Motion for panel transitions, map zoom, toast entry.
- **Responsiveness**: Sidebar collapses to hamburger on <1024 px, map remains full‑width on mobile.

## 8. Security & Compliance
- All external API keys stored in Cloudflare Workers secrets & backend `.env` (never committed).
- Rate‑limit per‑user on ingestion endpoints.
- HTTPS everywhere (Cloudflare edge).
- GDPR‑compatible user data handling (delete on request).

---
**Next steps**
1. Confirm the folder structure you want (e.g., `frontend/`, `backend/`).
2. Choose a package manager for the frontend (npm vs pnpm vs yarn).
3. Decide whether to initialise a Git repo now.
4. Let me know if you need the first‑run scaffolding files (package.json, tsconfig, FastAPI `main.py`, Docker compose, etc.).
