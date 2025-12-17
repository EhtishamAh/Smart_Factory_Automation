-- ============================================================
-- CLEANUP ALERTS UTILITY
-- ============================================================
-- Use this script to clean up old or test alerts from your
-- Smart Factory database.
--
-- WARNING: These operations cannot be undone!
-- Make sure you have a backup before running cleanup queries.
-- ============================================================

-- ============================================================
-- 1. VIEW CURRENT ALERTS
-- ============================================================

-- See all alerts
SELECT 
    id,
    factory_id,
    system,
    alert_type,
    severity,
    is_resolved,
    is_acknowledged,
    created_at
FROM alerts
ORDER BY created_at DESC;

-- Count alerts by status
SELECT 
    is_resolved,
    is_acknowledged,
    COUNT(*) as count
FROM alerts
GROUP BY is_resolved, is_acknowledged;

-- Count alerts by system
SELECT 
    system,
    COUNT(*) as count
FROM alerts
GROUP BY system
ORDER BY count DESC;

-- ============================================================
-- 2. DELETE RESOLVED ALERTS
-- ============================================================

-- Delete all resolved alerts
-- DELETE FROM alerts WHERE is_resolved = true;

-- Delete resolved alerts older than 7 days
-- DELETE FROM alerts 
-- WHERE is_resolved = true 
-- AND resolved_at < NOW() - INTERVAL '7 days';

-- Delete resolved alerts older than 30 days
-- DELETE FROM alerts 
-- WHERE is_resolved = true 
-- AND resolved_at < NOW() - INTERVAL '30 days';

-- ============================================================
-- 3. DELETE OLD ALERTS
-- ============================================================

-- Delete alerts older than 7 days (regardless of status)
-- DELETE FROM alerts WHERE created_at < NOW() - INTERVAL '7 days';

-- Delete alerts older than 30 days
-- DELETE FROM alerts WHERE created_at < NOW() - INTERVAL '30 days';

-- Delete alerts older than 90 days
-- DELETE FROM alerts WHERE created_at < NOW() - INTERVAL '90 days';

-- ============================================================
-- 4. DELETE TEST ALERTS
-- ============================================================

-- Delete all test alerts (if you have test data)
-- DELETE FROM alerts WHERE message LIKE '%test%';

-- Delete alerts from specific factory
-- DELETE FROM alerts WHERE factory_id = 1;

-- Delete alerts from specific system
-- DELETE FROM alerts WHERE system = 'fire_control';

-- ============================================================
-- 5. DELETE ALL ALERTS
-- ============================================================

-- ⚠️ DANGER: Delete ALL alerts
-- DELETE FROM alerts;

-- Reset alert ID sequence to start from 1
-- ALTER SEQUENCE alerts_id_seq RESTART WITH 1;

-- ============================================================
-- 6. ARCHIVE ALERTS (Recommended instead of deleting)
-- ============================================================

-- Create archive table (run once)
-- CREATE TABLE IF NOT EXISTS alerts_archive (LIKE alerts INCLUDING ALL);

-- Copy old alerts to archive before deleting
-- INSERT INTO alerts_archive 
-- SELECT * FROM alerts 
-- WHERE created_at < NOW() - INTERVAL '30 days';

-- Then delete from main table
-- DELETE FROM alerts 
-- WHERE created_at < NOW() - INTERVAL '30 days';

-- ============================================================
-- 7. BULK RESOLVE ALERTS
-- ============================================================

-- Resolve all unresolved alerts
-- UPDATE alerts 
-- SET is_resolved = true, resolved_at = NOW() 
-- WHERE is_resolved = false;

-- Resolve alerts for specific system
-- UPDATE alerts 
-- SET is_resolved = true, resolved_at = NOW() 
-- WHERE system = 'fire_control' AND is_resolved = false;

-- ============================================================
-- 8. BULK ACKNOWLEDGE ALERTS
-- ============================================================

-- Acknowledge all unacknowledged alerts
-- UPDATE alerts 
-- SET is_acknowledged = true, acknowledged_at = NOW() 
-- WHERE is_acknowledged = false;

-- ============================================================
-- 9. MAINTENANCE QUERIES
-- ============================================================

-- Vacuum table to reclaim space after deletions
-- VACUUM ANALYZE alerts;

-- Check table size
SELECT 
    pg_size_pretty(pg_total_relation_size('alerts')) as total_size,
    pg_size_pretty(pg_relation_size('alerts')) as table_size,
    pg_size_pretty(pg_indexes_size('alerts')) as indexes_size;

-- Check row count
SELECT COUNT(*) as total_alerts FROM alerts;
SELECT COUNT(*) as active_alerts FROM alerts WHERE is_resolved = false;
SELECT COUNT(*) as resolved_alerts FROM alerts WHERE is_resolved = true;

-- ============================================================
-- 10. AUTOMATED CLEANUP FUNCTION (Optional)
-- ============================================================

-- Create function to auto-cleanup old resolved alerts
CREATE OR REPLACE FUNCTION cleanup_old_alerts()
RETURNS void AS $$
BEGIN
    -- Delete resolved alerts older than 30 days
    DELETE FROM alerts 
    WHERE is_resolved = true 
    AND resolved_at < NOW() - INTERVAL '30 days';
    
    RAISE NOTICE 'Cleaned up old resolved alerts';
END;
$$ LANGUAGE plpgsql;

-- Run cleanup function manually
-- SELECT cleanup_old_alerts();

-- Schedule cleanup (requires pg_cron extension)
-- SELECT cron.schedule(
--     'cleanup-old-alerts',           -- job name
--     '0 2 * * *',                    -- run daily at 2 AM
--     $$SELECT cleanup_old_alerts()$$ -- SQL command
-- );

-- ============================================================
-- 11. SAFETY CHECK BEFORE DELETION
-- ============================================================

-- Always preview what you're about to delete
-- SELECT COUNT(*) as rows_to_delete 
-- FROM alerts 
-- WHERE is_resolved = true 
-- AND resolved_at < NOW() - INTERVAL '30 days';

-- ============================================================
-- COMPLETE! 🧹
-- ============================================================
-- Remember:
-- - Uncomment (remove --) from queries you want to run
-- - Always preview with SELECT before running DELETE
-- - Consider archiving instead of deleting
-- - Run VACUUM after large deletions
-- ============================================================
