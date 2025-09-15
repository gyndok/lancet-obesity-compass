import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { LaboratoryData } from "@/types/clinical";
import { FlaskConical, TrendingUp, Activity, Droplets } from "lucide-react";

interface LaboratoryFormProps {
  data: LaboratoryData;
  onUpdate: (data: LaboratoryData) => void;
}

export function LaboratoryForm({ data, onUpdate }: LaboratoryFormProps) {
  const [formData, setFormData] = useState<LaboratoryData>(data);

  const handleInputChange = (field: keyof LaboratoryData, value: number | boolean | undefined) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  const getGlucoseStatus = (value: number) => {
    if (value >= 126) return { status: "Diabetic", color: "error" };
    if (value >= 100) return { status: "Prediabetic", color: "warning" };
    return { status: "Normal", color: "success" };
  };

  const getHbA1cStatus = (value: number) => {
    if (value >= 6.5) return { status: "Diabetic", color: "error" };
    if (value >= 5.7) return { status: "Prediabetic", color: "warning" };
    return { status: "Normal", color: "success" };
  };

  const getLipidStatus = (type: string, value: number) => {
    switch (type) {
      case 'triglycerides':
        if (value >= 150) return { status: "High", color: "error" };
        return { status: "Normal", color: "success" };
      case 'hdl':
        if (value < 40) return { status: "Low", color: "error" };
        if (value >= 60) return { status: "High", color: "success" };
        return { status: "Normal", color: "success" };
      case 'ldl':
        if (value >= 160) return { status: "High", color: "error" };
        if (value >= 130) return { status: "Borderline", color: "warning" };
        return { status: "Normal", color: "success" };
      default:
        return { status: "Normal", color: "success" };
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground mb-4">
        Enter available laboratory values. Normal ranges are provided for reference, with abnormal values flagged automatically.
      </div>

      {/* Glucose Metabolism */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Glucose Metabolism
          </CardTitle>
          <CardDescription>
            Fasting glucose and HbA1c for diabetes assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fasting-glucose">Fasting Glucose (mg/dL)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="fasting-glucose"
                type="number"
                value={formData.fastingGlucose || ""}
                onChange={(e) => handleInputChange("fastingGlucose", parseFloat(e.target.value) || undefined)}
                placeholder="Normal: 70-99"
                className="medical-input"
              />
              {formData.fastingGlucose && (
                <Badge variant="outline" className={`
                  ${getGlucoseStatus(formData.fastingGlucose).color === 'success' ? 'bg-success-light text-success' : ''}
                  ${getGlucoseStatus(formData.fastingGlucose).color === 'warning' ? 'bg-warning-light text-warning' : ''}
                  ${getGlucoseStatus(formData.fastingGlucose).color === 'error' ? 'bg-error-light text-error' : ''}
                `}>
                  {getGlucoseStatus(formData.fastingGlucose).status}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hba1c">HbA1c (%)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="hba1c"
                type="number"
                step="0.1"
                value={formData.hba1c || ""}
                onChange={(e) => handleInputChange("hba1c", parseFloat(e.target.value) || undefined)}
                placeholder="Normal: <5.7"
                className="medical-input"
              />
              {formData.hba1c && (
                <Badge variant="outline" className={`
                  ${getHbA1cStatus(formData.hba1c).color === 'success' ? 'bg-success-light text-success' : ''}
                  ${getHbA1cStatus(formData.hba1c).color === 'warning' ? 'bg-warning-light text-warning' : ''}
                  ${getHbA1cStatus(formData.hba1c).color === 'error' ? 'bg-error-light text-error' : ''}
                `}>
                  {getHbA1cStatus(formData.hba1c).status}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lipid Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            Lipid Profile
          </CardTitle>
          <CardDescription>
            Cholesterol and triglycerides for cardiovascular risk assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="total-chol">Total Cholesterol (mg/dL)</Label>
            <Input
              id="total-chol"
              type="number"
              value={formData.totalCholesterol || ""}
              onChange={(e) => handleInputChange("totalCholesterol", parseFloat(e.target.value) || undefined)}
              placeholder="Normal: <200"
              className="medical-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ldl">LDL Cholesterol (mg/dL)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="ldl"
                type="number"
                value={formData.ldl || ""}
                onChange={(e) => handleInputChange("ldl", parseFloat(e.target.value) || undefined)}
                placeholder="Normal: <100"
                className="medical-input"
              />
              {formData.ldl && (
                <Badge variant="outline" className={`
                  ${getLipidStatus('ldl', formData.ldl).color === 'success' ? 'bg-success-light text-success' : ''}
                  ${getLipidStatus('ldl', formData.ldl).color === 'warning' ? 'bg-warning-light text-warning' : ''}
                  ${getLipidStatus('ldl', formData.ldl).color === 'error' ? 'bg-error-light text-error' : ''}
                `}>
                  {getLipidStatus('ldl', formData.ldl).status}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hdl">HDL Cholesterol (mg/dL)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="hdl"
                type="number"
                value={formData.hdl || ""}
                onChange={(e) => handleInputChange("hdl", parseFloat(e.target.value) || undefined)}
                placeholder="Normal: ≥40 (M), ≥50 (F)"
                className="medical-input"
              />
              {formData.hdl && (
                <Badge variant="outline" className={`
                  ${getLipidStatus('hdl', formData.hdl).color === 'success' ? 'bg-success-light text-success' : ''}
                  ${getLipidStatus('hdl', formData.hdl).color === 'error' ? 'bg-error-light text-error' : ''}
                `}>
                  {getLipidStatus('hdl', formData.hdl).status}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="triglycerides">Triglycerides (mg/dL)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="triglycerides"
                type="number"
                value={formData.triglycerides || ""}
                onChange={(e) => handleInputChange("triglycerides", parseFloat(e.target.value) || undefined)}
                placeholder="Normal: <150"
                className="medical-input"
              />
              {formData.triglycerides && (
                <Badge variant="outline" className={`
                  ${getLipidStatus('triglycerides', formData.triglycerides).color === 'success' ? 'bg-success-light text-success' : ''}
                  ${getLipidStatus('triglycerides', formData.triglycerides).color === 'error' ? 'bg-error-light text-error' : ''}
                `}>
                  {getLipidStatus('triglycerides', formData.triglycerides).status}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liver Function */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Liver & Renal Function
          </CardTitle>
          <CardDescription>
            Liver enzymes and kidney function markers
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="alt">ALT (U/L)</Label>
            <Input
              id="alt"
              type="number"
              value={formData.alt || ""}
              onChange={(e) => handleInputChange("alt", parseFloat(e.target.value) || undefined)}
              placeholder="Normal: <40"
              className="medical-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ast">AST (U/L)</Label>
            <Input
              id="ast"
              type="number"
              value={formData.ast || ""}
              onChange={(e) => handleInputChange("ast", parseFloat(e.target.value) || undefined)}
              placeholder="Normal: <40"
              className="medical-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="egfr">eGFR (mL/min/1.73m²)</Label>
            <Input
              id="egfr"
              type="number"
              value={formData.egfr || ""}
              onChange={(e) => handleInputChange("egfr", parseFloat(e.target.value) || undefined)}
              placeholder="Normal: ≥60"
              className="medical-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="crp">CRP (mg/L)</Label>
            <Input
              id="crp"
              type="number"
              step="0.1"
              value={formData.crp || ""}
              onChange={(e) => handleInputChange("crp", parseFloat(e.target.value) || undefined)}
              placeholder="Normal: <3"
              className="medical-input"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="fibrosis"
              checked={formData.fibrosis || false}
              onCheckedChange={(checked) => handleInputChange("fibrosis", checked as boolean)}
            />
            <Label htmlFor="fibrosis" className="text-sm font-medium leading-none">
              Hepatic fibrosis present
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="microalbuminuria"
              checked={formData.microalbuminuria || false}
              onCheckedChange={(checked) => handleInputChange("microalbuminuria", checked as boolean)}
            />
            <Label htmlFor="microalbuminuria" className="text-sm font-medium leading-none">
              Microalbuminuria present
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}