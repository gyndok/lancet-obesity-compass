import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calculator, Target, TrendingDown } from 'lucide-react';

interface BMICalculatorProps {
  height: number | null;
  weight: number | null;
  heightInFeet: number | null;
  heightInInches: number | null;
  useFeetInches: boolean;
  onUpdate: (data: {
    height?: number | null;
    weight?: number | null;
    heightInFeet?: number | null;
    heightInInches?: number | null;
    useFeetInches?: boolean;
  }) => void;
}

export function BMICalculator({
  height,
  weight,
  heightInFeet,
  heightInInches,
  useFeetInches,
  onUpdate,
}: BMICalculatorProps) {
  const calculateTotalInches = () => {
    if (useFeetInches) {
      return ((heightInFeet || 0) * 12) + (heightInInches || 0);
    }
    return height || 0;
  };

  const totalInches = calculateTotalInches();
  const bmi = totalInches && weight ? (weight / (totalInches * totalInches)) * 703 : null;
  
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'bg-blue-500' };
    if (bmi < 25) return { label: 'Normal', color: 'bg-success' };
    if (bmi < 30) return { label: 'Overweight', color: 'bg-warning' };
    if (bmi < 35) return { label: 'Obese I', color: 'bg-orange-500' };
    if (bmi < 40) return { label: 'Obese II', color: 'bg-error' };
    return { label: 'Obese III', color: 'bg-red-700' };
  };

  const targetWeightForBMI25 = totalInches ? (25 * totalInches * totalInches) / 703 : null;
  const weightToLose = weight && targetWeightForBMI25 && weight > targetWeightForBMI25 
    ? weight - targetWeightForBMI25 
    : null;
  const weeksToGoal = weightToLose ? Math.ceil(weightToLose / 1.5) : null; // ~1.5 lbs/week avg

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          BMI Calculator
        </CardTitle>
        <CardDescription>
          Enter patient height and weight to calculate BMI and weight loss targets
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Height Input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Height Input Method</Label>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${!useFeetInches ? 'font-medium' : 'text-muted-foreground'}`}>
                Total inches
              </span>
              <Switch
                checked={useFeetInches}
                onCheckedChange={(checked) => onUpdate({ useFeetInches: checked })}
              />
              <span className={`text-sm ${useFeetInches ? 'font-medium' : 'text-muted-foreground'}`}>
                Feet & inches
              </span>
            </div>
          </div>

          {useFeetInches ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feet">Feet</Label>
                <Input
                  id="feet"
                  type="number"
                  value={heightInFeet ?? ''}
                  onChange={(e) => onUpdate({ heightInFeet: e.target.value ? Number(e.target.value) : null })}
                  placeholder="5"
                  min={0}
                  max={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inches">Inches</Label>
                <Input
                  id="inches"
                  type="number"
                  value={heightInInches ?? ''}
                  onChange={(e) => onUpdate({ heightInInches: e.target.value ? Number(e.target.value) : null })}
                  placeholder="10"
                  min={0}
                  max={11}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="totalHeight">Total Height (inches)</Label>
              <Input
                id="totalHeight"
                type="number"
                value={height ?? ''}
                onChange={(e) => onUpdate({ height: e.target.value ? Number(e.target.value) : null })}
                placeholder="70"
              />
            </div>
          )}
        </div>

        {/* Weight Input */}
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (lbs)</Label>
          <Input
            id="weight"
            type="number"
            value={weight ?? ''}
            onChange={(e) => onUpdate({ weight: e.target.value ? Number(e.target.value) : null })}
            placeholder="180"
          />
        </div>

        {/* Results */}
        {bmi && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Calculated BMI</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{bmi.toFixed(1)}</span>
                <Badge className={getBMICategory(bmi).color}>
                  {getBMICategory(bmi).label}
                </Badge>
              </div>
            </div>

            {targetWeightForBMI25 && weight && weight > targetWeightForBMI25 && (
              <>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Target weight (BMI 25)
                  </span>
                  <span className="font-medium">{targetWeightForBMI25.toFixed(0)} lbs</span>
                </div>

                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    Weight to lose
                  </span>
                  <span className="font-medium">{weightToLose?.toFixed(0)} lbs</span>
                </div>

                {weeksToGoal && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Estimated weeks to goal (1.5 lbs/week)</span>
                    <span className="font-medium">~{weeksToGoal} weeks</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
