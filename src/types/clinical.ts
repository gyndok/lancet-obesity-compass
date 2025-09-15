export interface AnthropometricData {
  height?: number;
  weight?: number;
  bmi?: number;
  waistCircumference?: number;
  hipCircumference?: number;
  waistHipRatio?: number;
  waistHeightRatio?: number;
  bodyFatPercentage?: number;
  age?: number;
  sex?: 'male' | 'female';
  ethnicity?: string;
}

export interface ClinicalData {
  // Symptoms (Table 2 from Lancet Commission)
  breathlessness?: boolean;
  fatigue?: boolean;
  chronicPain?: boolean;
  urinaryIncontinence?: boolean;
  sleepDisorders?: boolean;
  reflux?: boolean;
  osteoarthritis?: boolean;
  
  // Past Medical History
  type2Diabetes?: boolean;
  hypertension?: boolean;
  pcos?: boolean;
  sleepApnea?: boolean;
  nafld?: boolean;
  cardiovascularDisease?: boolean;
  mentalHealth?: boolean;
}

export interface LaboratoryData {
  // Glucose metabolism
  fastingGlucose?: number;
  hba1c?: number;
  
  // Lipid profile
  totalCholesterol?: number;
  ldl?: number;
  hdl?: number;
  triglycerides?: number;
  
  // Liver function
  alt?: number;
  ast?: number;
  fibrosis?: boolean;
  
  // Renal function
  egfr?: number;
  microalbuminuria?: boolean;
  
  // Other
  crp?: number;
}

export interface FunctionalData {
  // Activities of Daily Living limitations
  mobilityLimitations?: boolean;
  bathingDifficulty?: boolean;
  dressingDifficulty?: boolean;
  toiletingDifficulty?: boolean;
  continenceDifficulty?: boolean;
  eatingDifficulty?: boolean;
  
  // Quality of life measures
  qualityOfLifeScore?: number;
  physicalLimitations?: boolean;
  psychosocialImpact?: boolean;
}

export interface PatientData {
  anthropometrics: AnthropometricData;
  clinical: ClinicalData;
  laboratory: LaboratoryData;
  functional: FunctionalData;
}

export interface DiagnosticCriteria {
  excessAdiposityConfirmed: boolean;
  organDysfunction: string[];
  functionalLimitations: string[];
  riskFactors: string[];
}

export interface DiagnosticResult {
  classification: 'no-obesity' | 'preclinical-obesity' | 'clinical-obesity';
  confidence: 'high' | 'medium' | 'low';
  criteria: DiagnosticCriteria;
  recommendations: string[];
  reasoning: string;
  affectedSystems: string[];
}

export interface DiagnosticReport {
  patientInfo: {
    assessmentDate: string;
    clinician?: string;
  };
  result: DiagnosticResult;
  supportingData: PatientData;
  summary: string;
}
