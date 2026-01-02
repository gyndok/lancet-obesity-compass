import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stethoscope, FileText, Calculator, User, ExternalLink, RotateCcw, ArrowLeft } from "lucide-react";
import { AnthropometricForm } from "@/components/forms/AnthropometricForm";
import { ClinicalForm } from "@/components/forms/ClinicalForm";
import { LaboratoryForm } from "@/components/forms/LaboratoryForm";
import { FunctionalForm } from "@/components/forms/FunctionalForm";
import { DiagnosticResults } from "@/components/results/DiagnosticResults";
import { DiagnosticEngine } from "@/lib/diagnostic-engine";
import { PatientData, DiagnosticResult } from "@/types/clinical";

const Index = () => {
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState<PatientData>({
    anthropometrics: {},
    clinical: {},
    laboratory: {},
    functional: {}
  });
  
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [activeTab, setActiveTab] = useState("anthropometric");

  // Load interview data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('interview-assessment-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        let updatedPatientData = { ...patientData };

        if (parsed.anthropometrics) {
          updatedPatientData.anthropometrics = {
            ...patientData.anthropometrics,
            height: parsed.anthropometrics.height,
            weight: parsed.anthropometrics.weight,
            bodyFatPercentage: parsed.anthropometrics.bodyFatPercentage,
            age: parsed.anthropometrics.age,
            sex: parsed.anthropometrics.sex,
            ethnicity: parsed.anthropometrics.ethnicity,
          };
        }

        if (parsed.functional) {
          updatedPatientData.functional = {
            ...patientData.functional,
            ...parsed.functional,
          };
        }

        if (parsed.clinical) {
          updatedPatientData.clinical = {
            ...patientData.clinical,
            ...parsed.clinical,
          };
        }

        setPatientData(updatedPatientData);
        const result = DiagnosticEngine.evaluate(updatedPatientData);
        setDiagnosticResult(result);
        localStorage.removeItem('interview-assessment-data');
      } catch (e) {
        console.error('Failed to parse interview data', e);
      }
    }
  }, []);

  const handleDataUpdate = (section: keyof PatientData, data: any) => {
    const updatedData = {
      ...patientData,
      [section]: data
    };
    setPatientData(updatedData);
    
    // Run diagnostic engine if we have sufficient data
    const result = DiagnosticEngine.evaluate(updatedData);
    setDiagnosticResult(result);
  };

  const isDataComplete = (section: keyof PatientData) => {
    const data = patientData[section];
    return data && Object.keys(data).length > 0;
  };

  const handleClearAll = () => {
    setPatientData({
      anthropometrics: {},
      clinical: {},
      laboratory: {},
      functional: {}
    });
    setDiagnosticResult(null);
    setActiveTab("anthropometric");
  };

  const handleStartOver = () => {
    // Clear all data
    handleClearAll();
    // Clear interview data from localStorage
    localStorage.removeItem('weight-clinic-interview');
    localStorage.removeItem('interview-assessment-data');
    // Navigate to landing page
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b border-card-border shadow-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-primary rounded-lg">
                <Stethoscope className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Clinical Obesity Diagnostic Tool
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground">
                    Based on 2025 Lancet Commission Criteria
                  </p>
                  <a 
                    href="https://www.thelancet.com/journals/landia/article/PIIS2213-8587(24)00316-4/fulltext"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-hover transition-colors"
                    title="View full text article"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartOver}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Start Over
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Clear All
              </Button>
              <Badge variant="outline">
                Evidence-Based
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Data Entry */}
          <div className="lg:col-span-2">
            <Card className="medical-section">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Patient Assessment
                </CardTitle>
                <CardDescription>
                  Complete the assessment forms to receive a diagnostic evaluation based on Lancet Commission criteria.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="anthropometric" className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      <span className="hidden sm:inline">Anthropometric</span>
                      <span className="sm:hidden">Anthro</span>
                      {isDataComplete("anthropometrics") && (
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="clinical" className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4" />
                      <span className="hidden sm:inline">Clinical</span>
                      {isDataComplete("clinical") && (
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="laboratory" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="hidden sm:inline">Laboratory</span>
                      <span className="sm:hidden">Labs</span>
                      {isDataComplete("laboratory") && (
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="functional" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">Functional</span>
                      <span className="sm:hidden">Func</span>
                      {isDataComplete("functional") && (
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="anthropometric">
                    <AnthropometricForm 
                      data={patientData.anthropometrics} 
                      onUpdate={(data) => handleDataUpdate("anthropometrics", data)}
                    />
                  </TabsContent>

                  <TabsContent value="clinical">
                    <ClinicalForm 
                      data={patientData.clinical} 
                      onUpdate={(data) => handleDataUpdate("clinical", data)}
                    />
                  </TabsContent>

                  <TabsContent value="laboratory">
                    <LaboratoryForm 
                      data={patientData.laboratory} 
                      onUpdate={(data) => handleDataUpdate("laboratory", data)}
                    />
                  </TabsContent>

                  <TabsContent value="functional">
                    <FunctionalForm 
                      data={patientData.functional} 
                      onUpdate={(data) => handleDataUpdate("functional", data)}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Diagnostic Results */}
          <div className="lg:col-span-1">
            <DiagnosticResults result={diagnosticResult} patientData={patientData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;