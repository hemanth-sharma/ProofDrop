-- Migration: 007_ai_verification.sql
-- Adds AI photo-verification results, GPS capture and notification content.
-- All changes are additive (ADD COLUMN IF NOT EXISTS) — safe to run on an
-- existing database, no data is touched.

-- 1) Deliveries: AI verification results
ALTER TABLE deliveries
  ADD COLUMN IF NOT EXISTS ai_verified BOOLEAN,
  ADD COLUMN IF NOT EXISTS ai_confidence NUMERIC(5, 4),
  ADD COLUMN IF NOT EXISTS ai_reason TEXT,
  ADD COLUMN IF NOT EXISTS ai_mode TEXT,
  ADD COLUMN IF NOT EXISTS ai_verified_at TIMESTAMPTZ;

-- 2) Deliveries: GPS capture
-- (fixes a latent bug: the driver "complete" route already writes these
--  columns but no earlier migration created them)
ALTER TABLE deliveries
  ADD COLUMN IF NOT EXISTS delivery_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS delivery_lng DOUBLE PRECISION;

-- 3) Notifications: channel + message content so the dashboard can show an
--    outbox / message log (simulated sends are stored too, for demo mode)
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS channel TEXT,
  ADD COLUMN IF NOT EXISTS content TEXT;
