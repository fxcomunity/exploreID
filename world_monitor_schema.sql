-- WORLD MONITOR Database Schema
-- PostgreSQL with PostGIS

-- Enable PostGIS extension (run separately if not enabled)
-- CREATE EXTENSION IF NOT EXISTS postgis;

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
