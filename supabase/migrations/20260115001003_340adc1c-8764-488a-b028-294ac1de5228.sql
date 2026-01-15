-- Add raw_label_data column to store full openFDA/DailyMed response for auditability
ALTER TABLE public.medications 
ADD COLUMN IF NOT EXISTS raw_label_data jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS label_set_id text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS label_imported_at timestamp with time zone DEFAULT NULL;