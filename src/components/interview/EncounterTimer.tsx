import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Play, RotateCcw } from 'lucide-react';

interface EncounterTimerProps {
  startTime: number | null;
  elapsedTime: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onReset: () => void;
}

export function EncounterTimer({
  startTime,
  elapsedTime,
  isPaused,
  onTogglePause,
  onReset,
}: EncounterTimerProps) {
  const [displayTime, setDisplayTime] = useState(elapsedTime);

  useEffect(() => {
    if (isPaused || !startTime) {
      setDisplayTime(elapsedTime);
      return;
    }

    const interval = setInterval(() => {
      setDisplayTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isPaused, elapsedTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm bg-muted px-3 py-1.5 rounded-md min-w-[70px] text-center">
        {formatTime(displayTime)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={onTogglePause}
        className="h-8 w-8"
        title={isPaused ? 'Resume' : 'Pause'}
      >
        {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onReset}
        className="h-8 w-8"
        title="Reset"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}
