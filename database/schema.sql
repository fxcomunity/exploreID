-- ============================================================================
-- WORLD MONITOR - Database Schema (PostgreSQL)
-- Platform Pemantauan Intelijen Global Real-Time
-- https://world-monitoring.jack-ai.my.id
-- ============================================================================

-- 1. Tabel Registrasi Perangkat (1 HP / 1 Laptop = 1 ID Unik Konsisten)
--    Setiap perangkat fisik mendapatkan ID unik permanen (contoh: Anonim100)
--    yang konsisten di semua browser (Chrome, Edge, Brave, Firefox, dll).

CREATE TABLE IF NOT EXISTS devices (
  id              SERIAL PRIMARY KEY,
  device_id       INTEGER NOT NULL UNIQUE,
  fingerprint_hash VARCHAR(128) NOT NULL UNIQUE,
  client_ip       VARCHAR(45) NOT NULL,
  device_type     VARCHAR(20) DEFAULT 'mobile'
                    CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  screen_resolution VARCHAR(30),
  user_agent      TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_seen       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Atur auto increment device_id mulai dari 100
CREATE SEQUENCE IF NOT EXISTS device_id_seq START WITH 100;
ALTER TABLE devices ALTER COLUMN device_id SET DEFAULT nextval('device_id_seq');

-- Index untuk pencarian cepat
CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices (device_id);
CREATE INDEX IF NOT EXISTS idx_devices_fingerprint ON devices (fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_devices_last_seen ON devices (last_seen DESC);


-- 2. Tabel Rating Suka (Bintang 1-5) & Komentar Pengunjung Anonim
--    Setiap perangkat hanya bisa memiliki 1 rating aktif (UNIQUE device_id).
--    author_name otomatis di-generate server sebagai "Anonim{device_id}".

CREATE TABLE IF NOT EXISTS user_ratings (
  id              VARCHAR(64) PRIMARY KEY,
  device_id       INTEGER NOT NULL UNIQUE
                    REFERENCES devices(device_id) ON DELETE CASCADE,
  author_name     VARCHAR(50) NOT NULL,
  rating          SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment         TEXT,
  device_type     VARCHAR(20) DEFAULT 'mobile'
                    CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  is_approved     BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON user_ratings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ratings_approved ON user_ratings (is_approved) WHERE is_approved = TRUE;


-- ============================================================================
-- QUERY OPERASIONAL
-- ============================================================================

-- 3. Simpan / Update Rating (1 Perangkat = 1 Rating, update jika sudah ada)
--
-- INSERT INTO user_ratings (id, device_id, author_name, rating, comment, device_type)
-- VALUES (
--   'fb-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || :device_id,
--   :device_id,
--   'Anonim' || :device_id,
--   :rating,
--   :comment,
--   :device_type
-- )
-- ON CONFLICT (device_id) DO UPDATE SET
--   rating     = EXCLUDED.rating,
--   comment    = EXCLUDED.comment,
--   updated_at = CURRENT_TIMESTAMP;


-- 4. Hitung Statistik Rating (rata-rata, total, distribusi bintang)
--
-- SELECT
--   COUNT(*)                                AS total_ulasan,
--   ROUND(AVG(rating), 1)                   AS rata_rata_bintang,
--   COUNT(*) FILTER (WHERE rating = 5)      AS bintang_5,
--   COUNT(*) FILTER (WHERE rating = 4)      AS bintang_4,
--   COUNT(*) FILTER (WHERE rating = 3)      AS bintang_3,
--   COUNT(*) FILTER (WHERE rating = 2)      AS bintang_2,
--   COUNT(*) FILTER (WHERE rating = 1)      AS bintang_1
-- FROM user_ratings
-- WHERE is_approved = TRUE;


-- 5. Ambil Daftar Ulasan Terbaru (50 terakhir)
--
-- SELECT
--   id, device_id, author_name, rating,
--   comment, device_type, created_at
-- FROM user_ratings
-- WHERE is_approved = TRUE
-- ORDER BY created_at DESC
-- LIMIT 50;


-- 6. Cari Rating Berdasarkan Device ID
--
-- SELECT * FROM user_ratings WHERE device_id = :device_id;


-- 7. Hapus Rating Tertentu (Admin Only)
--
-- DELETE FROM user_ratings WHERE id = :rating_id;


-- 8. Moderasi: Sembunyikan Ulasan Tidak Pantas (Admin Only)
--
-- UPDATE user_ratings SET is_approved = FALSE WHERE id = :rating_id;
