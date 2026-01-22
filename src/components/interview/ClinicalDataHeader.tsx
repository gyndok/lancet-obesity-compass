import { Card } from '@/components/ui/card';
import { User, Scale, Target, Calendar, Drumstick } from 'lucide-react';

interface ClinicalDataHeaderProps {
  age: number | null;
  sex: string | null;
  weight: number | null;
  heightInches: number | null;
  goalWeight: number | null;
}

export function ClinicalDataHeader({
  age,
  sex,
  weight,
  heightInches,
  goalWeight,
}: ClinicalDataHeaderProps) {
  // Calculate BMI: weight (lbs) / height (in)² × 703
  const bmi = weight && heightInches 
    ? ((weight / (heightInches * heightInches)) * 703).toFixed(1)
    : null;

  // Calculate goal weight for BMI 25: BMI 25 = weight / height² × 703
  // So weight = 25 × height² / 703
  const goalWeightBMI25 = heightInches 
    ? Math.round((25 * heightInches * heightInches) / 703)
    : null;

  // Calculate daily protein intake: 1.2g per kg body weight
  // Convert lbs to kg: weight / 2.205
  const proteinIntake = weight 
    ? Math.round((weight / 2.205) * 1.2)
    : null;

  // Calculate weeks to goal (assuming 1-2 lbs/week loss, use 1.5 avg)
  const weeksToGoal = weight && goalWeightBMI25 && weight > goalWeightBMI25
    ? Math.round((weight - goalWeightBMI25) / 1.5)
    : null;

  const hasData = age || sex || weight || bmi;

  if (!hasData) return null;

  return (
    <Card className="mb-4 bg-muted/30 border-muted">
      <div className="px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        {(age || sex) && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {age && `${age}yo`}
              {age && sex && ' '}
              {sex && sex.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        {weight && (
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-muted-foreground" />
            <span>
              <span className="font-medium">{weight} lbs</span>
              {bmi && (
                <span className="text-muted-foreground ml-1">
                  (BMI {bmi})
                </span>
              )}
            </span>
          </div>
        )}

        {goalWeightBMI25 && (
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span>
              <span className="text-muted-foreground">Goal @BMI 25:</span>
              <span className="font-medium ml-1">{goalWeightBMI25} lbs</span>
            </span>
          </div>
        )}

        {proteinIntake && (
          <div className="flex items-center gap-2">
            <Drumstick className="h-4 w-4 text-muted-foreground" />
            <span>
              <span className="text-muted-foreground">Protein:</span>
              <span className="font-medium ml-1">{proteinIntake}g/day</span>
            </span>
          </div>
        )}

        {goalWeight && (
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span>
              <span className="text-muted-foreground">Patient goal:</span>
              <span className="font-medium ml-1">{goalWeight} lbs</span>
            </span>
          </div>
        )}

        {weeksToGoal && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              <span className="text-muted-foreground">Est.</span>
              <span className="font-medium ml-1">~{weeksToGoal} weeks</span>
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
