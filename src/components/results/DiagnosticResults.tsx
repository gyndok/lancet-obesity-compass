import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DiagnosticResult, PatientData } from "@/types/clinical";
import { FileText, Download, AlertCircle, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";

interface DiagnosticResultsProps {
  result: DiagnosticResult | null;
  patientData: PatientData;
}

export function DiagnosticResults({ result, patientData }: DiagnosticResultsProps) {
  if (!result) {
    return (
      <Card className="medical-section h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            Diagnostic Assessment
          </CardTitle>
          <CardDescription>
            Complete patient assessment forms to receive diagnostic evaluation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Enter basic anthropometric data (height, weight) to begin diagnostic evaluation.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getClassificationDetails = (classification: string) => {
    switch (classification) {
      case 'clinical-obesity':
        return {
          label: 'Clinical Obesity',
          description: 'Excess adiposity with organ dysfunction or functional limitations',
          color: 'destructive',
          icon: <AlertCircle className="h-4 w-4" />,
          bgClass: 'result-clinical'
        };
      case 'preclinical-obesity':
        return {
          label: 'Preclinical Obesity',
          description: 'Excess adiposity without organ dysfunction',
          color: 'warning',
          icon: <AlertTriangle className="h-4 w-4" />,
          bgClass: 'result-preclinical'
        };
      case 'no-obesity':
        return {
          label: 'No Obesity',
          description: 'Excess adiposity not confirmed',
          color: 'success',
          icon: <CheckCircle className="h-4 w-4" />,
          bgClass: 'result-no-obesity'
        };
      default:
        return {
          label: 'Assessment Pending',
          description: 'Insufficient data for classification',
          color: 'secondary',
          icon: <AlertCircle className="h-4 w-4" />,
          bgClass: ''
        };
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'destructive';
      default: return 'secondary';
    }
  };

  const classificationDetails = getClassificationDetails(result.classification);

  const exportReport = () => {
    // Implementation for PDF export would go here
    console.log("Exporting diagnostic report...");
  };

  return (
    <div className="space-y-4">
      {/* Primary Diagnosis */}
      <Card className="medical-section">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Diagnostic Classification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`diagnostic-result ${classificationDetails.bgClass}`}>
            <div className="flex items-center gap-2 mb-2">
              {classificationDetails.icon}
              <span className="font-semibold text-lg">{classificationDetails.label}</span>
            </div>
            <p className="text-sm opacity-90 mb-3">
              {classificationDetails.description}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Confidence: {result.confidence}
              </Badge>
              {result.criteria.excessAdiposityConfirmed && (
                <Badge variant="outline" className="bg-primary/10">
                  Excess adiposity confirmed
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinical Reasoning */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Clinical Reasoning</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground mb-4">
            {result.reasoning}
          </p>
          
          {result.criteria.organDysfunction.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Organ Dysfunction Identified:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {result.criteria.organDysfunction.map((dysfunction, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-error rounded-full"></div>
                    {dysfunction}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.criteria.functionalLimitations.length > 0 && (
            <div className="space-y-2 mt-4">
              <h4 className="font-medium text-sm">Functional Limitations:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {result.criteria.functionalLimitations.map((limitation, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-warning rounded-full"></div>
                    {limitation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.affectedSystems.length > 0 && (
            <div className="space-y-2 mt-4">
              <h4 className="font-medium text-sm">Affected Systems:</h4>
              <div className="flex flex-wrap gap-1">
                {result.affectedSystems.map((system, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {system}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Clinical Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {result.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Risk Factors */}
      {result.criteria.riskFactors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {result.criteria.riskFactors.map((risk, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-warning rounded-full"></div>
                  {risk}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={exportReport} className="w-full" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Diagnostic Report
          </Button>
          
          <Separator />
          
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Based on Lancet Commission Criteria (2025)</p>
            <p>
              Classification follows evidence-based guidelines for clinical obesity diagnosis. 
              This tool supports clinical decision-making but does not replace clinical judgment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}