import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FunctionalData } from "@/types/clinical";
import { Users, Heart, Brain } from "lucide-react";

interface FunctionalFormProps {
  data: FunctionalData;
  onUpdate: (data: FunctionalData) => void;
}

export function FunctionalForm({ data, onUpdate }: FunctionalFormProps) {
  const [formData, setFormData] = useState<FunctionalData>(data);

  // Sync form data when prop changes (for Clear All functionality)
  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleCheckboxChange = (field: keyof FunctionalData, checked: boolean) => {
    const updatedData = { ...formData, [field]: checked };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  const handleInputChange = (field: keyof FunctionalData, value: number | undefined) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  const adlCategories = [
    {
      title: "Activities of Daily Living (ADL) Limitations",
      description: "Basic self-care activities affected by excess weight",
      icon: <Users className="h-4 w-4" />,
      items: [
        { 
          key: "mobilityLimitations", 
          label: "Mobility Limitations", 
          description: "Difficulty walking, climbing stairs, or moving around" 
        },
        { 
          key: "bathingDifficulty", 
          label: "Bathing Difficulty", 
          description: "Trouble getting in/out of tub, reaching body parts while bathing" 
        },
        { 
          key: "dressingDifficulty", 
          label: "Dressing Difficulty", 
          description: "Problems putting on clothes, shoes, or reaching clothing items" 
        },
        { 
          key: "toiletingDifficulty", 
          label: "Toileting Difficulty", 
          description: "Challenges with toilet transfers or personal hygiene" 
        },
        { 
          key: "continenceDifficulty", 
          label: "Continence Issues", 
          description: "Loss of bladder or bowel control related to mobility/positioning" 
        },
        { 
          key: "eatingDifficulty", 
          label: "Eating Difficulty", 
          description: "Problems with food preparation or self-feeding" 
        }
      ]
    }
  ];

  const qualityOfLifeCategories = [
    {
      title: "Quality of Life Impact",
      description: "Broader functional and psychosocial impacts",
      icon: <Heart className="h-4 w-4" />,
      items: [
        { 
          key: "physicalLimitations", 
          label: "Physical Limitations", 
          description: "Reduced physical capacity affecting work, recreation, or daily tasks" 
        },
        { 
          key: "psychosocialImpact", 
          label: "Psychosocial Impact", 
          description: "Social isolation, relationship problems, or reduced quality of life" 
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground mb-4">
        Functional limitations are key criteria for diagnosing clinical obesity per the Lancet Commission. 
        Select any areas where the patient experiences significant limitations related to excess adiposity.
      </div>

      {/* ADL Limitations */}
      {adlCategories.map((category) => (
        <Card key={category.title}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {category.icon}
              {category.title}
            </CardTitle>
            <CardDescription>
              {category.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {category.items.map((item) => (
              <div key={item.key} className="flex items-start space-x-3">
                <Checkbox
                  id={item.key}
                  checked={!!(formData[item.key as keyof FunctionalData])}
                  onCheckedChange={(checked) => handleCheckboxChange(item.key as keyof FunctionalData, checked as boolean)}
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

      {/* Quality of Life */}
      {qualityOfLifeCategories.map((category) => (
        <Card key={category.title}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {category.icon}
              {category.title}
            </CardTitle>
            <CardDescription>
              {category.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {category.items.map((item) => (
              <div key={item.key} className="flex items-start space-x-3">
                <Checkbox
                  id={item.key}
                  checked={!!(formData[item.key as keyof FunctionalData])}
                  onCheckedChange={(checked) => handleCheckboxChange(item.key as keyof FunctionalData, checked as boolean)}
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

            {/* Quality of Life Score Input */}
            {category.title.includes("Quality of Life") && (
              <div className="space-y-2 pt-4 border-t border-border">
                <Label htmlFor="qol-score">Quality of Life Score (0-100)</Label>
                <Input
                  id="qol-score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.qualityOfLifeScore || ""}
                  onChange={(e) => handleInputChange("qualityOfLifeScore", parseFloat(e.target.value) || undefined)}
                  placeholder="Optional: 0 (worst) to 100 (best)"
                  className="medical-input"
                />
                <p className="text-xs text-muted-foreground">
                  If available, enter standardized quality of life score (e.g., SF-36, EQ-5D)
                  <br />
                  <a 
                    href="https://www.rand.org/content/dam/rand/www/external/health/surveys_tools/mos/mos_core_36item_survey.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-hover underline"
                  >
                    Download SF-36 Survey
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Summary */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Functional Assessment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Clinical Significance:</strong> The presence of functional limitations in Activities of Daily Living (ADL) 
              is a key criterion for diagnosing clinical obesity according to the Lancet Commission framework.
            </p>
            <p>
              Any marked limitation in basic ADL domains (mobility, bathing, dressing, toileting, continence, eating) 
              suggests clinical obesity when combined with confirmed excess adiposity.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}