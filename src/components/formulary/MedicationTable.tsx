import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Medication } from '@/types/formulary';
import { format } from 'date-fns';

interface MedicationTableProps {
  medications: Medication[];
  isLoading: boolean;
}

const routeLabels: Record<string, string> = {
  oral: 'Oral',
  weekly_injection: 'Weekly SQ',
  daily_injection: 'Daily SQ',
  other: 'Other',
};

export function MedicationTable({ medications, isLoading }: MedicationTableProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (medications.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No medications found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Medication</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Efficacy (TBWL)</TableHead>
            <TableHead>Key Cautions</TableHead>
            <TableHead className="text-right">Last Reviewed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {medications.map((med) => (
            <TableRow
              key={med.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => navigate(`/formulary/${med.id}`)}
            >
              <TableCell>
                <div>
                  <p className="font-medium">{med.generic_name}</p>
                  {med.brand_names.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      ({med.brand_names.join(', ')})
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{med.drug_class}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {routeLabels[med.route] || med.route}
                </Badge>
              </TableCell>
              <TableCell>
                {med.efficacy?.mean_tbwl_percent ? (
                  <span className="font-medium text-primary">
                    {med.efficacy.mean_tbwl_percent}%
                    {med.efficacy.timepoint_months && (
                      <span className="text-muted-foreground text-sm">
                        {' '}@ {med.efficacy.timepoint_months}mo
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {med.boxed_warning && (
                    <Badge variant="destructive" className="text-xs">
                      Boxed Warning
                    </Badge>
                  )}
                  {med.contraindications.slice(0, 2).map((c, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {c.length > 25 ? c.slice(0, 25) + '...' : c}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {med.last_reviewed_at ? (
                  format(new Date(med.last_reviewed_at), 'MMM d, yyyy')
                ) : (
                  '—'
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
