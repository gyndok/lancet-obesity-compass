import { PatientData, DiagnosticResult, DiagnosticCriteria } from "@/types/clinical";
import { isAsianEthnicity } from "./ethnicity";

export class DiagnosticEngine {
  static evaluate(data: PatientData): DiagnosticResult | null {
    // Need minimum data to make assessment
    if (!this.hasMinimumData(data)) {
      return null;
    }

    const criteria = this.assessCriteria(data);
    const classification = this.classify(criteria);
    const confidence = this.assessConfidence(data, criteria);
    const recommendations = this.generateRecommendations(classification, criteria);
    const reasoning = this.generateReasoning(classification, criteria);
    const affectedSystems = this.identifyAffectedSystems(data);

    return {
      classification,
      confidence,
      criteria,
      recommendations,
      reasoning,
      affectedSystems
    };
  }

  private static hasMinimumData(data: PatientData): boolean {
    // Require basic anthropometric data at minimum
    const anthro = data.anthropometrics;
    return !!(anthro.height && anthro.weight) || !!anthro.bmi;
  }

  private static assessCriteria(data: PatientData): DiagnosticCriteria {
    const excessAdiposityConfirmed = this.confirmExcessAdiposity(data.anthropometrics);
    const organDysfunction = this.assessOrganDysfunction(data);
    const functionalLimitations = this.assessFunctionalLimitations(data.functional);
    const riskFactors = this.identifyRiskFactors(data);

    return {
      excessAdiposityConfirmed,
      organDysfunction,
      functionalLimitations,
      riskFactors
    };
  }

  private static confirmExcessAdiposity(anthro: any): boolean {
    // Calculate BMI if not provided
    let bmi = anthro.bmi;
    if (!bmi && anthro.height && anthro.weight) {
      // BMI calculation for imperial units (height in inches, weight in pounds)
      const heightInches = anthro.height;
      const weightPounds = anthro.weight;
      bmi = (weightPounds / (heightInches * heightInches)) * 703;
    }

    // Very high body fat percentage (>45%) - excess adiposity confirmed regardless of BMI
    if (anthro.bodyFatPercentage && anthro.bodyFatPercentage > 45) {
      return true;
    }

    // Ethnicity-specific BMI thresholds
    const isAsian = isAsianEthnicity(anthro.ethnicity);
    const bmiPreObesityThreshold = isAsian ? 23 : 25; // Pre-obesity/Overweight
    const bmiObesityThreshold = isAsian ? 27 : 30; // Class I Obesity
    const bmiNormalThreshold = isAsian ? 22.9 : 25; // Normal BMI upper limit

    // Very high BMI - excess adiposity assumed per Lancet Commission
    if (bmi && bmi > 40) {
      return true;
    }

    // BMI in obesity range for ethnicity-specific threshold
    if (bmi && bmi >= bmiObesityThreshold) {
      return true;
    }

    // BMI in overweight range confirms excess adiposity
    if (bmi && bmi >= bmiPreObesityThreshold) {
      return true;
    }

    // For clearly normal BMI, require multiple additional risk factors
    if (bmi && bmi < bmiNormalThreshold) {
      let additionalRiskFactors = 0;

      // Check waist circumference (ethnicity-specific thresholds)
      if (anthro.waistCircumference) {
        let thresholdInches;
        if (isAsian) {
          // Asian thresholds: 90cm for men, 80cm for women (convert to inches)
          thresholdInches = anthro.sex === 'male' ? 35.4 : 31.5; // 90cm = 35.4", 80cm = 31.5"
        } else {
          // Standard thresholds: 40" for men, 35" for women
          thresholdInches = anthro.sex === 'male' ? 40 : 35;
        }
        if (anthro.waistCircumference >= thresholdInches) {
          additionalRiskFactors++;
        }
      }

      // Check waist-to-height ratio
      if (anthro.waistHeightRatio && anthro.waistHeightRatio >= 0.5) {
        additionalRiskFactors++;
      }

      // Check waist-to-hip ratio
      if (anthro.waistHipRatio) {
        const threshold = anthro.sex === 'male' ? 0.9 : 0.85;
        if (anthro.waistHipRatio >= threshold) {
          additionalRiskFactors++;
        }
      }

      // Body fat percentage (age-based reference ranges)
      if (anthro.bodyFatPercentage && anthro.age && anthro.age >= 18) {
        const normalRange = this.getBodyFatNormalRange(anthro.age, anthro.sex);
        if (normalRange && anthro.bodyFatPercentage > normalRange.upper) {
          additionalRiskFactors++;
        }
      }

      // Require at least 2 additional risk factors for normal BMI to be considered excess adiposity
      return additionalRiskFactors >= 2;
    }

    return false;
  }

