import { describe, expect, it } from "bun:test";

import { generateReportContent } from "./DiagnosticResults";
import type { DiagnosticResult, PatientData } from "../../types/clinical";

const basePatientData: PatientData = {
  anthropometrics: {},
  clinical: {},
  laboratory: {},
  functional: {},
};

const createBaseResult = (): DiagnosticResult => ({
  classification: "clinical-obesity",
  confidence: "high",
  criteria: {
    excessAdiposityConfirmed: true,
    organDysfunction: [],
    functionalLimitations: [],
    riskFactors: [],
  },
  recommendations: ["Continue monitoring"],
  reasoning: "Clinical reasoning details",
  affectedSystems: [],
});

describe("generateReportContent", () => {
  it("escapes HTML in diagnostic result fields", () => {
    const malicious = '<img src=x onerror=alert("xss")>';

    const result: DiagnosticResult = {
      classification: "clinical-obesity",
      confidence: "high",
      criteria: {
        excessAdiposityConfirmed: true,
        organDysfunction: [malicious],
        functionalLimitations: [malicious],
        riskFactors: [malicious],
      },
      recommendations: [malicious],
      reasoning: malicious,
      affectedSystems: [malicious],
    };

    const content = generateReportContent({
      result,
      patientData: basePatientData,
      currentDate: "January 1, 2025",
    });

    expect(content).toContain("&lt;img src=x onerror=alert(&quot;xss&quot;)&gt;");
    expect(content).not.toContain(malicious);
  });

  it("escapes HTML in patient data summary values", () => {
    const maliciousValue = "<span>malicious</span>";

    const patientData: PatientData = {
      anthropometrics: {
        height: maliciousValue as unknown as number,
        waistHipRatio: maliciousValue as unknown as number,
      },
      clinical: {},
      laboratory: {
        fastingGlucose: maliciousValue as unknown as number,
        hba1c: maliciousValue as unknown as number,
        triglycerides: maliciousValue as unknown as number,
        hdl: maliciousValue as unknown as number,
      },
      functional: {},
    };

    const content = generateReportContent({
      result: createBaseResult(),
      patientData,
      currentDate: "January 2, 2025",
    });

    expect(content).toContain("Height: &lt;span&gt;malicious&lt;/span&gt; inches");
    expect(content).toContain("Fasting Glucose: &lt;span&gt;malicious&lt;/span&gt; mg/dL");
    expect(content).not.toContain(maliciousValue);
  });
});
