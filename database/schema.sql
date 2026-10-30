PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tourism_places (
    osm_type TEXT NOT NULL CHECK (osm_type IN ('node', 'way', 'relation')),
    osm_id TEXT NOT NULL,
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    category TEXT,
    description TEXT,
    address TEXT,
    street TEXT,
    village TEXT,
    district TEXT,
    regency TEXT,
    province TEXT,
    latitude REAL NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude REAL NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    website TEXT,
    phone TEXT,
    opening_hours TEXT,
    source TEXT,
    source_url TEXT,
    collected_at TEXT,
    PRIMARY KEY (osm_type, osm_id)
) WITHOUT ROWID;

CREATE INDEX IF NOT EXISTS idx_tourism_places_name
    ON tourism_places (name COLLATE NOCASE);

CREATE INDEX IF NOT EXISTS idx_tourism_places_category
    ON tourism_places (category);

CREATE INDEX IF NOT EXISTS idx_tourism_places_province
    ON tourism_places (province COLLATE NOCASE);

CREATE INDEX IF NOT EXISTS idx_tourism_places_regency
    ON tourism_places (regency COLLATE NOCASE);

CREATE INDEX IF NOT EXISTS idx_tourism_places_coordinates
    ON tourism_places (latitude, longitude);
