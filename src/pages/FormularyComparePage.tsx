import { FormularyLayout } from '@/components/formulary/FormularyLayout';
import { MedicationCompare } from '@/components/formulary/MedicationCompare';

export default function FormularyComparePage() {
  return (
    <FormularyLayout title="Compare Medications">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Compare Medications</h2>
          <p className="text-muted-foreground">
            Select 2-4 medications to compare side-by-side
          </p>
        </div>

        <MedicationCompare />
      </div>
    </FormularyLayout>
  );
}
