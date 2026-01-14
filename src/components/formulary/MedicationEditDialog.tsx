import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Medication } from '@/types/formulary';
import { useMedicationMutations } from '@/hooks/useMedications';

const medicationSchema = z.object({
  generic_name: z.string().min(1, 'Generic name is required'),
  brand_names: z.string(),
  drug_class: z.string().min(1, 'Drug class is required'),
  moa_short: z.string().optional(),
  moa_long: z.string().optional(),
  route: z.enum(['oral', 'weekly_injection', 'daily_injection', 'other']),
  dosing_summary: z.string().optional(),
  missed_dose_rules: z.string().optional(),
  contraindications: z.string(),
  boxed_warning: z.string().optional(),
  serious_warnings: z.string(),
  common_adverse_effects: z.string(),
  serious_adverse_effects: z.string(),
  interactions: z.string(),
  renal_adjustment: z.string().optional(),
  hepatic_adjustment: z.string().optional(),
  patient_counseling: z.string().optional(),
  pa_template: z.string().optional(),
  icd10_suggestions: z.string(),
  comorbidity_fit_tags: z.string(),
  last_reviewed_at: z.string().optional(),
  change_summary: z.string().min(1, 'Change summary is required'),
});

type MedicationFormValues = z.infer<typeof medicationSchema>;

interface MedicationEditDialogProps {
  medication: Medication;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
}

export function MedicationEditDialog({
  medication,
  open,
  onOpenChange,
  onSave,
}: MedicationEditDialogProps) {
  const { updateMedication, isLoading } = useMedicationMutations();
  const [activeTab, setActiveTab] = useState('basic');

  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      generic_name: medication.generic_name,
      brand_names: medication.brand_names.join(', '),
      drug_class: medication.drug_class,
      moa_short: medication.moa_short || '',
      moa_long: medication.moa_long || '',
      route: medication.route,
      dosing_summary: medication.dosing_summary || '',
      missed_dose_rules: medication.missed_dose_rules || '',
      contraindications: medication.contraindications.join('\n'),
      boxed_warning: medication.boxed_warning || '',
      serious_warnings: medication.serious_warnings.join('\n'),
      common_adverse_effects: medication.common_adverse_effects.join(', '),
      serious_adverse_effects: medication.serious_adverse_effects.join(', '),
      interactions: medication.interactions.join('\n'),
      renal_adjustment: medication.renal_adjustment || '',
      hepatic_adjustment: medication.hepatic_adjustment || '',
      patient_counseling: medication.patient_counseling || '',
      pa_template: medication.pa_template || '',
      icd10_suggestions: medication.icd10_suggestions.join(', '),
      comorbidity_fit_tags: medication.comorbidity_fit_tags.join(', '),
      last_reviewed_at: medication.last_reviewed_at || '',
      change_summary: '',
    },
  });

  const onSubmit = async (values: MedicationFormValues) => {
    try {
      const updates: Partial<Medication> = {
        generic_name: values.generic_name,
        brand_names: values.brand_names.split(',').map(s => s.trim()).filter(Boolean),
        drug_class: values.drug_class,
        moa_short: values.moa_short || undefined,
        moa_long: values.moa_long || undefined,
        route: values.route,
        dosing_summary: values.dosing_summary || undefined,
        missed_dose_rules: values.missed_dose_rules || undefined,
        contraindications: values.contraindications.split('\n').map(s => s.trim()).filter(Boolean),
        boxed_warning: values.boxed_warning || undefined,
        serious_warnings: values.serious_warnings.split('\n').map(s => s.trim()).filter(Boolean),
        common_adverse_effects: values.common_adverse_effects.split(',').map(s => s.trim()).filter(Boolean),
        serious_adverse_effects: values.serious_adverse_effects.split(',').map(s => s.trim()).filter(Boolean),
        interactions: values.interactions.split('\n').map(s => s.trim()).filter(Boolean),
        renal_adjustment: values.renal_adjustment || undefined,
        hepatic_adjustment: values.hepatic_adjustment || undefined,
        patient_counseling: values.patient_counseling || undefined,
        pa_template: values.pa_template || undefined,
        icd10_suggestions: values.icd10_suggestions.split(',').map(s => s.trim()).filter(Boolean),
        comorbidity_fit_tags: values.comorbidity_fit_tags.split(',').map(s => s.trim()).filter(Boolean),
        last_reviewed_at: values.last_reviewed_at || undefined,
      };

      await updateMedication(medication.id, updates, values.change_summary);
      onOpenChange(false);
      onSave?.();
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Medication</DialogTitle>
          <DialogDescription>
            Update medication information. A new version will be created and the change will be logged.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="clinical">Clinical</TabsTrigger>
                <TabsTrigger value="safety">Safety</TabsTrigger>
                <TabsTrigger value="documentation">Documentation</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[50vh] mt-4 pr-4">
                <TabsContent value="basic" className="space-y-4 mt-0">
                  <FormField
                    control={form.control}
                    name="generic_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Generic Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brand_names"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Names</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Comma-separated" />
                        </FormControl>
                        <FormDescription>Separate multiple brand names with commas</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="drug_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Drug Class</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="route"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Route</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="oral">Oral</SelectItem>
                            <SelectItem value="weekly_injection">Weekly Injection</SelectItem>
                            <SelectItem value="daily_injection">Daily Injection</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="moa_short"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mechanism of Action (Short)</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="moa_long"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mechanism of Action (Detailed)</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comorbidity_fit_tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comorbidity Tags</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Comma-separated tags" />
                        </FormControl>
                        <FormDescription>E.g., T2D benefit, HTN caution</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="clinical" className="space-y-4 mt-0">
                  <FormField
                    control={form.control}
                    name="dosing_summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dosing Summary</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="missed_dose_rules"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Missed Dose Rules</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="renal_adjustment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Renal Adjustment</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hepatic_adjustment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hepatic Adjustment</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="interactions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Drug Interactions</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={4} placeholder="One interaction per line" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="safety" className="space-y-4 mt-0">
                  <FormField
                    control={form.control}
                    name="boxed_warning"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Boxed Warning</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contraindications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraindications</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={4} placeholder="One per line" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serious_warnings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serious Warnings</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={4} placeholder="One per line" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="common_adverse_effects"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Common Adverse Effects</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Comma-separated" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serious_adverse_effects"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serious Adverse Effects</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Comma-separated" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="documentation" className="space-y-4 mt-0">
                  <FormField
                    control={form.control}
                    name="patient_counseling"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient Counseling</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={6} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pa_template"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prior Authorization Template</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={6} className="font-mono text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="icd10_suggestions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ICD-10 Suggestions</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Comma-separated codes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="last_reviewed_at"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Reviewed Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <div className="mt-4 pt-4 border-t">
              <FormField
                control={form.control}
                name="change_summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Change Summary *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Describe what was changed..." />
                    </FormControl>
                    <FormDescription>Required for audit trail</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
