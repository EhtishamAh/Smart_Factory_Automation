-- ============================================================
-- SMART FACTORY AUTOMATION DATABASE SCHEMA
-- ============================================================
-- This script sets up the complete database schema for the
-- Smart Factory IoT monitoring system.
--
-- Tables:
--   1. factories - Factory metadata
--   2. factory_data - Real-time system telemetry
--   3. alerts - System alerts and notifications
--
-- Features:
--   - Real-time subscriptions enabled
--   - Row Level Security (RLS) disabled for simplicity
--   - Indexes for optimal query performance
--   - Automatic timestamp management
-- ============================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. FACTORIES TABLE
-- ============================================================
-- Stores factory metadata and configuration
-- ============================================================

CREATE TABLE IF NOT EXISTS factories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    location VARCHAR(255),
    mac_address VARCHAR(17) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default factories
INSERT INTO factories (id, name, location, mac_address) VALUES
(1, 'Factory A', 'Building 1, Floor 2', '00:11:22:33:44:55'),
(2, 'Factory B', 'Building 2, Floor 3', 'AA:BB:CC:DD:EE:FF')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence to continue from highest ID
SELECT setval('factories_id_seq', (SELECT MAX(id) FROM factories));

-- ============================================================
-- 2. FACTORY_DATA TABLE
-- ============================================================
-- Stores real-time telemetry data from all factory systems
-- ============================================================

CREATE TABLE IF NOT EXISTS factory_data (
    id SERIAL PRIMARY KEY,
    factory_id INTEGER REFERENCES factories(id) ON DELETE CASCADE,
    
    -- System Identification
    system VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    
    -- Fire Control System
    fire_status VARCHAR(50),
    
    -- HVAC System
    temperature NUMERIC(5,2),
    
    -- Conveyor Belt System
    items_processed INTEGER DEFAULT 0,
    items_failed INTEGER DEFAULT 0,
    
    -- Weight Monitor System
    current_weight NUMERIC(10,2),
    
    -- Garage Door System
    door_status VARCHAR(20),
    
    -- Battery System
    battery_level NUMERIC(5,2),
    energy_consumption NUMERIC(10,2),
    led_status VARCHAR(10),
    
    -- Safe Room System
    is_locked BOOLEAN,
    access_attempts INTEGER DEFAULT 0,
    
    -- Timestamps
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_factory_data_factory_id ON factory_data(factory_id);
CREATE INDEX IF NOT EXISTS idx_factory_data_system ON factory_data(system);
CREATE INDEX IF NOT EXISTS idx_factory_data_timestamp ON factory_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_factory_data_created_at ON factory_data(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_factory_data_factory_system ON factory_data(factory_id, system);

-- ============================================================
-- 3. ALERTS TABLE
-- ============================================================
-- Stores system alerts and notifications
-- ============================================================

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    factory_id INTEGER REFERENCES factories(id) ON DELETE CASCADE,
    
    -- Alert Details
    system VARCHAR(50) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'info',
    
    -- Alert Status
    is_resolved BOOLEAN DEFAULT FALSE,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for alert queries
CREATE INDEX IF NOT EXISTS idx_alerts_factory_id ON alerts(factory_id);
CREATE INDEX IF NOT EXISTS idx_alerts_system ON alerts(system);
CREATE INDEX IF NOT EXISTS idx_alerts_is_resolved ON alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_factory_resolved ON alerts(factory_id, is_resolved);

-- ============================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for factories table
DROP TRIGGER IF EXISTS update_factories_updated_at ON factories;
CREATE TRIGGER update_factories_updated_at
    BEFORE UPDATE ON factories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for alerts table
DROP TRIGGER IF EXISTS update_alerts_updated_at ON alerts;
CREATE TRIGGER update_alerts_updated_at
    BEFORE UPDATE ON alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
-- Disabled for simplicity in development
-- Enable in production with proper policies
-- ============================================================

ALTER TABLE factories ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (allow all operations)
-- Replace with restrictive policies in production

CREATE POLICY "Allow all operations on factories" ON factories
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on factory_data" ON factory_data
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on alerts" ON alerts
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- REAL-TIME SUBSCRIPTIONS
-- ============================================================
-- Enable real-time updates for dashboard
-- ============================================================

-- Enable real-time for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE factories;
ALTER PUBLICATION supabase_realtime ADD TABLE factory_data;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- Run these to verify setup is correct
-- ============================================================

-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('factories', 'factory_data', 'alerts');

-- Check indexes
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('factories', 'factory_data', 'alerts');

-- Check factories
SELECT id, name, location FROM factories;

-- ============================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================

-- Insert sample factory data
-- INSERT INTO factory_data (factory_id, system, status, temperature, fire_status) 
-- VALUES (1, 'fire_control', 'NORMAL', 22.5, 'SAFE');

-- INSERT INTO factory_data (factory_id, system, status, temperature) 
-- VALUES (1, 'hvac', 'NORMAL', 22.0);

-- INSERT INTO factory_data (factory_id, system, status, items_processed, items_failed) 
-- VALUES (1, 'conveyor', 'NORMAL', 150, 0);

-- Insert sample alert
-- INSERT INTO alerts (factory_id, system, alert_type, message, severity) 
-- VALUES (1, 'fire_control', 'temperature_high', 'Temperature exceeds 30°C', 'warning');

-- ============================================================
-- CLEANUP QUERIES (Use with caution)
-- ============================================================

-- Delete all factory_data (keeps structure)
-- DELETE FROM factory_data;

-- Delete all alerts
-- DELETE FROM alerts;

-- Reset sequences
-- ALTER SEQUENCE factory_data_id_seq RESTART WITH 1;
-- ALTER SEQUENCE alerts_id_seq RESTART WITH 1;

-- ============================================================
-- DROP TABLES (Use only to completely reset)
-- ============================================================

-- DROP TABLE IF EXISTS alerts CASCADE;
-- DROP TABLE IF EXISTS factory_data CASCADE;
-- DROP TABLE IF EXISTS factories CASCADE;

-- ============================================================
-- COMPLETE! 🎉
-- ============================================================
-- Your database is now ready for the Smart Factory system
-- 
-- Next steps:
-- 1. Copy your Supabase URL and anon key
-- 2. Update python-middleware/config.py
-- 3. Update factory-dashboard/.env.local
-- 4. Start the Python server
-- 5. Start the Next.js dashboard
-- ============================================================
