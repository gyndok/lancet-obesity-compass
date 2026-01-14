export type MedicationRoute = 'oral' | 'weekly_injection' | 'daily_injection' | 'other';

export interface MedicationReference {
  title: string;
  source_name: string;
  url?: string;
  accessed_date?: string;
}

export interface TitrationStep {
  week: number;
  dose: string;
  notes?: string;
}

export interface PregnancyLactation {
  pregnancy_category?: string;
  pregnancy_notes?: string;
  lactation_notes?: string;
  contraindicated?: boolean;
}

export interface Monitoring {
  frequency?: string;
  parameters?: string[];
  notes?: string;
}

export interface Efficacy {
  timepoint_months?: number;
  mean_tbwl_percent?: number;
  range_tbwl_percent?: string;
  key_trial_name?: string;
}

export interface Medication {
  id: string;
  generic_name: string;
  brand_names: string[];
  drug_class: string;
  moa_short?: string;
  moa_long?: string;
  route: MedicationRoute;
  dosing_summary?: string;
  titration_schedule?: TitrationStep[];
  missed_dose_rules?: string;
  contraindications: string[];
  boxed_warning?: string;
  serious_warnings: string[];
  common_adverse_effects: string[];
  serious_adverse_effects: string[];
  interactions: string[];
  pregnancy_lactation?: PregnancyLactation;
  renal_adjustment?: string;
  hepatic_adjustment?: string;
  monitoring?: Monitoring;
  efficacy?: Efficacy;
  comorbidity_fit_tags: string[];
  patient_counseling?: string;
  pa_template?: string;
  icd10_suggestions: string[];
  med_references?: MedicationReference[];
  last_reviewed_at?: string;
  version: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MedicationChangeLog {
  id: string;
  medication_id: string;
  changed_by?: string;
  changed_at: string;
  change_summary: string;
  before_snapshot?: Medication;
  after_snapshot?: Medication;
}

export interface FormularyRule {
  id: string;
  payer_name: string;
  rule_set: Record<string, unknown>;
  last_verified_at?: string;
  created_at?: string;
  updated_at?: string;
}

export type AppRole = 'admin' | 'clinician' | 'user';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at?: string;
}
