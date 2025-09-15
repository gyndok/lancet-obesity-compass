import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { escapeHtml } from "@/lib/utils";
import { DiagnosticResult, PatientData } from "@/types/clinical";
import { FileText, Download, AlertCircle, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";

interface DiagnosticResultsProps {
  result: DiagnosticResult | null;
  patientData: PatientData;
}

interface ClassificationDetails {
  label: string;
  description: string;
  color: "destructive" | "warning" | "success" | "secondary";
  icon: JSX.Element;
  bgClass: string;
}

const getClassificationDetails = (classification: string): ClassificationDetails => {
  switch (classification) {
    case "clinical-obesity":
      return {
        label: "Clinical Obesity",
        description: "Excess adiposity with organ dysfunction or functional limitations",
        color: "destructive",
        icon: <AlertCircle className="h-4 w-4" />,
        bgClass: "result-clinical",
      };
    case "preclinical-obesity":
      return {
        label: "Preclinical Obesity",
        description: "Excess adiposity without organ dysfunction",
        color: "warning",
        icon: <AlertTriangle className="h-4 w-4" />,
        bgClass: "result-preclinical",
      };
    case "no-obesity":
      return {
        label: "No Obesity",
        description: "Excess adiposity not confirmed",
        color: "success",
        icon: <CheckCircle className="h-4 w-4" />,
        bgClass: "result-no-obesity",
      };
    default:
      return {
        label: "Assessment Pending",
        description: "Insufficient data for classification",
        color: "secondary",
        icon: <AlertCircle className="h-4 w-4" />,
        bgClass: "",
      };
  }
};

const renderListItems = (items: string[]) =>
  items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

const generatePatientDataSummary = (patientData: PatientData) => {
  const anthro = patientData.anthropometrics;
  const clinical = patientData.clinical;
  const lab = patientData.laboratory;

  return `
    <div class="section">
        <h3>Patient Data Summary</h3>

        ${Object.keys(anthro).length > 0 ? `
        <h4>Anthropometric Data</h4>
        <ul>
            ${anthro.height ? `<li>Height: ${escapeHtml(anthro.height)} inches</li>` : ""}
            ${anthro.weight ? `<li>Weight: ${escapeHtml(anthro.weight)} pounds</li>` : ""}
            ${anthro.bmi ? `<li>BMI: ${escapeHtml(anthro.bmi)} kg/m²</li>` : ""}
            ${anthro.waistCircumference ? `<li>Waist Circumference: ${escapeHtml(anthro.waistCircumference)} inches</li>` : ""}
            ${anthro.waistHipRatio ? `<li>Waist-to-Hip Ratio: ${escapeHtml(anthro.waistHipRatio)}</li>` : ""}
        </ul>
        ` : ""}

        ${Object.keys(clinical).some((key) => clinical[key as keyof typeof clinical]) ? `
        <h4>Clinical Findings</h4>
        <ul>
            ${clinical.type2Diabetes ? "<li>Type 2 Diabetes</li>" : ""}
            ${clinical.hypertension ? "<li>Hypertension</li>" : ""}
            ${clinical.sleepApnea ? "<li>Sleep Apnea</li>" : ""}
            ${clinical.nafld ? "<li>NAFLD</li>" : ""}
            ${clinical.breathlessness ? "<li>Breathlessness</li>" : ""}
            ${clinical.fatigue ? "<li>Chronic Fatigue</li>" : ""}
        </ul>
        ` : ""}

        ${Object.keys(lab).some((key) => lab[key as keyof typeof lab] !== undefined) ? `
        <h4>Laboratory Values</h4>
        <ul>
            ${lab.fastingGlucose ? `<li>Fasting Glucose: ${escapeHtml(lab.fastingGlucose)} mg/dL</li>` : ""}
            ${lab.hba1c ? `<li>HbA1c: ${escapeHtml(lab.hba1c)}%</li>` : ""}
            ${lab.triglycerides ? `<li>Triglycerides: ${escapeHtml(lab.triglycerides)} mg/dL</li>` : ""}
            ${lab.hdl ? `<li>HDL: ${escapeHtml(lab.hdl)} mg/dL</li>` : ""}
        </ul>
        ` : ""}
    </div>`;
};

interface GenerateReportContentParams {
  result: DiagnosticResult | null;
  patientData: PatientData;
  currentDate?: string;
}

export const generateReportContent = ({
  result,
  patientData,
  currentDate = new Date().toLocaleDateString(),
}: GenerateReportContentParams) => {
  if (!result) {
    return "";
  }

  const classificationDetails = getClassificationDetails(result.classification);
  const classificationLabel = escapeHtml(classificationDetails.label);
  const classificationDescription = escapeHtml(classificationDetails.description);
  const diagnosticConfidence = escapeHtml(result.confidence);
  const reasoning = escapeHtml(result.reasoning);
  const organDysfunctionItems = renderListItems(result.criteria.organDysfunction);
  const functionalLimitationsItems = renderListItems(result.criteria.functionalLimitations);
  const affectedSystemsItems = renderListItems(result.affectedSystems);
  const recommendationItems = renderListItems(result.recommendations);
  const riskFactorItems = renderListItems(result.criteria.riskFactors);
  const sanitizedDate = escapeHtml(currentDate);
  const patientSummary = generatePatientDataSummary(patientData);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clinical Obesity Diagnostic Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .classification {
            background: #f8fafc;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 20px 0;
        }
        .section {
            margin: 25px 0;
        }
        .section h3 {
            color: #1e40af;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
        }
        ul {
            margin: 10px 0;
        }
        li {
            margin: 5px 0;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 0.9em;
            color: #6b7280;
        }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Clinical Obesity Diagnostic Report</h1>
        <p><strong>Assessment Date:</strong> ${sanitizedDate}</p>
        <p><em>Based on 2025 Lancet Commission Criteria</em></p>
    </div>

    <div class="classification">
        <h2>Diagnostic Classification</h2>
        <p><strong>${classificationLabel}</strong></p>
        <p>${classificationDescription}</p>
        <p><strong>Diagnostic Confidence:</strong> ${diagnosticConfidence}</p>
        ${result.criteria.excessAdiposityConfirmed ? "<p><strong>✓ Excess adiposity confirmed</strong></p>" : "<p><strong>✗ Excess adiposity not confirmed</strong></p>"}
    </div>

    <div class="section">
        <h3>Clinical Reasoning</h3>
        <p>${reasoning}</p>
    </div>

    ${result.criteria.organDysfunction.length > 0 ? `
    <div class="section">
        <h3>Organ Dysfunction Identified</h3>
        <ul>
            ${organDysfunctionItems}
        </ul>
    </div>
    ` : ""}

    ${result.criteria.functionalLimitations.length > 0 ? `
    <div class="section">
        <h3>Functional Limitations</h3>
        <ul>
            ${functionalLimitationsItems}
        </ul>
    </div>
    ` : ""}

    ${result.affectedSystems.length > 0 ? `
    <div class="section">
        <h3>Affected Systems</h3>
        <ul>
            ${affectedSystemsItems}
        </ul>
    </div>
    ` : ""}

    <div class="section">
        <h3>Clinical Recommendations</h3>
        <ul>
            ${recommendationItems}
        </ul>
    </div>

    ${result.criteria.riskFactors.length > 0 ? `
    <div class="section">
        <h3>Risk Factors</h3>
        <ul>
            ${riskFactorItems}
        </ul>
    </div>
    ` : ""}

    ${patientSummary}

    <div class="footer">
        <p><strong>Important:</strong> This diagnostic tool supports clinical decision-making based on evidence-based Lancet Commission criteria but does not replace clinical judgment. Please correlate findings with complete clinical assessment.</p>
        <p><strong>Reference:</strong> Rubino F, et al. Definition and diagnostic criteria of clinical obesity. Lancet Diabetes Endocrinol. 2025.</p>
    </div>
</body>
</html>`;
};

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
    if (!result) return;

    const reportContent = generateReportContent({ result, patientData });
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `obesity-diagnostic-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            Download Report (HTML)
          </Button>
          
          <Button onClick={() => window.print()} className="w-full" variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Print Report
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