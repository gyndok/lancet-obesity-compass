import { useParams } from 'react-router-dom';
import { FormularyLayout } from '@/components/formulary/FormularyLayout';
import { MedicationDetail } from '@/components/formulary/MedicationDetail';
import { useMedication } from '@/hooks/useMedications';
import { Skeleton } from '@/components/ui/skeleton';

export default function FormularyDetail() {
  const { id } = useParams<{ id: string }>();
  const { medication, isLoading, error } = useMedication(id);

  if (isLoading) {
    return (
      <FormularyLayout title="Loading..." showBackButton>
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </FormularyLayout>
    );
  }

  if (error || !medication) {
    return (
      <FormularyLayout title="Error" showBackButton>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-destructive">Medication Not Found</h2>
          <p className="text-muted-foreground mt-2">
            {error || 'The medication you are looking for does not exist.'}
          </p>
        </div>
      </FormularyLayout>
    );
  }

  return (
    <FormularyLayout title={medication.generic_name} showBackButton>
      <MedicationDetail medication={medication} />
    </FormularyLayout>
  );
}
