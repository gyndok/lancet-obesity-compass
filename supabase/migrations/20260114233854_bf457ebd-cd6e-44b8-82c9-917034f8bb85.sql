
-- Create enum for medication route
CREATE TYPE public.medication_route AS ENUM ('oral', 'weekly_injection', 'daily_injection', 'other');

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'clinician', 'user');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create medications table
CREATE TABLE public.medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generic_name TEXT NOT NULL,
    brand_names TEXT[] DEFAULT '{}',
    drug_class TEXT NOT NULL,
    moa_short TEXT,
    moa_long TEXT,
    route medication_route NOT NULL DEFAULT 'oral',
    dosing_summary TEXT,
    titration_schedule JSONB DEFAULT '[]',
    missed_dose_rules TEXT,
    contraindications TEXT[] DEFAULT '{}',
    boxed_warning TEXT,
    serious_warnings TEXT[] DEFAULT '{}',
    common_adverse_effects TEXT[] DEFAULT '{}',
    serious_adverse_effects TEXT[] DEFAULT '{}',
    interactions TEXT[] DEFAULT '{}',
    pregnancy_lactation JSONB DEFAULT '{}',
    renal_adjustment TEXT,
    hepatic_adjustment TEXT,
    monitoring JSONB DEFAULT '{}',
    efficacy JSONB DEFAULT '{}',
    comorbidity_fit_tags TEXT[] DEFAULT '{}',
    patient_counseling TEXT,
    pa_template TEXT,
    icd10_suggestions TEXT[] DEFAULT '{}',
    med_references JSONB DEFAULT '[]',
    last_reviewed_at DATE,
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create formulary_rules table
CREATE TABLE public.formulary_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payer_name TEXT NOT NULL,
    rule_set JSONB DEFAULT '{}',
    last_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medication_change_log table for audit trail
CREATE TABLE public.medication_change_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE NOT NULL,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    change_summary TEXT NOT NULL,
    before_snapshot JSONB,
    after_snapshot JSONB
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formulary_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_change_log ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for medications (read for all authenticated, write for admins)
CREATE POLICY "Anyone can view active medications"
ON public.medications
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage medications"
ON public.medications
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for formulary_rules
CREATE POLICY "Anyone can view formulary rules"
ON public.formulary_rules
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage formulary rules"
ON public.formulary_rules
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for medication_change_log
CREATE POLICY "Admins can view change log"
ON public.medication_change_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert change log"
ON public.medication_change_log
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for updated_at
CREATE TRIGGER update_medications_updated_at
BEFORE UPDATE ON public.medications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_formulary_rules_updated_at
BEFORE UPDATE ON public.formulary_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed 3 example medications with placeholder values
INSERT INTO public.medications (generic_name, brand_names, drug_class, moa_short, route, dosing_summary, comorbidity_fit_tags, is_active) VALUES
(
    'Semaglutide',
    ARRAY['Wegovy', 'Ozempic'],
    'GLP-1 Receptor Agonist',
    'Glucagon-like peptide-1 receptor agonist that reduces appetite and food intake',
    'weekly_injection',
    'Start 0.25mg weekly, titrate to 2.4mg weekly over 16-20 weeks',
    ARRAY['T2D benefit', 'Cardiovascular benefit', 'Prediabetes benefit'],
    true
),
(
    'Tirzepatide',
    ARRAY['Zepbound', 'Mounjaro'],
    'GLP-1/GIP Receptor Agonist',
    'Dual GLP-1 and GIP receptor agonist that enhances glucose-dependent insulin secretion and reduces appetite',
    'weekly_injection',
    'Start 2.5mg weekly, titrate to 15mg weekly',
    ARRAY['T2D benefit', 'Prediabetes benefit'],
    true
),
(
    'Phentermine-Topiramate',
    ARRAY['Qsymia'],
    'Sympathomimetic Amine/Anticonvulsant',
    'Combination of appetite suppressant and anticonvulsant that promotes satiety',
    'oral',
    'Start 3.75mg/23mg daily, titrate to 15mg/92mg daily',
    ARRAY['Migraine benefit'],
    true
);