  private static assessOrganDysfunction(data: PatientData): string[] {
    const dysfunction: string[] = [];
    const { clinical, laboratory } = data;

    // Metabolic dysfunction
    if (clinical.type2Diabetes || (laboratory.hba1c && laboratory.hba1c >= 6.5) || 
        (laboratory.fastingGlucose && laboratory.fastingGlucose >= 126)) {
      dysfunction.push("Metabolic: Type 2 diabetes");
    }

    // Cardiovascular dysfunction
    if (clinical.hypertension || clinical.cardiovascularDisease) {
      dysfunction.push("Cardiovascular: Hypertension/CVD");
    }

    // Hepatic dysfunction
    if (clinical.nafld || laboratory.fibrosis || 
        (laboratory.alt && laboratory.alt > 40) || (laboratory.ast && laboratory.ast > 40)) {
      dysfunction.push("Hepatic: NAFLD/elevated enzymes");
    }

    // Renal dysfunction
    if ((laboratory.egfr && laboratory.egfr < 60) || laboratory.microalbuminuria) {
      dysfunction.push("Renal: Decreased eGFR/albuminuria");
    }

    // Respiratory dysfunction
    if (clinical.sleepApnea || clinical.breathlessness) {
      dysfunction.push("Respiratory: Sleep apnea/dyspnea");
    }

    // Reproductive dysfunction
    if (clinical.pcos) {
      dysfunction.push("Reproductive: PCOS");
    }

    // Musculoskeletal dysfunction
    if (clinical.osteoarthritis) {
      dysfunction.push("Musculoskeletal: Osteoarthritis");
    }

    return dysfunction;
  }

  private static assessFunctionalLimitations(functional: any): string[] {
    const limitations: string[] = [];

    if (functional.mobilityLimitations) limitations.push("Mobility limitations");
    if (functional.bathingDifficulty) limitations.push("Bathing difficulty");
    if (functional.dressingDifficulty) limitations.push("Dressing difficulty");
    if (functional.toiletingDifficulty) limitations.push("Toileting difficulty");
    if (functional.continenceDifficulty) limitations.push("Continence difficulty");
    if (functional.eatingDifficulty) limitations.push("Eating difficulty");

    return limitations;
  }

  private static identifyRiskFactors(data: PatientData): string[] {
    const risks: string[] = [];
    const { clinical, laboratory } = data;

    if (clinical.fatigue) risks.push("Chronic fatigue");
    if (clinical.chronicPain) risks.push("Chronic pain");
    if (clinical.urinaryIncontinence) risks.push("Urinary incontinence");
    if (clinical.sleepDisorders) risks.push("Sleep disorders");
    if (clinical.reflux) risks.push("GERD");
    if (clinical.mentalHealth) risks.push("Mental health concerns");

    // Laboratory risk factors
    if (laboratory.triglycerides && laboratory.triglycerides >= 150) {
      risks.push("Elevated triglycerides");
    }
    if (laboratory.hdl && laboratory.hdl < 40) {
      risks.push("Low HDL cholesterol");
    }
    if (laboratory.crp && laboratory.crp > 3) {
      risks.push("Elevated CRP (inflammation)");
    }

    return risks;
  }

  private static classify(criteria: DiagnosticCriteria): 'no-obesity' | 'preclinical-obesity' | 'clinical-obesity' {
    // No excess adiposity confirmed
    if (!criteria.excessAdiposityConfirmed) {
      return 'no-obesity';
    }

    // Excess adiposity with organ dysfunction or functional limitations = clinical obesity
    if (criteria.organDysfunction.length > 0 || criteria.functionalLimitations.length > 0) {
      return 'clinical-obesity';
    }

    // Excess adiposity without organ dysfunction = preclinical obesity
    return 'preclinical-obesity';
  }

