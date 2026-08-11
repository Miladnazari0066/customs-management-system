-- ==============================================================================
-- GOMROK & WAREHOUSE MANAGEMENT SYSTEM - SUPABASE POSTGRESQL SCHEMA
-- ==============================================================================
-- Run this SQL script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- to create all required tables, indexes, and Row Level Security (RLS) policies.
-- ==============================================================================

-- 1. ENTRY DOCS TABLE (اسناد ورود)
CREATE TABLE IF NOT EXISTS public.entry_docs (
    id TEXT PRIMARY KEY,
    cottage TEXT NOT NULL,
    bl TEXT DEFAULT '',
    file TEXT DEFAULT '',
    importer TEXT DEFAULT '',
    carrier TEXT DEFAULT '',
    goods TEXT DEFAULT '',
    brand TEXT DEFAULT '',
    unload_date JSONB DEFAULT '{"jy": 1402, "jm": 1, "jd": 1}'::jsonb,
    trailers INTEGER DEFAULT 0,
    unloaded INTEGER DEFAULT 0,
    pallets INTEGER DEFAULT 0,
    invoice_paid BOOLEAN DEFAULT false,
    receipt JSONB DEFAULT '{"number": "", "count": ""}'::jsonb,
    tasks JSONB DEFAULT '{"bl": false, "arr": false, "tali": false}'::jsonb,
    created_at BIGINT DEFAULT extract(epoch from now()) * 1000,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. CONSOLIDATION BATCHES TABLE (تجمیع‌ها)
CREATE TABLE IF NOT EXISTS public.batches (
    id TEXT PRIMARY KEY,
    goods TEXT DEFAULT '',
    file TEXT DEFAULT '',
    created_at JSONB DEFAULT '{"jy": 1402, "jm": 1, "jd": 1}'::jsonb,
    doc_ids JSONB DEFAULT '[]'::jsonb,
    finalized BOOLEAN DEFAULT false,
    exited BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. LAB RECORDS TABLE (سوابق آزمایشگاه)
CREATE TABLE IF NOT EXISTS public.lab_records (
    id TEXT PRIMARY KEY,
    goods TEXT DEFAULT '',
    brand TEXT DEFAULT '',
    sample_date JSONB DEFAULT '{"jy": 1402, "jm": 1, "jd": 1}'::jsonb,
    validity INTEGER DEFAULT 6,
    comment TEXT DEFAULT '',
    exit_id TEXT,
    created_at BIGINT DEFAULT extract(epoch from now()) * 1000,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. EXIT DOCS TABLE (اسناد خروج)
CREATE TABLE IF NOT EXISTS public.exit_docs (
    id TEXT PRIMARY KEY,
    cottage TEXT DEFAULT '',
    bl TEXT DEFAULT '',
    file TEXT DEFAULT '',
    unload_date JSONB DEFAULT '{"jy": 1402, "jm": 1, "jd": 1}'::jsonb,
    importer TEXT DEFAULT '',
    carrier TEXT DEFAULT '',
    goods TEXT DEFAULT '',
    brand TEXT DEFAULT '',
    trailers INTEGER DEFAULT 0,
    pallets INTEGER DEFAULT 0,
    batch_id TEXT DEFAULT '',
    route TEXT DEFAULT 'yellow',
    evaluator JSONB DEFAULT '{"done": false, "comment": ""}'::jsonb,
    jihad JSONB DEFAULT '{"done": false, "comment": ""}'::jsonb,
    lab JSONB DEFAULT '{"needed": false, "sampled": false, "sampleDate": null, "sent": false, "tested": false, "comment": "", "reusedFrom": null, "recordId": null, "validity": 6}'::jsonb,
    expert JSONB DEFAULT '{"done": false}'::jsonb,
    gate JSONB DEFAULT '{"done": false}'::jsonb,
    invoice JSONB DEFAULT '{"paid": false}'::jsonb,
    created_at BIGINT DEFAULT extract(epoch from now()) * 1000,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. LOOKUP OPTIONS TABLE (شرکت‌های واردکننده، حمل، کالاها و برندها)
CREATE TABLE IF NOT EXISTS public.lookup_options (
    id TEXT PRIMARY KEY DEFAULT 'global_options',
    importers JSONB DEFAULT '[]'::jsonb,
    carriers JSONB DEFAULT '[]'::jsonb,
    goods_list JSONB DEFAULT '[]'::jsonb,
    brands JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================================
-- INDEXES FOR FAST SEARCHING AND FILTERING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_entry_docs_cottage ON public.entry_docs(cottage);
CREATE INDEX IF NOT EXISTS idx_entry_docs_file ON public.entry_docs(file);
CREATE INDEX IF NOT EXISTS idx_entry_docs_bl ON public.entry_docs(bl);
CREATE INDEX IF NOT EXISTS idx_entry_docs_importer ON public.entry_docs(importer);

CREATE INDEX IF NOT EXISTS idx_exit_docs_cottage ON public.exit_docs(cottage);
CREATE INDEX IF NOT EXISTS idx_exit_docs_file ON public.exit_docs(file);
CREATE INDEX IF NOT EXISTS idx_exit_docs_batch ON public.exit_docs(batch_id);

CREATE INDEX IF NOT EXISTS idx_batches_file ON public.batches(file);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) AND CREATE ACCESS POLICIES
-- ==============================================================================
ALTER TABLE public.entry_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exit_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_options ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access using anon key (suitable for static SPA/GitHub Pages)
-- Note: In production with authentication, replace `true` with `auth.role() = 'authenticated'` if desired.

DROP POLICY IF EXISTS "Allow anon full access on entry_docs" ON public.entry_docs;
CREATE POLICY "Allow anon full access on entry_docs" ON public.entry_docs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon full access on batches" ON public.batches;
CREATE POLICY "Allow anon full access on batches" ON public.batches FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon full access on lab_records" ON public.lab_records;
CREATE POLICY "Allow anon full access on lab_records" ON public.lab_records FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon full access on exit_docs" ON public.exit_docs;
CREATE POLICY "Allow anon full access on exit_docs" ON public.exit_docs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon full access on lookup_options" ON public.lookup_options;
CREATE POLICY "Allow anon full access on lookup_options" ON public.lookup_options FOR ALL USING (true) WITH CHECK (true);

-- Insert initial empty lookup_options row if not exists
INSERT INTO public.lookup_options (id, importers, carriers, goods_list, brands)
VALUES ('global_options', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;
