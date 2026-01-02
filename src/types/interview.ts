export interface Question {
  id: number;
  section: string;
  question: string;
  type: 'text' | 'textarea' | 'number' | 'radio' | 'checkbox' | 'dropdown' | 'date';
  options?: string[];
}

export interface Response {
  questionId: number;
  answer: string | string[] | number;
}

export interface InterviewState {
  visitType: 'initial' | 'return' | null;
  currentQuestionIndex: number;
  responses: Response[];
  startTime: number | null;
  elapsedTime: number;
  isPaused: boolean;
  bmiData: {
    height: number | null;
    weight: number | null;
    heightInFeet: number | null;
    heightInInches: number | null;
    useFeetInches: boolean;
  };
  importedData: string;
  isComplete: boolean;
}

export const initialInterviewState: InterviewState = {
  visitType: null,
  currentQuestionIndex: 0,
  responses: [],
  startTime: null,
  elapsedTime: 0,
  isPaused: false,
  bmiData: {
    height: null,
    weight: null,
    heightInFeet: null,
    heightInInches: null,
    useFeetInches: true,
  },
  importedData: '',
  isComplete: false,
};
