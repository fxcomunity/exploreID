-- ==============================================================================
-- WORLD MONITOR — DATABASE SCHEMA TEMPLATE (CLEAN DDL)
-- Target: PostgreSQL / MySQL / Supabase / Neon Serverless
-- Note: Tidak ada data/kredensial rahasia yang di-hardcode di file ini.
--       Aman untuk di-push ke GitHub publik.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABEL ADMIN PENGGUNA (ADMIN AUTHENTICATION)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wm_admins (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(64) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Simpan dengan Bcrypt / Argon2
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'operator')),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wm_admins_email ON wm_admins(email);
CREATE INDEX IF NOT EXISTS idx_wm_admins_username ON wm_admins(username);


-- ------------------------------------------------------------------------------
-- 2. TABEL LOG KEAMANAN & AUDIT TRAIL (DDoS / XSS / BRUTE-FORCE LOGS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wm_security_logs (
    id BIGSERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'BLOCKED_XSS', 'BLOCKED_SQLI', 'RATE_LIMITED'
    status VARCHAR(20) NOT NULL,      -- 'ALLOWED', 'BLOCKED'
    payload_sample TEXT,              -- Cuplikan serangan yang dinetralisir
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wm_sec_ip ON wm_security_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_wm_sec_created ON wm_security_logs(created_at DESC);
