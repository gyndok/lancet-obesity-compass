import { useState, useCallback } from 'react';
import { FormularyLayout } from '@/components/formulary/FormularyLayout';
import { MedicationTable } from '@/components/formulary/MedicationTable';
import { MedicationFilters, FilterState } from '@/components/formulary/MedicationFilters';
import { useMedications } from '@/hooks/useMedications';

export default function FormularyBrowse() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    drugClass: [],
    route: [],
    pregnancyContraindicated: null,
    comorbidityTags: [],
  });

  const { medications, isLoading } = useMedications({
    search: filters.search,
    drugClass: filters.drugClass,
    route: filters.route,
    pregnancyContraindicated: filters.pregnancyContraindicated,
    comorbidityTags: filters.comorbidityTags,
  });

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
        </div>

        <MedicationFilters onFiltersChange={handleFiltersChange} />
        
        <MedicationTable medications={medications} isLoading={isLoading} />
      </div>
    </FormularyLayout>
  );
}
