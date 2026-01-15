import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, FileText, AlertTriangle, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMedicationMutations } from '@/hooks/useMedications';
import { useToast } from '@/hooks/use-toast';

interface ParsedMedication {
  generic_name: string;
  brand_names: string[];
  drug_class: string;
  route: 'oral' | 'weekly_injection' | 'daily_injection' | 'other';
  moa_short: string;
  moa_long: string;
  dosing_summary: string;
  contraindications: string[];
  boxed_warning: string | null;
  serious_warnings: string[];
  common_adverse_effects: string[];
  serious_adverse_effects: string[];
  interactions: string[];
  pregnancy_lactation: {
    pregnancy_notes?: string;
    lactation_notes?: string;
  };
  patient_counseling: string;
  label_set_id: string;
  raw_label_data: Record<string, unknown>;
  med_references: Array<{
    title: string;
    source_name: string;
    url: string;
    accessed_date: string;
  }>;
}

interface LabelImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

export function LabelImportDialog({ open, onOpenChange, onImportComplete }: LabelImportDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [setId, setSetId] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ParsedMedication[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const { createMedication } = useMedicationMutations();
  const { toast } = useToast();

  const handleSearch = async (type: 'name' | 'setid') => {
    setLoading(true);
    setResults([]);
    setSelectedIndex(null);

    try {
      const { data, error } = await supabase.functions.invoke('fetch-fda-label', {
        body: type === 'name' ? { searchTerm } : { setId },
      });

      if (error) throw error;

      if (data.error && data.results?.length === 0) {
        toast({
          title: 'No results found',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      setResults(data.results || []);
      if (data.results?.length === 1) {
        setSelectedIndex(0);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: error instanceof Error ? error.message : 'Failed to fetch FDA label data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (selectedIndex === null || !results[selectedIndex]) return;

    setImporting(true);
    const selected = results[selectedIndex];

    try {
      await createMedication({
        generic_name: selected.generic_name,
        brand_names: selected.brand_names,
        drug_class: selected.drug_class,
        route: selected.route,
        moa_short: selected.moa_short || null,
        moa_long: selected.moa_long || null,
        dosing_summary: selected.dosing_summary || null,
        contraindications: selected.contraindications,
        boxed_warning: selected.boxed_warning,
        serious_warnings: selected.serious_warnings,
        common_adverse_effects: selected.common_adverse_effects,
        serious_adverse_effects: selected.serious_adverse_effects,
        interactions: selected.interactions,
        pregnancy_lactation: selected.pregnancy_lactation,
        patient_counseling: selected.patient_counseling || null,
        comorbidity_fit_tags: [],
        icd10_suggestions: [],
        med_references: selected.med_references,
        is_active: true,
        // Additional fields from label import
        titration_schedule: [],
        missed_dose_rules: null,
        renal_adjustment: null,
        hepatic_adjustment: null,
        monitoring: {},
        efficacy: {},
        pa_template: null,
      } as any);

      toast({
        title: 'Medication imported',
        description: `${selected.generic_name} has been imported successfully. Please review and complete the record.`,
      });

      onOpenChange(false);
      onImportComplete();
      
      // Reset state
      setSearchTerm('');
      setSetId('');
      setResults([]);
      setSelectedIndex(null);
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

  const selectedMed = selectedIndex !== null ? results[selectedIndex] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Import from FDA Label
          </DialogTitle>
          <DialogDescription>
            Search the openFDA drug labeling database to pre-populate medication data.
            You'll need to review and complete fields like efficacy data and clinical summaries.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="name" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="name">Search by Name</TabsTrigger>
            <TabsTrigger value="setid">Search by SET ID</TabsTrigger>
          </TabsList>

          <TabsContent value="name" className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="search-name" className="sr-only">Drug name</Label>
                <Input
                  id="search-name"
                  placeholder="Enter generic or brand name (e.g., semaglutide, Wegovy)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch('name')}
                />
              </div>
              <Button onClick={() => handleSearch('name')} disabled={!searchTerm || loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span className="ml-2">Search</span>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="setid" className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="search-setid" className="sr-only">SET ID</Label>
                <Input
                  id="search-setid"
                  placeholder="Enter DailyMed SET ID (e.g., 3a67c5df-3c34-4d7b-8b41-e4c25ca4f8bc)"
                  value={setId}
                  onChange={(e) => setSetId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch('setid')}
                />
              </div>
              <Button onClick={() => handleSearch('setid')} disabled={!setId || loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span className="ml-2">Search</span>
              </Button>
            </div>
          </TabsContent>

          {/* Results Section */}
          {results.length > 0 && (
            <div className="flex-1 overflow-hidden grid grid-cols-2 gap-4 mt-4">
              {/* Results List */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Search Results ({results.length})</Label>
                <ScrollArea className="h-[300px] border rounded-md p-2">
                  {results.map((med, idx) => (
                    <Card
                      key={idx}
                      className={`mb-2 cursor-pointer transition-colors ${
                        selectedIndex === idx ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedIndex(idx)}
                    >
                      <CardHeader className="p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{med.generic_name}</CardTitle>
                            <CardDescription className="text-xs">
                              {med.brand_names.join(', ') || 'No brand names'}
                            </CardDescription>
                          </div>
                          {selectedIndex === idx && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">{med.route}</Badge>
                          {med.boxed_warning && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Boxed Warning
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </ScrollArea>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Preview</Label>
                <ScrollArea className="h-[300px] border rounded-md p-3">
                  {selectedMed ? (
                    <div className="space-y-4 text-sm">
                      <div>
                        <span className="font-medium">Generic Name:</span> {selectedMed.generic_name}
                      </div>
                      <div>
                        <span className="font-medium">Brand Names:</span>{' '}
                        {selectedMed.brand_names.join(', ') || 'None listed'}
                      </div>
                      <div>
                        <span className="font-medium">Route:</span> {selectedMed.route}
                      </div>
                      {selectedMed.boxed_warning && (
                        <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive">
                          <span className="font-medium">⚠️ Boxed Warning:</span>
                          <p className="mt-1 text-xs line-clamp-3">{selectedMed.boxed_warning}</p>
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Contraindications:</span>
                        <ul className="list-disc list-inside mt-1 text-xs text-muted-foreground">
                          {selectedMed.contraindications.slice(0, 5).map((c, i) => (
                            <li key={i} className="line-clamp-1">{c}</li>
                          ))}
                          {selectedMed.contraindications.length > 5 && (
                            <li>...and {selectedMed.contraindications.length - 5} more</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <span className="font-medium">Interactions:</span>{' '}
                        <span className="text-muted-foreground">
                          {selectedMed.interactions.length} listed
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <span className="font-medium text-amber-600">⚡ Needs Review:</span>
                        <ul className="list-disc list-inside mt-1 text-xs text-muted-foreground">
                          <li>Drug class (defaults to generic)</li>
                          <li>Mechanism of action</li>
                          <li>Titration schedule</li>
                          <li>Efficacy data from trials</li>
                          <li>Comorbidity fit tags</li>
                          <li>ICD-10 suggestions</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Select a medication to preview
                    </p>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && results.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-muted-foreground py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Search for a medication to import FDA label data</p>
                <p className="text-xs mt-2">Data is sourced from openFDA Drug Labeling API</p>
              </div>
            </div>
          )}
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedIndex === null || importing}
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
