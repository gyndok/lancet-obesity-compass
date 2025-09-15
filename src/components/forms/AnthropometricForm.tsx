import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AnthropometricData } from "@/types/clinical";
import { Calculator } from "lucide-react";

interface AnthropometricFormProps {
  data: AnthropometricData;
  onUpdate: (data: AnthropometricData) => void;
}

export function AnthropometricForm({ data, onUpdate }: AnthropometricFormProps) {
  const [formData, setFormData] = useState<AnthropometricData>(data);

  useEffect(() => {
    // Auto-calculate derived metrics
    const updates: Partial<AnthropometricData> = {};
    
    // Calculate BMI (using imperial units: weight in pounds, height in inches)
    if (formData.height && formData.weight) {
      // BMI = (weight in pounds / (height in inches)²) × 703
      const heightInches = formData.height;
      const weightPounds = formData.weight;
      updates.bmi = parseFloat(((weightPounds / (heightInches * heightInches)) * 703).toFixed(1));
    }
    
    // Calculate waist-to-hip ratio
    if (formData.waistCircumference && formData.hipCircumference) {
      updates.waistHipRatio = parseFloat((formData.waistCircumference / formData.hipCircumference).toFixed(2));
    }
    
    // Calculate waist-to-height ratio (convert height from inches to same unit as waist)
    if (formData.waistCircumference && formData.height) {
      // Convert height from inches to inches (waist measurements typically in inches for US)
      updates.waistHeightRatio = parseFloat((formData.waistCircumference / formData.height).toFixed(2));
    }

    if (Object.keys(updates).length > 0) {
      const updatedData = { ...formData, ...updates };
      setFormData(updatedData);
      onUpdate(updatedData);
    }
  }, [formData.height, formData.weight, formData.waistCircumference, formData.hipCircumference]);

  const handleInputChange = (field: keyof AnthropometricData, value: string | number) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  const getBMICategory = (bmi: number) => {
    const isAsian = formData.ethnicity && formData.ethnicity.toLowerCase().includes('asian');
    
    if (bmi < 18.5) return { category: "Underweight", color: "blue" };
    
    if (isAsian) {
      // Asian-specific BMI categories
      if (bmi < 23) return { category: "Normal", color: "green" };
      if (bmi < 25) return { category: "Pre-obesity", color: "yellow" };
      if (bmi < 30) return { category: "Obesity Class I", color: "orange" };
      if (bmi < 35) return { category: "Obesity Class II", color: "red" };
      return { category: "Obesity Class III", color: "red" };
    } else {
      // Standard BMI categories
      if (bmi < 25) return { category: "Normal", color: "green" };
      if (bmi < 30) return { category: "Overweight", color: "yellow" };
      if (bmi < 35) return { category: "Obesity Class I", color: "orange" };
      if (bmi < 40) return { category: "Obesity Class II", color: "red" };
      return { category: "Obesity Class III", color: "red" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Measurements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Basic Measurements
          </CardTitle>
          <CardDescription>
            Height, weight, and basic demographic information
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age">Age (years)</Label>
            <Input
              id="age"
              type="number"
              value={formData.age || ""}
              onChange={(e) => handleInputChange("age", parseInt(e.target.value) || undefined)}
              placeholder="Enter age"
              className="medical-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sex">Sex</Label>
            <Select value={formData.sex} onValueChange={(value) => handleInputChange("sex", value as "male" | "female")}>
              <SelectTrigger className="medical-input">
                <SelectValue placeholder="Select sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ethnicity">Ethnicity</Label>
            <Select value={formData.ethnicity} onValueChange={(value) => handleInputChange("ethnicity", value)}>
              <SelectTrigger className="medical-input">
                <SelectValue placeholder="Select ethnicity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="caucasian">Caucasian</SelectItem>
                <SelectItem value="african-american">African American</SelectItem>
                <SelectItem value="hispanic">Hispanic/Latino</SelectItem>
                <SelectItem value="asian">Asian</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">Height (inches)</Label>
            <Input
              id="height"
              type="number"
              step="0.5"
              value={formData.height || ""}
              onChange={(e) => handleInputChange("height", parseFloat(e.target.value) || undefined)}
              placeholder="Enter height in inches"
              className="medical-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight (pounds)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={formData.weight || ""}
              onChange={(e) => handleInputChange("weight", parseFloat(e.target.value) || undefined)}
              placeholder="Enter weight in pounds"
              className="medical-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bmi">BMI (kg/m²)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="bmi"
                type="number"
                step="0.1"
                value={formData.bmi || ""}
                onChange={(e) => handleInputChange("bmi", parseFloat(e.target.value) || undefined)}
                placeholder="Calculated automatically"
                className="medical-input"
                readOnly={!!(formData.height && formData.weight)}
              />
              {formData.bmi && (
                <Badge variant="outline" className={`
                  ${getBMICategory(formData.bmi).color === 'green' ? 'bg-success-light text-success' : ''}
                  ${getBMICategory(formData.bmi).color === 'yellow' ? 'bg-warning-light text-warning' : ''}
                  ${getBMICategory(formData.bmi).color === 'red' ? 'bg-error-light text-error' : ''}
                `}>
                  {getBMICategory(formData.bmi).category}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anthropometric Measurements */}
      <Card>
        <CardHeader>
          <CardTitle>Anthropometric Measurements</CardTitle>
          <CardDescription>
            Waist and hip measurements for adiposity assessment (per Lancet Commission criteria)
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="waist">Waist Circumference (inches)</Label>
            <Input
              id="waist"
              type="number"
              step="0.1"
              value={formData.waistCircumference || ""}
              onChange={(e) => handleInputChange("waistCircumference", parseFloat(e.target.value) || undefined)}
              placeholder="Measure at narrowest point"
              className="medical-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hip">Hip Circumference (inches)</Label>
            <Input
              id="hip"
              type="number"
              step="0.1"
              value={formData.hipCircumference || ""}
              onChange={(e) => handleInputChange("hipCircumference", parseFloat(e.target.value) || undefined)}
              placeholder="Measure at widest point"
              className="medical-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body-fat">Body Fat Percentage (%)</Label>
            <Input
              id="body-fat"
              type="number"
              step="0.1"
              value={formData.bodyFatPercentage || ""}
              onChange={(e) => handleInputChange("bodyFatPercentage", parseFloat(e.target.value) || undefined)}
              placeholder="If available (DEXA/BodPod)"
              className="medical-input"
            />
          </div>

          {formData.waistHipRatio && (
            <div className="space-y-2">
              <Label>Waist-to-Hip Ratio</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={formData.waistHipRatio.toFixed(2)}
                  readOnly
                  className="medical-input bg-muted"
                />
                <Badge variant="outline">
                  {formData.waistHipRatio > (formData.sex === 'male' ? 0.9 : 0.85) ? 'High Risk' : 'Normal'}
                </Badge>
              </div>
            </div>
          )}

          {formData.waistHeightRatio && (
            <div className="space-y-2">
              <Label>Waist-to-Height Ratio</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={formData.waistHeightRatio.toFixed(2)}
                  readOnly
                  className="medical-input bg-muted"
                />
                <Badge variant="outline">
                  {formData.waistHeightRatio >= 0.5 ? 'High Risk' : 'Normal'}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}