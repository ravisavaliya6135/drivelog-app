-- ==============================================================================
-- DriveLog Feedback Submissions
-- ==============================================================================
-- Receives support/feedback messages from src/utils/feedback.ts.
-- Messages are queued in device IndexedDB first; this table is the sync target.
-- Name/email are OPTIONAL and supplied only if the user volunteers them.

CREATE TABLE IF NOT EXISTS public.feedback_submissions (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    category TEXT NOT NULL DEFAULT 'other',
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone may submit feedback; nobody may read others' submissions via the anon key.
-- Reading is done via the Supabase dashboard / service role only.
CREATE POLICY "anon can insert feedback"
    ON public.feedback_submissions
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_feedback_created ON public.feedback_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON public.feedback_submissions(category);
