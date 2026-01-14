import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Medication, MedicationChangeLog } from '@/types/formulary';
import { useToast } from '@/hooks/use-toast';

interface MedicationFilters {
  search?: string;
  drugClass?: string[];
  route?: string[];
  pregnancyContraindicated?: boolean | null;
  comorbidityTags?: string[];
}

export function useMedications(filters?: MedicationFilters) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMedications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('medications')
        .select('*')
        .eq('is_active', true)
        .order('generic_name');

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      let result = (data || []).map(mapMedicationFromDb);

      // Apply client-side filtering
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(med => 
          med.generic_name.toLowerCase().includes(searchLower) ||
          med.brand_names.some(b => b.toLowerCase().includes(searchLower))
        );
      }

      if (filters?.drugClass && filters.drugClass.length > 0) {
        result = result.filter(med => 
          filters.drugClass!.includes(med.drug_class)
        );
      }

      if (filters?.route && filters.route.length > 0) {
        result = result.filter(med => 
          filters.route!.includes(med.route)
        );
      }

      if (filters?.pregnancyContraindicated !== null && filters?.pregnancyContraindicated !== undefined) {
        result = result.filter(med => {
          const isContraindicated = med.pregnancy_lactation?.contraindicated ?? false;
          return filters.pregnancyContraindicated ? isContraindicated : !isContraindicated;
        });
      }

      if (filters?.comorbidityTags && filters.comorbidityTags.length > 0) {
        result = result.filter(med => 
          filters.comorbidityTags!.some(tag => 
            med.comorbidity_fit_tags.includes(tag)
          )
        );
      }

      setMedications(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch medications';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters?.search, filters?.drugClass, filters?.route, filters?.pregnancyContraindicated, filters?.comorbidityTags, toast]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  return { medications, isLoading, error, refetch: fetchMedications };
}

export function useMedication(id: string | undefined) {
  const [medication, setMedication] = useState<Medication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setMedication(null);
      setIsLoading(false);
      return;
    }

    async function fetchMedication() {
      setIsLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('medications')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (fetchError) throw fetchError;
        
        setMedication(data ? mapMedicationFromDb(data) : null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch medication');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMedication();
  }, [id]);

  return { medication, isLoading, error };
}

