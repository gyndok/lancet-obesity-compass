import { useState, useCallback } from 'react';
import { FormularyLayout } from '@/components/formulary/FormularyLayout';
import { MedicationTable } from '@/components/formulary/MedicationTable';
import { MedicationFilters, FilterState } from '@/components/formulary/MedicationFilters';
import { LabelImportDialog } from '@/components/formulary/LabelImportDialog';
import { AIImportDialog } from '@/components/formulary/AIImportDialog';
import { useMedications } from '@/hooks/useMedications';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { FileDown, Sparkles } from 'lucide-react';

export default function FormularyBrowse() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    drugClass: [],
    route: [],
    pregnancyContraindicated: null,
    comorbidityTags: [],
  });
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [aiImportDialogOpen, setAiImportDialogOpen] = useState(false);

  const { medications, isLoading, refetch } = useMedications({
    search: filters.search,
    drugClass: filters.drugClass,
    route: filters.route,
    pregnancyContraindicated: filters.pregnancyContraindicated,
    comorbidityTags: filters.comorbidityTags,
  });

  const { isAdmin } = useUserRole();

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  return (
    <FormularyLayout title="Medication Formulary">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Browse Medications</h2>
            <p className="text-muted-foreground">
              {medications.length} medication{medications.length !== 1 ? 's' : ''} available
            </p>
          </div>
          
          {isAdmin && (
            <div className="flex gap-2">
              <Button onClick={() => setAiImportDialogOpen(true)} variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Import
              </Button>
              <Button onClick={() => setImportDialogOpen(true)} variant="outline">
                <FileDown className="h-4 w-4 mr-2" />
                Import from FDA
              </Button>
            </div>
          )}
        </div>

        <MedicationFilters onFiltersChange={handleFiltersChange} />
        
        <MedicationTable medications={medications} isLoading={isLoading} />
      </div>

      <LabelImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImportComplete={refetch}
      />

      <AIImportDialog
        open={aiImportDialogOpen}
        onOpenChange={setAiImportDialogOpen}
        onImportComplete={refetch}
      />
    </FormularyLayout>
  );
}
