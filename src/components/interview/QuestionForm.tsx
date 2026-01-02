import { useState, useEffect } from 'react';
import { Question, Response } from '@/types/interview';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface QuestionFormProps {
  question: Question;
  currentResponse?: Response;
  onAnswer: (answer: string | string[] | number) => void;
}

export function QuestionForm({ question, currentResponse, onAnswer }: QuestionFormProps) {
  const [value, setValue] = useState<string | string[] | number>(
    currentResponse?.answer ?? (question.type === 'checkbox' ? [] : '')
  );

  useEffect(() => {
    setValue(currentResponse?.answer ?? (question.type === 'checkbox' ? [] : ''));
  }, [question.id, currentResponse]);

  const handleChange = (newValue: string | string[] | number) => {
    setValue(newValue);
    onAnswer(newValue);
  };

  switch (question.type) {
    case 'text':
      return (
        <Input
          value={value as string}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Enter your answer..."
          className="text-lg"
          autoFocus
        />
      );

    case 'textarea':
      return (
        <Textarea
          value={value as string}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Enter your answer..."
          rows={4}
          className="text-lg"
          autoFocus
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          value={value as string}
          onChange={(e) => handleChange(e.target.value ? Number(e.target.value) : '')}
          placeholder="Enter a number..."
          className="text-lg max-w-[200px]"
          autoFocus
        />
      );

    case 'radio':
      return (
        <RadioGroup
          value={value as string}
          onValueChange={handleChange}
          className="space-y-3"
        >
          {question.options?.map((option) => (
            <div key={option} className="flex items-center space-x-3">
              <RadioGroupItem value={option} id={`radio-${option}`} />
              <Label htmlFor={`radio-${option}`} className="text-base cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );

    case 'checkbox':
      return (
        <div className="space-y-3">
          {question.options?.map((option) => {
            const isChecked = Array.isArray(value) && value.includes(option);
            return (
              <div key={option} className="flex items-center space-x-3">
                <Checkbox
                  id={`checkbox-${option}`}
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    const currentArray = Array.isArray(value) ? value : [];
                    const newValue = checked
                      ? [...currentArray, option]
                      : currentArray.filter((v) => v !== option);
                    handleChange(newValue);
                  }}
                />
                <Label htmlFor={`checkbox-${option}`} className="text-base cursor-pointer">
                  {option}
                </Label>
              </div>
            );
          })}
        </div>
      );

    case 'dropdown':
      return (
        <Select value={value as string} onValueChange={handleChange}>
          <SelectTrigger className="w-full max-w-[300px] text-lg">
            <SelectValue placeholder="Select an option..." />
          </SelectTrigger>
          <SelectContent>
            {question.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'date':
      const dateValue = value ? new Date(value as string) : undefined;
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[280px] justify-start text-left font-normal text-lg',
                !dateValue && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateValue ? format(dateValue, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={(date) => handleChange(date ? date.toISOString() : '')}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      );

    default:
      return null;
  }
}
