-- ==============================================================================
-- DriveLog Monetization & Account Schema
-- Supabase PostgreSQL with Row Level Security (RLS)
-- ==============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Entitlements Table (Tracks Free vs Lifetime Pro $4.99)
CREATE TABLE IF NOT EXISTS public.entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'lifetime', -- 'lifetime'
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'revoked'
    purchased_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    stripe_customer_id TEXT,
    stripe_payment_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_entitlement UNIQUE (user_id, plan)
);

-- Index for high-performance lookup
CREATE INDEX IF NOT EXISTS idx_entitlements_user_id ON public.entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_status ON public.entitlements(user_id, status);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Profiles
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- 5. RLS Policies for Entitlements
-- Normal users can ONLY READ their own entitlement.
-- Insertion and updates to entitlements are RESTRICTED to the server service_role (Stripe Webhook).
CREATE POLICY "Users can view their own entitlement"
    ON public.entitlements
    FOR SELECT
    USING (auth.uid() = user_id);

-- 6. Automatically create profile row when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, created_at, updated_at)
    VALUES (new.id, new.email, now(), now())
    ON CONFLICT (id) DO UPDATE
    SET email = excluded.email, updated_at = now();
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE OF email ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
