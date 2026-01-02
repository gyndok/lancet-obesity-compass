import { Progress } from '@/components/ui/progress';

interface ProgressIndicatorProps {
  currentIndex: number;
  totalQuestions: number;
  sectionName: string;
}

export function ProgressIndicator({
  currentIndex,
  totalQuestions,
  sectionName,
}: ProgressIndicatorProps) {
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground font-medium">{sectionName}</span>
        <span className="text-muted-foreground">
          {currentIndex + 1} of {totalQuestions}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
