import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMedicationMutations } from '@/hooks/useMedications';
import { useToast } from '@/hooks/use-toast';
import type { Medication, MedicationRoute } from '@/types/formulary';

interface AIImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

interface ParsedMedicationData {
  generic_name: string;
  brand_names: string[];
  drug_class: string;
  route: MedicationRoute;
  moa_short?: string;
  moa_long?: string;
  dosing_summary?: string;
  titration_schedule?: { week: number; dose: string; notes?: string }[];
  missed_dose_rules?: string;
  contraindications: string[];
  boxed_warning?: string;
  serious_warnings: string[];
  common_adverse_effects: string[];
  serious_adverse_effects: string[];
  interactions: string[];
  pregnancy_lactation?: {
    pregnancy_category?: string;
    pregnancy_notes?: string;
    lactation_notes?: string;
    contraindicated?: boolean;
  };
  renal_adjustment?: string;
  hepatic_adjustment?: string;
  monitoring?: {
    frequency?: string;
    parameters?: string[];
    notes?: string;
  };
  efficacy?: {
    timepoint_months?: number;
    mean_tbwl_percent?: number;
    range_tbwl_percent?: string;
    key_trial_name?: string;
  };
  patient_counseling?: string;
  comorbidity_fit_tags: string[];
}

export function AIImportDialog({ open, onOpenChange, onImportComplete }: AIImportDialogProps) {
  const [rawText, setRawText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedMedicationData | null>(null);
  const [importing, setImporting] = useState(false);
  const { createMedication } = useMedicationMutations();
  const { toast } = useToast();

  const handleParse = async () => {
    if (!rawText.trim()) {
      toast({
        title: 'No text provided',
        description: 'Please paste drug label text to parse.',
        variant: 'destructive',
      });
      return;
    }

    setParsing(true);
    setParsedData(null);

    try {
      const { data, error } = await supabase.functions.invoke('parse-drug-label', {
        body: { rawText },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.success && data?.data) {
        setParsedData(data.data);
        toast({
          title: 'Text parsed successfully',
          description: `Extracted data for ${data.data.generic_name}. Review and import.`,
        });
      }
    } catch (error) {
      console.error('Parse error:', error);
      toast({
        title: 'Parsing failed',
        description: error instanceof Error ? error.message : 'Failed to parse drug label',
        variant: 'destructive',
      });
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    if (!parsedData) return;

    setImporting(true);

    try {
      await createMedication({
        generic_name: parsedData.generic_name,
        brand_names: parsedData.brand_names || [],
        drug_class: parsedData.drug_class || 'Unknown',
        route: parsedData.route || 'other',
        moa_short: parsedData.moa_short || null,
        moa_long: parsedData.moa_long || null,
        dosing_summary: parsedData.dosing_summary || null,
        titration_schedule: parsedData.titration_schedule || [],
        missed_dose_rules: parsedData.missed_dose_rules || null,
        contraindications: parsedData.contraindications || [],
        boxed_warning: parsedData.boxed_warning || null,
        serious_warnings: parsedData.serious_warnings || [],
        common_adverse_effects: parsedData.common_adverse_effects || [],
        serious_adverse_effects: parsedData.serious_adverse_effects || [],
        interactions: parsedData.interactions || [],
        pregnancy_lactation: parsedData.pregnancy_lactation || {},
        renal_adjustment: parsedData.renal_adjustment || null,
        hepatic_adjustment: parsedData.hepatic_adjustment || null,
        monitoring: parsedData.monitoring || {},
        efficacy: parsedData.efficacy || {},
        patient_counseling: parsedData.patient_counseling || null,
        comorbidity_fit_tags: parsedData.comorbidity_fit_tags || [],
        icd10_suggestions: [],
        med_references: [],
        pa_template: null,
        is_active: true,
      } as any);

      toast({
        title: 'Medication imported',
        description: `${parsedData.generic_name} has been imported. Please review and complete the record.`,
      });

      onOpenChange(false);
      onImportComplete();
      
      // Reset state
      setRawText('');
      setParsedData(null);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Failed to import medication',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setRawText('');
    setParsedData(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Drug Label Import
          </DialogTitle>
          <DialogDescription>
            Paste drug label text, prescribing information, or clinical documentation. AI will extract structured medication data.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
          {/* Input Section */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Paste Drug Label Text</label>
            <Textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste drug label text, prescribing information, or any medication documentation here...

Example sources:
• FDA prescribing information (PDF text)
• DailyMed drug labels
• Clinical trial summaries
• Package inserts
• Medication guides"
              className="flex-1 min-h-[300px] font-mono text-sm resize-none"
              disabled={parsing}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{rawText.length.toLocaleString()} characters</span>
              <span>Max: 50,000 characters</span>
            </div>
            <Button 
              onClick={handleParse} 
              disabled={parsing || !rawText.trim()}
              className="w-full"
            >
              {parsing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Extracting with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Parse with AI
                </>
              )}
            </Button>
          </div>

          {/* Preview Section */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Extracted Data Preview</label>
            <ScrollArea className="flex-1 border rounded-md p-3 min-h-[300px]">
              {parsedData ? (
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-lg">{parsedData.generic_name}</h3>
                    {parsedData.brand_names?.length > 0 && (
                      <p className="text-muted-foreground">
                        Brand: {parsedData.brand_names.join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline">{parsedData.drug_class}</Badge>
                    <Badge variant="secondary">{parsedData.route}</Badge>
                  </div>

                  {parsedData.boxed_warning && (
                    <Card className="p-2 border-destructive bg-destructive/10">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-destructive text-xs">Boxed Warning</p>
                          <p className="text-xs line-clamp-3">{parsedData.boxed_warning}</p>
                        </div>
                      </div>
                    </Card>
                  )}

                  {parsedData.moa_short && (
                    <div>
                      <p className="font-medium text-xs text-muted-foreground">Mechanism</p>
                      <p>{parsedData.moa_short}</p>
                    </div>
                  )}

                  {parsedData.dosing_summary && (
                    <div>
                      <p className="font-medium text-xs text-muted-foreground">Dosing</p>
                      <p className="line-clamp-3">{parsedData.dosing_summary}</p>
                    </div>
                  )}

                  {parsedData.contraindications?.length > 0 && (
                    <div>
                      <p className="font-medium text-xs text-muted-foreground">Contraindications</p>
                      <ul className="list-disc list-inside text-xs space-y-0.5">
                        {parsedData.contraindications.slice(0, 5).map((c, i) => (
                          <li key={i} className="line-clamp-1">{c}</li>
                        ))}
                        {parsedData.contraindications.length > 5 && (
                          <li className="text-muted-foreground">
                            +{parsedData.contraindications.length - 5} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {parsedData.efficacy?.mean_tbwl_percent && (
                    <div>
                      <p className="font-medium text-xs text-muted-foreground">Weight Loss Efficacy</p>
                      <p>
                        {parsedData.efficacy.mean_tbwl_percent}% TBWL
                        {parsedData.efficacy.timepoint_months && ` at ${parsedData.efficacy.timepoint_months} months`}
                        {parsedData.efficacy.key_trial_name && ` (${parsedData.efficacy.key_trial_name})`}
                      </p>
                    </div>
                  )}

                  {parsedData.comorbidity_fit_tags?.length > 0 && (
                    <div>
                      <p className="font-medium text-xs text-muted-foreground">Comorbidity Fit</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {parsedData.comorbidity_fit_tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      Ready to import
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-center p-4">
                  <div>
                    <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Paste drug label text and click "Parse with AI" to extract structured data</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!parsedData || importing}
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              'Import & Review'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
