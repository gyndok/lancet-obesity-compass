import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ClinicalData } from "@/types/clinical";
import { Heart, Brain, Stethoscope, Activity } from "lucide-react";

interface ClinicalFormProps {
  data: ClinicalData;
  onUpdate: (data: ClinicalData) => void;
}

export function ClinicalForm({ data, onUpdate }: ClinicalFormProps) {
  const [formData, setFormData] = useState<ClinicalData>(data);

  const handleCheckboxChange = (field: keyof ClinicalData, checked: boolean) => {
    const updatedData = { ...formData, [field]: checked };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  const symptomCategories = [
    {
      title: "Respiratory & Exercise Symptoms",
      icon: <Activity className="h-4 w-4" />,
      items: [
        { key: "breathlessness", label: "Breathlessness/Dyspnea", description: "Shortness of breath with minimal exertion" },
        { key: "fatigue", label: "Chronic Fatigue", description: "Persistent tiredness affecting daily activities" }
      ]
    },
    {
      title: "Physical Symptoms",
      icon: <Stethoscope className="h-4 w-4" />,
      items: [
        { key: "chronicPain", label: "Chronic Pain", description: "Persistent pain affecting joints, back, or other areas" },
        { key: "urinaryIncontinence", label: "Urinary Incontinence", description: "Loss of bladder control" },
        { key: "reflux", label: "Gastroesophageal Reflux", description: "GERD or frequent heartburn" }
      ]
    },
    {
      title: "Sleep & Mental Health",
      icon: <Brain className="h-4 w-4" />,
      items: [
        { key: "sleepDisorders", label: "Sleep Disorders", description: "Sleep disturbances beyond sleep apnea" },
        { key: "mentalHealth", label: "Mental Health Issues", description: "Depression, anxiety, or other mental health concerns" }
      ]
    }
  ];

  const medicalHistoryCategories = [
    {
      title: "Metabolic & Endocrine Conditions",
      icon: <Heart className="h-4 w-4" />,
      items: [
        { key: "type2Diabetes", label: "Type 2 Diabetes", description: "Diagnosed diabetes mellitus type 2" },
        { key: "pcos", label: "Polycystic Ovary Syndrome", description: "PCOS diagnosis" }
      ]
    },
    {
      title: "Cardiovascular Conditions",
      icon: <Heart className="h-4 w-4" />,
      items: [
        { key: "hypertension", label: "Hypertension", description: "High blood pressure requiring treatment" },
        { key: "cardiovascularDisease", label: "Cardiovascular Disease", description: "Heart disease, stroke, or other CVD" }
      ]
    },
    {
      title: "Other Conditions",
      icon: <Stethoscope className="h-4 w-4" />,
      items: [
        { key: "sleepApnea", label: "Sleep Apnea", description: "Obstructive or central sleep apnea" },
        { key: "nafld", label: "NAFLD/NASH", description: "Non-alcoholic fatty liver disease" },
        { key: "osteoarthritis", label: "Osteoarthritis", description: "Degenerative joint disease" }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground mb-4">
        Select symptoms and conditions present in this patient. These correspond to criteria outlined in the Lancet Commission for clinical obesity diagnosis.
      </div>

      {/* Symptoms */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Current Symptoms</h3>
        {symptomCategories.map((category) => (
          <Card key={category.title}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                {category.icon}
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {category.items.map((item) => (
                <div key={item.key} className="flex items-start space-x-3">
                  <Checkbox
                    id={item.key}
                    checked={formData[item.key as keyof ClinicalData] || false}
                    onCheckedChange={(checked) => handleCheckboxChange(item.key as keyof ClinicalData, checked as boolean)}
                    className="mt-1"
                  />
                  <div className="space-y-1 leading-none">
                    <Label
                      htmlFor={item.key}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {item.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Medical History */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Past Medical History</h3>
        {medicalHistoryCategories.map((category) => (
          <Card key={category.title}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                {category.icon}
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {category.items.map((item) => (
                <div key={item.key} className="flex items-start space-x-3">
                  <Checkbox
                    id={item.key}
                    checked={formData[item.key as keyof ClinicalData] || false}
                    onCheckedChange={(checked) => handleCheckboxChange(item.key as keyof ClinicalData, checked as boolean)}
                    className="mt-1"
                  />
                  <div className="space-y-1 leading-none">
                    <Label
                      htmlFor={item.key}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {item.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}