export function useMedicationMutations() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const createMedication = async (medication: Omit<Medication, 'id' | 'version' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    try {
      const dbMedication = mapMedicationToDb(medication);
      const { data, error } = await supabase
        .from('medications')
        .insert(dbMedication as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Medication created successfully',
      });

      return mapMedicationFromDb(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create medication';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateMedication = async (id: string, updates: Partial<Medication>, changeSummary: string) => {
    setIsLoading(true);
    try {
      // First get current medication for change log
      const { data: current, error: fetchError } = await supabase
        .from('medications')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Increment version
      const newVersion = (current.version || 1) + 1;
      const dbUpdates = mapMedicationToDb({ ...updates, version: newVersion } as Medication);

      const { data: updated, error: updateError } = await supabase
        .from('medications')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Create change log entry
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('medication_change_log').insert({
          medication_id: id,
          changed_by: user.id,
          change_summary: changeSummary,
          before_snapshot: current,
          after_snapshot: updated,
        });
      }

      toast({
        title: 'Success',
        description: 'Medication updated successfully',
      });

      return mapMedicationFromDb(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update medication';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMedication = async (id: string) => {
    setIsLoading(true);
    try {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('medications')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Medication archived successfully',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to archive medication';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { createMedication, updateMedication, deleteMedication, isLoading };
}

export function useMedicationChangeLog(medicationId: string) {
  const [logs, setLogs] = useState<MedicationChangeLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('medication_change_log')
          .select('*')
          .eq('medication_id', medicationId)
          .order('changed_at', { ascending: false });

        if (error) throw error;

        setLogs((data || []).map(log => ({
          ...log,
          before_snapshot: log.before_snapshot as unknown as Medication | undefined,
          after_snapshot: log.after_snapshot as unknown as Medication | undefined,
        })));
      } catch (err) {
        console.error('Error fetching change log:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (medicationId) {
      fetchLogs();
    }
  }, [medicationId]);

  return { logs, isLoading };
}

// Helper functions to map between DB and TypeScript types
function mapMedicationFromDb(data: Record<string, unknown>): Medication {
  return {
    id: data.id as string,
    generic_name: data.generic_name as string,
    brand_names: (data.brand_names as string[]) || [],
    drug_class: data.drug_class as string,
    moa_short: data.moa_short as string | undefined,
    moa_long: data.moa_long as string | undefined,
    route: data.route as Medication['route'],
    dosing_summary: data.dosing_summary as string | undefined,
    titration_schedule: data.titration_schedule as Medication['titration_schedule'],
    missed_dose_rules: data.missed_dose_rules as string | undefined,
    contraindications: (data.contraindications as string[]) || [],
    boxed_warning: data.boxed_warning as string | undefined,
    serious_warnings: (data.serious_warnings as string[]) || [],
    common_adverse_effects: (data.common_adverse_effects as string[]) || [],
    serious_adverse_effects: (data.serious_adverse_effects as string[]) || [],
    interactions: (data.interactions as string[]) || [],
    pregnancy_lactation: data.pregnancy_lactation as Medication['pregnancy_lactation'],
    renal_adjustment: data.renal_adjustment as string | undefined,
    hepatic_adjustment: data.hepatic_adjustment as string | undefined,
    monitoring: data.monitoring as Medication['monitoring'],
    efficacy: data.efficacy as Medication['efficacy'],
    comorbidity_fit_tags: (data.comorbidity_fit_tags as string[]) || [],
    patient_counseling: data.patient_counseling as string | undefined,
    pa_template: data.pa_template as string | undefined,
    icd10_suggestions: (data.icd10_suggestions as string[]) || [],
    med_references: data.med_references as Medication['med_references'],
    last_reviewed_at: data.last_reviewed_at as string | undefined,
    version: (data.version as number) || 1,
    is_active: (data.is_active as boolean) ?? true,
    created_at: data.created_at as string | undefined,
    updated_at: data.updated_at as string | undefined,
  };
}

function mapMedicationToDb(medication: Partial<Medication>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  if (medication.generic_name !== undefined) result.generic_name = medication.generic_name;
  if (medication.brand_names !== undefined) result.brand_names = medication.brand_names;
  if (medication.drug_class !== undefined) result.drug_class = medication.drug_class;
  if (medication.moa_short !== undefined) result.moa_short = medication.moa_short;
  if (medication.moa_long !== undefined) result.moa_long = medication.moa_long;
  if (medication.route !== undefined) result.route = medication.route;
  if (medication.dosing_summary !== undefined) result.dosing_summary = medication.dosing_summary;
  if (medication.titration_schedule !== undefined) result.titration_schedule = medication.titration_schedule;
  if (medication.missed_dose_rules !== undefined) result.missed_dose_rules = medication.missed_dose_rules;
  if (medication.contraindications !== undefined) result.contraindications = medication.contraindications;
  if (medication.boxed_warning !== undefined) result.boxed_warning = medication.boxed_warning;
  if (medication.serious_warnings !== undefined) result.serious_warnings = medication.serious_warnings;
  if (medication.common_adverse_effects !== undefined) result.common_adverse_effects = medication.common_adverse_effects;
  if (medication.serious_adverse_effects !== undefined) result.serious_adverse_effects = medication.serious_adverse_effects;
  if (medication.interactions !== undefined) result.interactions = medication.interactions;
  if (medication.pregnancy_lactation !== undefined) result.pregnancy_lactation = medication.pregnancy_lactation;
  if (medication.renal_adjustment !== undefined) result.renal_adjustment = medication.renal_adjustment;
  if (medication.hepatic_adjustment !== undefined) result.hepatic_adjustment = medication.hepatic_adjustment;
  if (medication.monitoring !== undefined) result.monitoring = medication.monitoring;
  if (medication.efficacy !== undefined) result.efficacy = medication.efficacy;
  if (medication.comorbidity_fit_tags !== undefined) result.comorbidity_fit_tags = medication.comorbidity_fit_tags;
  if (medication.patient_counseling !== undefined) result.patient_counseling = medication.patient_counseling;
  if (medication.pa_template !== undefined) result.pa_template = medication.pa_template;
  if (medication.icd10_suggestions !== undefined) result.icd10_suggestions = medication.icd10_suggestions;
  if (medication.med_references !== undefined) result.med_references = medication.med_references;
  if (medication.last_reviewed_at !== undefined) result.last_reviewed_at = medication.last_reviewed_at;
  if (medication.version !== undefined) result.version = medication.version;
  if (medication.is_active !== undefined) result.is_active = medication.is_active;
  
  return result;
}
