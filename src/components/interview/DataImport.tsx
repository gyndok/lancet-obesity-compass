import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ParsedPatientData {
  demographics?: {
    age?: number | null;
    sex?: 'male' | 'female' | null;
    ethnicity?: string | null;
  };
  measurements?: {
    heightFeet?: number | null;
    heightInches?: number | null;
    heightTotalInches?: number | null;
    weight?: number | null;
  };
  symptoms?: {
    breathlessness?: boolean;
    fatigue?: boolean;
    chronicPain?: boolean;
    urinaryIncontinence?: boolean;
    reflux?: boolean;
    sleepDisorders?: boolean;
    mentalHealth?: boolean;
  };
  medicalHistory?: {
    type2Diabetes?: boolean;
    pcos?: boolean;
    hypertension?: boolean;
    cardiovascularDisease?: boolean;
    sleepApnea?: boolean;
    nafld?: boolean;
    osteoarthritis?: boolean;
  };
  functionalLimitations?: {
    mobilityLimitations?: boolean;
    bathingDifficulty?: boolean;
    dressingDifficulty?: boolean;
    toiletingDifficulty?: boolean;
    continenceDifficulty?: boolean;
    eatingDifficulty?: boolean;
  };
}

interface DataImportProps {
  value: string;
  onChange: (value: string) => void;
  onSkip: () => void;
  onContinue: () => void;
  onParsedData?: (data: ParsedPatientData) => void;
}

export function DataImport({ value, onChange, onSkip, onContinue, onParsedData }: DataImportProps) {
  const [isParsing, setIsParsing] = useState(false);
  const { toast } = useToast();

  const handleParseAndContinue = async () => {
    if (!value.trim()) {
      onContinue();
      return;
    }

    setIsParsing(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-patient-data', {
        body: { patientData: value }
      });

      if (error) {
        throw new Error(error.message || 'Failed to parse data');
      }

      if (data?.success && data?.data) {
        toast({
          title: "Data Extracted",
          description: "Patient data has been parsed and will be used to pre-fill forms.",
        });
        
        // Store parsed data in localStorage for the assessment
        const existingData = localStorage.getItem('interview-assessment-data');
        const assessmentData = existingData ? JSON.parse(existingData) : {};
        
        // Map parsed data to assessment format
        const parsedData = data.data as ParsedPatientData;
        
        if (parsedData.demographics || parsedData.measurements) {
          assessmentData.anthropometrics = {
            ...assessmentData.anthropometrics,
            age: parsedData.demographics?.age || undefined,
            sex: parsedData.demographics?.sex || undefined,
            ethnicity: parsedData.demographics?.ethnicity || undefined,
            height: parsedData.measurements?.heightTotalInches || 
                    (parsedData.measurements?.heightFeet && parsedData.measurements?.heightInches 
                      ? (parsedData.measurements.heightFeet * 12) + parsedData.measurements.heightInches 
                      : undefined),
            weight: parsedData.measurements?.weight || undefined,
          };
        }

        if (parsedData.symptoms || parsedData.medicalHistory) {
          assessmentData.clinical = {
            ...assessmentData.clinical,
            ...parsedData.symptoms,
            ...parsedData.medicalHistory,
          };
        }

        if (parsedData.functionalLimitations) {
          assessmentData.functional = {
            ...assessmentData.functional,
            ...parsedData.functionalLimitations,
          };
        }

        localStorage.setItem('ai-parsed-patient-data', JSON.stringify(assessmentData));
        
        if (onParsedData) {
          onParsedData(parsedData);
        }
      }

      onContinue();
    } catch (error) {
      console.error('Error parsing patient data:', error);
      toast({
        title: "Parsing Error",
        description: error instanceof Error ? error.message : "Failed to parse patient data. Continuing without AI extraction.",
        variant: "destructive",
      });
      // Continue anyway without parsed data
      onContinue();
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Import Patient Data (Optional)
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Paste existing patient intake data - AI will extract and pre-fill assessment fields
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste patient intake data here... (e.g., medical records, intake forms, notes)

Example:
Patient: 45 year old female, Caucasian
Height: 5'6&quot;, Weight: 185 lbs
Medical History: Type 2 diabetes, hypertension, sleep apnea
Symptoms: Reports chronic fatigue, joint pain, shortness of breath with exertion
Functional: Difficulty with mobility, trouble climbing stairs"
          rows={12}
          className="font-mono text-sm"
          disabled={isParsing}
        />
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onSkip} disabled={isParsing}>
            Skip
          </Button>
          <Button onClick={handleParseAndContinue} disabled={isParsing}>
            {isParsing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Parsing with AI...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Parse & Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
