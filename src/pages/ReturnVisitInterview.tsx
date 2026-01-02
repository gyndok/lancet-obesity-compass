import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Stethoscope } from 'lucide-react';
import { useInterviewState } from '@/hooks/useInterviewState';
import { returnVisitQuestions } from '@/data/returnVisitQuestions';
import { getUniqueSections } from '@/data/initialVisitQuestions';
import { EncounterTimer } from '@/components/interview/EncounterTimer';
import { ProgressIndicator } from '@/components/interview/ProgressIndicator';
import { QuestionForm } from '@/components/interview/QuestionForm';
import { InterviewSummary } from '@/components/interview/InterviewSummary';

type InterviewPhase = 'questions' | 'summary';

export default function ReturnVisitInterview() {
  const navigate = useNavigate();
  const {
    state,
    setCurrentQuestionIndex,
    setResponse,
    getResponse,
    togglePause,
    setComplete,
    reset,
  } = useInterviewState();

  const [phase, setPhase] = useState<InterviewPhase>('questions');
  const questions = returnVisitQuestions;
  const sections = getUniqueSections(questions);

  useEffect(() => {
    if (state.visitType !== 'return') {
      navigate('/');
    }
  }, [state.visitType, navigate]);

  const handleNext = () => {
    if (state.isPaused) {
      togglePause();
    }

    if (phase === 'questions') {
      if (state.currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(state.currentQuestionIndex + 1);
      } else {
        setComplete(true);
        setPhase('summary');
      }
    }
  };

  const handleBack = () => {
    if (phase === 'summary') {
      setPhase('questions');
    } else if (phase === 'questions' && state.currentQuestionIndex > 0) {
      setCurrentQuestionIndex(state.currentQuestionIndex - 1);
    } else {
      navigate('/');
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the interview? All data will be lost.')) {
      reset();
      navigate('/');
    }
  };

  const handleProceedToAssessment = () => {
    // Get weight from question id 2
    const weightResponse = state.responses.find(r => r.questionId === 2);
    const bodyFatResponse = state.responses.find(r => r.questionId === 20);
    
    const assessmentData = {
      anthropometrics: {
        weight: weightResponse?.answer ? Number(weightResponse.answer) : null,
        bodyFatPercentage: bodyFatResponse?.answer ? Number(bodyFatResponse.answer) : null,
      },
      responses: state.responses,
      visitType: state.visitType,
    };
    localStorage.setItem('interview-assessment-data', JSON.stringify(assessmentData));
    navigate('/assessment');
  };

  const currentQuestion = questions[state.currentQuestionIndex];
  const currentResponse = currentQuestion ? getResponse(currentQuestion.id) : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Stethoscope className="h-6 w-6 text-secondary-light" />
            <div>
              <h1 className="text-lg font-bold">Return Visit Interview</h1>
              <p className="text-xs text-muted-foreground">Follow-up Assessment</p>
            </div>
          </div>
          <EncounterTimer
            startTime={state.startTime}
            elapsedTime={state.elapsedTime}
            isPaused={state.isPaused}
            onTogglePause={togglePause}
            onReset={handleReset}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Progress */}
        {phase === 'questions' && currentQuestion && (
          <div className="mb-6">
            <ProgressIndicator
              currentIndex={state.currentQuestionIndex}
              totalQuestions={questions.length}
              sectionName={currentQuestion.section}
            />
          </div>
        )}

        {/* Questions */}
        {phase === 'questions' && currentQuestion && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <span className="text-xs uppercase tracking-wide text-secondary-light font-medium">
                      {currentQuestion.section}
                    </span>
                    <h2 className="text-xl font-semibold mt-2">
                      {currentQuestion.question}
                    </h2>
                  </div>
                  <QuestionForm
                    question={currentQuestion}
                    currentResponse={currentResponse}
                    onAnswer={(answer) => setResponse(currentQuestion.id, answer)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {state.currentQuestionIndex === 0 ? 'Exit' : 'Back'}
              </Button>
              <Button onClick={handleNext}>
                {state.currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Summary */}
        {phase === 'summary' && (
          <InterviewSummary
            responses={state.responses}
            questions={questions}
            elapsedTime={state.elapsedTime}
            visitType="return"
            onRestart={handleReset}
            onProceedToAssessment={handleProceedToAssessment}
          />
        )}
      </main>
    </div>
  );
}
