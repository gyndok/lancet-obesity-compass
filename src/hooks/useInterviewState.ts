import { useState, useEffect, useCallback } from 'react';
import { InterviewState, Response, initialInterviewState } from '@/types/interview';

const STORAGE_KEY = 'weight-clinic-interview';

export function useInterviewState() {
  const [state, setState] = useState<InterviewState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialInterviewState;
      }
    }
    return initialInterviewState;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setVisitType = useCallback((type: 'initial' | 'return') => {
    setState(prev => ({
      ...prev,
      visitType: type,
      startTime: Date.now(),
      currentQuestionIndex: 0,
      responses: [],
      isComplete: false,
    }));
  }, []);

  const setCurrentQuestionIndex = useCallback((index: number) => {
    setState(prev => ({ ...prev, currentQuestionIndex: index }));
  }, []);

  const setResponse = useCallback((questionId: number, answer: string | string[] | number) => {
    setState(prev => {
      const existingIndex = prev.responses.findIndex(r => r.questionId === questionId);
      const newResponses = [...prev.responses];
      
      if (existingIndex >= 0) {
        newResponses[existingIndex] = { questionId, answer };
      } else {
        newResponses.push({ questionId, answer });
      }
      
      return { ...prev, responses: newResponses };
    });
  }, []);

  const getResponse = useCallback((questionId: number): Response | undefined => {
    return state.responses.find(r => r.questionId === questionId);
  }, [state.responses]);

  const setBmiData = useCallback((data: Partial<InterviewState['bmiData']>) => {
    setState(prev => ({
      ...prev,
      bmiData: { ...prev.bmiData, ...data }
    }));
  }, []);

  const setImportedData = useCallback((data: string) => {
    setState(prev => ({ ...prev, importedData: data }));
  }, []);

  const togglePause = useCallback(() => {
    setState(prev => {
      if (prev.isPaused) {
        // Resuming - update start time to account for pause
        return {
          ...prev,
          isPaused: false,
          startTime: Date.now() - prev.elapsedTime * 1000,
        };
      } else {
        // Pausing - save elapsed time
        const elapsed = prev.startTime 
          ? Math.floor((Date.now() - prev.startTime) / 1000)
          : prev.elapsedTime;
        return {
          ...prev,
          isPaused: true,
          elapsedTime: elapsed,
        };
      }
    });
  }, []);

  const updateElapsedTime = useCallback(() => {
    setState(prev => {
      if (prev.isPaused || !prev.startTime) return prev;
      return {
        ...prev,
        elapsedTime: Math.floor((Date.now() - prev.startTime) / 1000),
      };
    });
  }, []);

  const setComplete = useCallback((complete: boolean) => {
    setState(prev => ({ ...prev, isComplete: complete }));
  }, []);

  const reset = useCallback(() => {
    setState(initialInterviewState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    state,
    setVisitType,
    setCurrentQuestionIndex,
    setResponse,
    getResponse,
    setBmiData,
    setImportedData,
    togglePause,
    updateElapsedTime,
    setComplete,
    reset,
  };
}
