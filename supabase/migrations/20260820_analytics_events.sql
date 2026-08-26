-- ==============================================================================
-- DriveLog Privacy-Safe Analytics Events
-- ==============================================================================
-- Receives batched, offline-queued events from src/utils/analytics.ts.
-- STRICTLY no PII: rows contain only event names and flat scalar properties
-- (state codes, hour totals, booleans). No user_id, no IPs, no free-text.

CREATE TABLE IF NOT EXISTS public.analytics_events (
    id TEXT PRIMARY KEY,
    event_name TEXT NOT NULL,
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS: the anon client may INSERT events but never read or update them.
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can insert analytics events"
    ON public.analytics_events
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Index for common aggregate queries by event type / time window
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON public.analytics_events(event_name, created_at);
