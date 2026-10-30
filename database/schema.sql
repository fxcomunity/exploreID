CREATE TABLE IF NOT EXISTS tourism_places (
    osm_type TEXT NOT NULL CHECK (osm_type IN ('node', 'way', 'relation')),
    osm_id BIGINT NOT NULL CHECK (osm_id > 0),
    name TEXT NOT NULL CHECK (length(btrim(name)) > 0),
    category TEXT,
    description TEXT,
    address TEXT,
    street TEXT,
    village TEXT,
    district TEXT,
    regency TEXT,
    province TEXT,
    latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    website TEXT,
    phone TEXT,
    opening_hours TEXT,
    source TEXT,
    source_url TEXT,
    collected_at TIMESTAMPTZ,
    PRIMARY KEY (osm_type, osm_id)
);

CREATE INDEX IF NOT EXISTS idx_tourism_places_name
    ON tourism_places (name);

CREATE INDEX IF NOT EXISTS idx_tourism_places_category
    ON tourism_places (category);

CREATE INDEX IF NOT EXISTS idx_tourism_places_province
    ON tourism_places (province);

CREATE INDEX IF NOT EXISTS idx_tourism_places_regency
    ON tourism_places (regency);

CREATE INDEX IF NOT EXISTS idx_tourism_places_coordinates
    ON tourism_places (latitude, longitude);
