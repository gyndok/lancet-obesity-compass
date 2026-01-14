import { useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Medication } from '@/types/formulary';
import { useMedications } from '@/hooks/useMedications';

const routeLabels: Record<string, string> = {
  oral: 'Oral',
  weekly_injection: 'Weekly SQ',
  daily_injection: 'Daily SQ',
  other: 'Other',
};

export function MedicationCompare() {
  const { medications, isLoading } = useMedications();
  const [selectedMeds, setSelectedMeds] = useState<Medication[]>([]);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const addMedication = (med: Medication) => {
    if (selectedMeds.length < 4 && !selectedMeds.some(m => m.id === med.id)) {
      setSelectedMeds([...selectedMeds, med]);
    }
    setOpen(false);
  };

  const removeMedication = (id: string) => {
    setSelectedMeds(selectedMeds.filter(m => m.id !== id));
  };

  const copyComparison = async () => {
    if (selectedMeds.length === 0) return;

    const text = selectedMeds.map(med => {
      return `${med.generic_name} (${med.brand_names.join(', ')})
Route: ${routeLabels[med.route]}
Efficacy: ${med.efficacy?.mean_tbwl_percent ? `${med.efficacy.mean_tbwl_percent}% TBWL` : 'N/A'}
Common AEs: ${med.common_adverse_effects.join(', ') || 'N/A'}
Contraindications: ${med.contraindications.join(', ') || 'None listed'}
Counseling: ${med.patient_counseling || 'N/A'}
---`;
    }).join('\n\n');

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const availableMeds = medications.filter(m => !selectedMeds.some(s => s.id === m.id));

  return (
    <div className="space-y-6">
      {/* Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Medications to Compare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 items-center">
            {selectedMeds.map(med => (
              <Badge key={med.id} variant="secondary" className="gap-1 py-1.5">
                {med.generic_name}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeMedication(med.id)}
                />
              </Badge>
            ))}
            
            {selectedMeds.length < 4 && (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    + Add Medication
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search medications..." />
                    <CommandList>
                      <CommandEmpty>No medications found.</CommandEmpty>
                      <CommandGroup>
                        {availableMeds.map(med => (
                          <CommandItem
                            key={med.id}
                            value={`${med.generic_name} ${med.brand_names.join(' ')}`}
                            onSelect={() => addMedication(med)}
                          >
                            <div>
                              <p className="font-medium">{med.generic_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {med.brand_names.join(', ')}
                              </p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}

            {selectedMeds.length >= 2 && (
              <Button variant="outline" size="sm" onClick={copyComparison} className="ml-auto">
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy Comparison'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Grid */}
      {selectedMeds.length >= 2 && (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedMeds.length}, 1fr)` }}>
          {/* Headers */}
          {selectedMeds.map(med => (
            <Card key={med.id} className="border-t-4 border-t-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{med.generic_name}</CardTitle>
                <p className="text-sm text-muted-foreground">{med.brand_names.join(', ')}</p>
              </CardHeader>
            </Card>
          ))}

          {/* Route/Frequency */}
          <ComparisonRow
            label="Route/Frequency"
            values={selectedMeds.map(med => (
              <Badge key={med.id} variant="secondary">
                {routeLabels[med.route]}
              </Badge>
            ))}
          />

          {/* Efficacy */}
          <ComparisonRow
            label="Mean TBWL"
            values={selectedMeds.map(med => (
              <span key={med.id} className="font-semibold text-primary">
                {med.efficacy?.mean_tbwl_percent ? `${med.efficacy.mean_tbwl_percent}%` : '—'}
                {med.efficacy?.timepoint_months && (
                  <span className="text-muted-foreground text-sm font-normal">
                    {' '}@ {med.efficacy.timepoint_months}mo
                  </span>
                )}
              </span>
            ))}
          />

          {/* Common AEs */}
          <ComparisonRow
            label="Common AEs"
            values={selectedMeds.map(med => (
              <div key={med.id} className="flex flex-wrap gap-1">
                {med.common_adverse_effects.slice(0, 5).map((ae, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {ae}
                  </Badge>
                ))}
                {med.common_adverse_effects.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{med.common_adverse_effects.length - 5} more
                  </Badge>
                )}
              </div>
            ))}
          />

          {/* Serious Warnings */}
          <ComparisonRow
            label="Serious Warnings"
            values={selectedMeds.map(med => (
              <div key={med.id} className="space-y-1">
                {med.boxed_warning && (
                  <Badge variant="destructive" className="text-xs">Boxed Warning</Badge>
                )}
                {med.serious_warnings.slice(0, 3).map((w, i) => (
                  <p key={i} className="text-xs">{w}</p>
                ))}
              </div>
            ))}
          />

          {/* Contraindications */}
          <ComparisonRow
            label="Contraindications"
            values={selectedMeds.map(med => (
              <div key={med.id} className="space-y-1">
                {med.contraindications.slice(0, 4).map((c, i) => (
                  <p key={i} className="text-xs">{c}</p>
                ))}
              </div>
            ))}
          />

          {/* Pregnancy Status */}
          <ComparisonRow
            label="Pregnancy"
            values={selectedMeds.map(med => (
              <span key={med.id}>
                {med.pregnancy_lactation?.contraindicated ? (
                  <Badge variant="destructive">Contraindicated</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">See full info</span>
                )}
              </span>
            ))}
          />

          {/* Monitoring */}
          <ComparisonRow
            label="Monitoring"
            values={selectedMeds.map(med => (
              <div key={med.id} className="space-y-1">
                {med.monitoring?.frequency && (
                  <p className="text-xs font-medium">{med.monitoring.frequency}</p>
                )}
                {med.monitoring?.parameters?.slice(0, 3).map((p, i) => (
                  <Badge key={i} variant="outline" className="text-xs mr-1">
                    {p}
                  </Badge>
                ))}
              </div>
            ))}
          />

          {/* Patient Counseling */}
          <ComparisonRow
            label="Counseling Summary"
            values={selectedMeds.map(med => (
              <p key={med.id} className="text-xs line-clamp-4">
                {med.patient_counseling || 'No counseling information available.'}
              </p>
            ))}
          />
        </div>
      )}

      {selectedMeds.length < 2 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Select at least 2 medications to compare (up to 4).</p>
        </div>
      )}
    </div>
  );
}

function ComparisonRow({ label, values }: { label: string; values: React.ReactNode[] }) {
  return (
    <>
      {values.map((value, i) => (
        <Card key={i} className="p-4">
          {i === 0 && (
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              {label}
            </p>
          )}
          {i > 0 && <div className="pt-5" />}
          {value}
        </Card>
      ))}
    </>
  );
}