  private static assessConfidence(data: PatientData, criteria: DiagnosticCriteria): 'high' | 'medium' | 'low' {
    let score = 0;

    // Anthropometric data completeness
    const anthro = data.anthropometrics;
    if (anthro.height && anthro.weight) score++;
    if (anthro.waistCircumference) score++;
    if (anthro.bodyFatPercentage) score++;

    // Clinical data completeness
    const clinicalFields = Object.values(data.clinical).filter(v => v !== undefined).length;
    if (clinicalFields >= 3) score++;

    // Laboratory data completeness
    const labFields = Object.values(data.laboratory).filter(v => v !== undefined).length;
    if (labFields >= 3) score++;

    // Functional data completeness
    const funcFields = Object.values(data.functional).filter(v => v !== undefined).length;
    if (funcFields >= 2) score++;

    if (score >= 5) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }

  private static generateRecommendations(classification: string, criteria: DiagnosticCriteria): string[] {
    const recommendations: string[] = [];

    switch (classification) {
      case 'clinical-obesity':
        recommendations.push("Initiate comprehensive obesity management plan");
        recommendations.push("Consider pharmacotherapy or surgical evaluation");
        recommendations.push("Address identified organ dysfunction");
        recommendations.push("Monitor for complications");
        break;

      case 'preclinical-obesity':
        recommendations.push("Implement lifestyle intervention program");
        recommendations.push("Regular monitoring for disease progression");
        recommendations.push("Preventive counseling for identified risk factors");
        recommendations.push("Consider weight management referral");
        break;

      case 'no-obesity':
        recommendations.push("Continue healthy lifestyle practices");
        recommendations.push("Routine health maintenance");
        if (criteria.riskFactors.length > 0) {
          recommendations.push("Address identified risk factors");
        }
        break;
    }

    return recommendations;
  }

  private static generateReasoning(classification: string, criteria: DiagnosticCriteria): string {
    let reasoning = "";

    if (!criteria.excessAdiposityConfirmed) {
      reasoning = "Excess adiposity not confirmed based on available anthropometric measurements.";
    } else if (classification === 'clinical-obesity') {
      reasoning = `Excess adiposity confirmed with evidence of organ dysfunction (${criteria.organDysfunction.length} systems affected)`;
      if (criteria.functionalLimitations.length > 0) {
        reasoning += ` and functional limitations (${criteria.functionalLimitations.length} domains affected)`;
      }
      reasoning += ".";
    } else if (classification === 'preclinical-obesity') {
      reasoning = "Excess adiposity confirmed but without evidence of organ dysfunction or significant functional limitations.";
    }

    return reasoning;
  }

  private static identifyAffectedSystems(data: PatientData): string[] {
    const systems: Set<string> = new Set();

    if (data.clinical.type2Diabetes || (data.laboratory.hba1c && data.laboratory.hba1c >= 6.5)) {
      systems.add("Endocrine/Metabolic");
    }
    if (data.clinical.hypertension || data.clinical.cardiovascularDisease) {
      systems.add("Cardiovascular");
    }
    if (data.clinical.nafld || data.laboratory.fibrosis) {
      systems.add("Hepatic");
    }
    if (data.clinical.sleepApnea) {
      systems.add("Respiratory");
    }
    if (data.clinical.pcos) {
      systems.add("Reproductive");
    }
    if (data.clinical.osteoarthritis) {
      systems.add("Musculoskeletal");
    }

    return Array.from(systems);
  }

  private static getBodyFatNormalRange(age: number, sex: string): { lower: number; upper: number } | null {
    if (age < 18) return null;
    
    const ranges = {
      male: {
        '18-29': { lower: 12, upper: 19 },
        '30-39': { lower: 14, upper: 22 },
        '40-49': { lower: 16, upper: 24 },
        '50-59': { lower: 18, upper: 26 },
        '60+': { lower: 20, upper: 28 }
      },
      female: {
        '18-29': { lower: 24, upper: 32 },
        '30-39': { lower: 25, upper: 34 },
        '40-49': { lower: 27, upper: 36 },
        '50-59': { lower: 29, upper: 38 },
        '60+': { lower: 30, upper: 40 }
      }
    };

    const genderRanges = sex === 'male' ? ranges.male : ranges.female;
    
    if (age >= 18 && age <= 29) return genderRanges['18-29'];
    if (age >= 30 && age <= 39) return genderRanges['30-39'];
    if (age >= 40 && age <= 49) return genderRanges['40-49'];
    if (age >= 50 && age <= 59) return genderRanges['50-59'];
    if (age >= 60) return genderRanges['60+'];
    
    return null;
  }
}