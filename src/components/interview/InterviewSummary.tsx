import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Response, Question } from '@/types/interview';
import { FileText, Copy, Download, RotateCcw, ArrowRight, Check } from 'lucide-react';
import { useState } from 'react';

interface InterviewSummaryProps {
  responses: Response[];
  questions: Question[];
  elapsedTime: number;
  visitType: 'initial' | 'return';
  bmiData?: {
    height: number | null;
    weight: number | null;
    heightInFeet: number | null;
    heightInInches: number | null;
    useFeetInches: boolean;
  };
  onRestart: () => void;
  onProceedToAssessment: () => void;
}

export function InterviewSummary({
  responses,
  questions,
  elapsedTime,
  visitType,
  bmiData,
  onRestart,
  onProceedToAssessment,
}: InterviewSummaryProps) {
  const [copied, setCopied] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatAnswer = (answer: string | string[] | number): string => {
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    return String(answer);
  };

  const generateSummaryText = () => {
    const lines: string[] = [];
    lines.push(`=== WEIGHT CLINIC ${visitType.toUpperCase()} VISIT ===`);
    lines.push(`Date: ${new Date().toLocaleDateString()}`);
    lines.push(`Duration: ${formatTime(elapsedTime)}`);
    lines.push('');

    // Add BMI data if available
    if (bmiData && bmiData.weight) {
      const totalInches = bmiData.useFeetInches
        ? ((bmiData.heightInFeet || 0) * 12) + (bmiData.heightInInches || 0)
        : bmiData.height || 0;
      const bmi = totalInches ? (bmiData.weight / (totalInches * totalInches)) * 703 : null;
      
      lines.push('--- MEASUREMENTS ---');
      if (bmiData.useFeetInches && bmiData.heightInFeet) {
        lines.push(`Height: ${bmiData.heightInFeet}'${bmiData.heightInInches || 0}"`);
      } else if (bmiData.height) {
        lines.push(`Height: ${bmiData.height} inches`);
      }
      lines.push(`Weight: ${bmiData.weight} lbs`);
      if (bmi) {
        lines.push(`BMI: ${bmi.toFixed(1)}`);
      }
      lines.push('');
    }

    // Group responses by section
    const sections = new Map<string, { question: Question; response: Response }[]>();
    
    questions.forEach((q) => {
      const response = responses.find(r => r.questionId === q.id);
      if (response && response.answer !== '' && 
          (Array.isArray(response.answer) ? response.answer.length > 0 : true)) {
        if (!sections.has(q.section)) {
          sections.set(q.section, []);
        }
        sections.get(q.section)!.push({ question: q, response });
      }
    });

    sections.forEach((items, section) => {
      lines.push(`--- ${section.toUpperCase()} ---`);
      items.forEach(({ question, response }) => {
        lines.push(`${question.question}`);
        lines.push(`  → ${formatAnswer(response.answer)}`);
      });
      lines.push('');
    });

    return lines.join('\n');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateSummaryText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = generateSummaryText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weight-clinic-${visitType}-visit-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Group responses by section for display
  const groupedResponses = questions.reduce((acc, q) => {
    const response = responses.find(r => r.questionId === q.id);
    if (response && response.answer !== '' && 
        (Array.isArray(response.answer) ? response.answer.length > 0 : true)) {
      if (!acc[q.section]) {
        acc[q.section] = [];
      }
      acc[q.section].push({ question: q, response });
    }
    return acc;
  }, {} as Record<string, { question: Question; response: Response }[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Interview Summary
          </CardTitle>
          <CardDescription>
            {visitType === 'initial' ? 'Initial Visit' : 'Return Visit'} • 
            Duration: {formatTime(elapsedTime)} • 
            {responses.filter(r => r.answer !== '' && (!Array.isArray(r.answer) || r.answer.length > 0)).length} responses recorded
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {Object.entries(groupedResponses).map(([section, items]) => (
            <div key={section} className="space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b pb-2">
                {section}
              </h3>
              <div className="space-y-2">
                {items.map(({ question, response }) => (
                  <div key={question.id} className="grid grid-cols-2 gap-4 py-2">
                    <span className="text-sm text-muted-foreground">{question.question}</span>
                    <span className="text-sm font-medium">{formatAnswer(response.answer)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleCopy} variant="outline">
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2 text-success" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy to Clipboard
            </>
          )}
        </Button>
        <Button onClick={handleDownload} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download as Text
        </Button>
        <Button onClick={onRestart} variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Start New Interview
        </Button>
        <Button onClick={onProceedToAssessment} className="ml-auto">
          Proceed to Assessment
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
