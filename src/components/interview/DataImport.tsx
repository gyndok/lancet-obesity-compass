import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight } from 'lucide-react';

interface DataImportProps {
  value: string;
  onChange: (value: string) => void;
  onSkip: () => void;
  onContinue: () => void;
}

export function DataImport({ value, onChange, onSkip, onContinue }: DataImportProps) {
  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Import Patient Data (Optional)
        </CardTitle>
        <CardDescription>
          Paste existing patient intake data to pre-fill form fields, or skip to start fresh
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste patient intake data here..."
          rows={10}
          className="font-mono text-sm"
        />
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onSkip}>
            Skip
          </Button>
          <Button onClick={onContinue} disabled={!value.trim()}>
            Parse & Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
