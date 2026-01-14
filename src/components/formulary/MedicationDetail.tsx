import { useState } from 'react';
import { Copy, Check, ExternalLink, AlertTriangle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import type { Medication } from '@/types/formulary';
import { format } from 'date-fns';
import { useUserRole } from '@/hooks/useUserRole';
import { MedicationEditDialog } from './MedicationEditDialog';

interface MedicationDetailProps {
  medication: Medication;
  onUpdate?: () => void;
}

const routeLabels: Record<string, string> = {
  oral: 'Oral',
  weekly_injection: 'Weekly Injection',
  daily_injection: 'Daily Injection',
  other: 'Other',
};

export function MedicationDetail({ medication, onUpdate }: MedicationDetailProps) {
  const { isAdmin } = useUserRole();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => copyToClipboard(text, field)}
      className="h-7 px-2"
    >
      {copiedField === field ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold">{medication.generic_name}</h1>
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {medication.brand_names.map((brand) => (
              <Badge key={brand} variant="secondary">
                {brand}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline">{medication.drug_class}</Badge>
            <Badge variant="default">{routeLabels[medication.route]}</Badge>
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>Version {medication.version}</p>
          {medication.last_reviewed_at && (
            <p>Last reviewed: {format(new Date(medication.last_reviewed_at), 'MMM d, yyyy')}</p>
          )}
        </div>
      </div>

      {/* Boxed Warning */}
      {medication.boxed_warning && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Boxed Warning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{medication.boxed_warning}</p>
          </CardContent>
        </Card>
      )}

      {/* Sections */}
      <Accordion type="multiple" defaultValue={['dosing', 'efficacy', 'contraindications']} className="space-y-2">
        {/* Indication/Eligibility */}
        <AccordionItem value="indication" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">Indication & Eligibility</AccordionTrigger>
          <AccordionContent>
            <p className="text-muted-foreground">{medication.moa_short || 'No indication information available.'}</p>
            {medication.moa_long && (
              <p className="mt-2 text-sm">{medication.moa_long}</p>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Dosing/Titration */}
        <AccordionItem value="dosing" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">Dosing & Titration</AccordionTrigger>
          <AccordionContent className="space-y-4">
            {medication.dosing_summary && (
              <div>
                <h4 className="font-medium mb-1">Dosing Summary</h4>
                <p className="text-sm">{medication.dosing_summary}</p>
              </div>
            )}
            {medication.titration_schedule && medication.titration_schedule.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Titration Schedule</h4>
                <div className="grid gap-2">
                  {medication.titration_schedule.map((step, i) => (
                    <div key={i} className="flex items-center gap-4 p-2 bg-muted/50 rounded">
                      <span className="text-sm font-medium w-20">Week {step.week}</span>
                      <span className="text-sm">{step.dose}</span>
                      {step.notes && <span className="text-sm text-muted-foreground">({step.notes})</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {medication.missed_dose_rules && (
              <div>
                <h4 className="font-medium mb-1">Missed Dose Rules</h4>
                <p className="text-sm">{medication.missed_dose_rules}</p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Efficacy */}
        <AccordionItem value="efficacy" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">Efficacy</AccordionTrigger>
          <AccordionContent>
            {medication.efficacy?.mean_tbwl_percent ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">
                    {medication.efficacy.mean_tbwl_percent}%
                  </span>
                  <span className="text-muted-foreground">
                    Mean TBWL
                    {medication.efficacy.timepoint_months && ` at ${medication.efficacy.timepoint_months} months`}
                  </span>
                </div>
                {medication.efficacy.range_tbwl_percent && (
                  <p className="text-sm text-muted-foreground">
                    Range: {medication.efficacy.range_tbwl_percent}
                  </p>
                )}
                {medication.efficacy.key_trial_name && (
                  <Badge variant="outline">{medication.efficacy.key_trial_name}</Badge>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No efficacy data available. Enter sourced data.</p>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Contraindications/Warnings */}
        <AccordionItem value="contraindications" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">Contraindications & Warnings</AccordionTrigger>
          <AccordionContent className="space-y-4">
            {medication.contraindications.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Contraindications</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {medication.contraindications.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
            {medication.serious_warnings.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Serious Warnings</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {medication.serious_warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Adverse Effects */}
        <AccordionItem value="adverse" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">Adverse Effects</AccordionTrigger>
          <AccordionContent className="space-y-4">
            {medication.common_adverse_effects.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Common</h4>
                <div className="flex flex-wrap gap-2">
                  {medication.common_adverse_effects.map((e, i) => (
                    <Badge key={i} variant="outline">{e}</Badge>
                  ))}
                </div>
              </div>
            )}
            {medication.serious_adverse_effects.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Serious</h4>
                <div className="flex flex-wrap gap-2">
                  {medication.serious_adverse_effects.map((e, i) => (
                    <Badge key={i} variant="destructive">{e}</Badge>
                  ))}
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Interactions */}
        <AccordionItem value="interactions" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">Interactions</AccordionTrigger>
          <AccordionContent>
            {medication.interactions.length > 0 ? (
              <ul className="list-disc list-inside text-sm space-y-1">
                {medication.interactions.map((i, idx) => (
                  <li key={idx}>{i}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No significant interactions documented.</p>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Pregnancy/Lactation */}
        <AccordionItem value="pregnancy" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">Pregnancy & Lactation</AccordionTrigger>
          <AccordionContent>
            {medication.pregnancy_lactation ? (
              <div className="space-y-2">
                {medication.pregnancy_lactation.contraindicated && (
                  <Badge variant="destructive">Contraindicated in Pregnancy</Badge>
                )}
                {medication.pregnancy_lactation.pregnancy_category && (
                  <p className="text-sm">
                    <span className="font-medium">Category:</span> {medication.pregnancy_lactation.pregnancy_category}
                  </p>
                )}
                {medication.pregnancy_lactation.pregnancy_notes && (
                  <p className="text-sm">{medication.pregnancy_lactation.pregnancy_notes}</p>
                )}
                {medication.pregnancy_lactation.lactation_notes && (
                  <p className="text-sm">
                    <span className="font-medium">Lactation:</span> {medication.pregnancy_lactation.lactation_notes}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No pregnancy/lactation information available.</p>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Renal/Hepatic */}
        <AccordionItem value="renal-hepatic" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">Renal & Hepatic Adjustment</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">Renal Adjustment</h4>
              <p className="text-sm">{medication.renal_adjustment || 'No renal adjustment information available.'}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Hepatic Adjustment</h4>
              <p className="text-sm">{medication.hepatic_adjustment || 'No hepatic adjustment information available.'}</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Monitoring */}
        <AccordionItem value="monitoring" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">Monitoring</AccordionTrigger>
          <AccordionContent>
            {medication.monitoring ? (
              <div className="space-y-2">
                {medication.monitoring.frequency && (
                  <p className="text-sm">
                    <span className="font-medium">Frequency:</span> {medication.monitoring.frequency}
                  </p>
                )}
                {medication.monitoring.parameters && medication.monitoring.parameters.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {medication.monitoring.parameters.map((p, i) => (
                      <Badge key={i} variant="outline">{p}</Badge>
                    ))}
                  </div>
                )}
                {medication.monitoring.notes && (
                  <p className="text-sm text-muted-foreground">{medication.monitoring.notes}</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No monitoring information available.</p>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Patient Counseling */}
        <AccordionItem value="counseling" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">Patient Counseling</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm whitespace-pre-wrap">
                {medication.patient_counseling || 'No patient counseling information available.'}
              </p>
              {medication.patient_counseling && (
                <CopyButton text={medication.patient_counseling} field="counseling" />
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Prior Auth Template */}
        <AccordionItem value="pa" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">Prior Authorization Template</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-start justify-between gap-4">
              <pre className="text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded-lg flex-1">
                {medication.pa_template || 'No PA template available.'}
              </pre>
              {medication.pa_template && (
                <CopyButton text={medication.pa_template} field="pa" />
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ICD-10 Suggestions */}
        <AccordionItem value="icd10" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">ICD-10 Suggestions</AccordionTrigger>
          <AccordionContent>
            {medication.icd10_suggestions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {medication.icd10_suggestions.map((code, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => copyToClipboard(code, `icd10-${i}`)}
                  >
                    {code}
                    {copiedField === `icd10-${i}` ? (
                      <Check className="h-3 w-3 ml-1" />
                    ) : (
                      <Copy className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No ICD-10 suggestions available.</p>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* References */}
        <AccordionItem value="references" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">References</AccordionTrigger>
          <AccordionContent>
            {medication.med_references && medication.med_references.length > 0 ? (
              <ul className="space-y-2">
                {medication.med_references.map((ref, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-medium">{ref.title}</span>
                    {ref.source_name && <span className="text-muted-foreground"> — {ref.source_name}</span>}
                    {ref.url && (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-primary hover:underline inline-flex items-center gap-1"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {ref.accessed_date && (
                      <span className="text-muted-foreground text-xs ml-2">
                        (Accessed: {ref.accessed_date})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No references available. Add FDA label and key trial references.</p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Edit Dialog */}
      {isAdmin && (
        <MedicationEditDialog
          medication={medication}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSave={onUpdate}
        />
      )}
    </div>
  );
}
