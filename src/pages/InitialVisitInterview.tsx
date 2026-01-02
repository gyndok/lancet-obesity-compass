import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Stethoscope } from 'lucide-react';
import { useInterviewState } from '@/hooks/useInterviewState';
import { initialVisitQuestions, getUniqueSections } from '@/data/initialVisitQuestions';
import { EncounterTimer } from '@/components/interview/EncounterTimer';
import { ProgressIndicator } from '@/components/interview/ProgressIndicator';
import { QuestionForm } from '@/components/interview/QuestionForm';
import { BMICalculator } from '@/components/interview/BMICalculator';
import { DataImport } from '@/components/interview/DataImport';
import { InterviewSummary } from '@/components/interview/InterviewSummary';

type InterviewPhase = 'import' | 'bmi' | 'questions' | 'summary';

export default function InitialVisitInterview() {
  const navigate = useNavigate();
  const {
    state,
    setCurrentQuestionIndex,
    setResponse,
    getResponse,
    setBmiData,
    setImportedData,
    togglePause,
    setComplete,
    reset,
  } = useInterviewState();

  const [phase, setPhase] = useState<InterviewPhase>('import');
  const questions = initialVisitQuestions;
  const sections = getUniqueSections(questions);

  useEffect(() => {
    if (state.visitType !== 'initial') {
      navigate('/');
    }
  }, [state.visitType, navigate]);

  // Auto-resume timer on Next if paused
  const handleNext = () => {
    if (state.isPaused) {
      togglePause();
    }

    if (phase === 'import') {
      setPhase('bmi');
    } else if (phase === 'bmi') {
      setPhase('questions');
    } else if (phase === 'questions') {
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
    } else if (phase === 'questions') {
      if (state.currentQuestionIndex > 0) {
        setCurrentQuestionIndex(state.currentQuestionIndex - 1);
      } else {
        setPhase('bmi');
      }
    } else if (phase === 'bmi') {
      setPhase('import');
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the interview? All data will be lost.')) {
      reset();
      navigate('/');
    }
  };

  const handleProceedToAssessment = () => {
    // Extract demographic data from responses
    const ageResponse = state.responses.find(r => r.questionId === 1);
    const sexResponse = state.responses.find(r => r.questionId === 2);
    const ethnicityResponse = state.responses.find(r => r.questionId === 53);

    // Map ethnicity to form value
    const ethnicityMap: Record<string, string> = {
      'Caucasian': 'caucasian',
      'African American': 'african-american',
      'Hispanic/Latino': 'hispanic',
      'Asian': 'asian',
      'Other': 'other',
    };

    // Calculate height in inches
    const heightInches = state.bmiData.useFeetInches
      ? ((state.bmiData.heightInFeet || 0) * 12) + (state.bmiData.heightInInches || 0)
      : state.bmiData.height;

    // Calculate body fat % using Deurenberg formula
    // Body fat % = (1.20 × BMI) + (0.23 × age) − (10.8 × sex) − 5.4
    // BMI = weight (kg) / height (m²), sex = 1 for male, 0 for female
    let bodyFatPercentage: number | undefined;
    const age = ageResponse?.answer ? Number(ageResponse.answer) : undefined;
    const sexValue = sexResponse?.answer ? (sexResponse.answer as string).toLowerCase() : undefined;
    
    if (heightInches && state.bmiData.weight && age && sexValue) {
      // Convert imperial to metric
      const heightMeters = heightInches * 0.0254;
      const weightKg = state.bmiData.weight * 0.453592;
      const bmi = weightKg / (heightMeters * heightMeters);
      const sexMultiplier = sexValue === 'male' ? 1 : 0;
      
      bodyFatPercentage = parseFloat(
        ((1.20 * bmi) + (0.23 * age) - (10.8 * sexMultiplier) - 5.4).toFixed(1)
      );
    }

    // Extract ADL limitations from responses (question id 54)
    const adlResponse = state.responses.find(r => r.questionId === 54);
    const adlAnswers = Array.isArray(adlResponse?.answer) ? adlResponse.answer : [];
    
    // Map ADL answers to functional data fields
    const adlMapping: Record<string, keyof import('@/types/clinical').FunctionalData> = {
      'Mobility Limitations': 'mobilityLimitations',
      'Bathing Difficulty': 'bathingDifficulty',
      'Dressing Difficulty': 'dressingDifficulty',
      'Toileting Difficulty': 'toiletingDifficulty',
      'Continence Issues': 'continenceDifficulty',
      'Eating Difficulty': 'eatingDifficulty',
    };

    const functionalData: Record<string, boolean> = {};
    adlAnswers.forEach(answer => {
      const field = adlMapping[answer];
      if (field) {
        functionalData[field] = true;
      }
    });

    // Extract clinical symptoms and medical history from responses
    const symptomMappings = [
      { questionId: 55, mappings: { 'Breathlessness/Dyspnea': 'breathlessness', 'Chronic Fatigue': 'fatigue' } },
      { questionId: 56, mappings: { 'Chronic Pain': 'chronicPain', 'Urinary Incontinence': 'urinaryIncontinence', 'Gastroesophageal Reflux (GERD)': 'reflux' } },
      { questionId: 57, mappings: { 'Sleep Disorders': 'sleepDisorders', 'Mental Health Issues (Depression/Anxiety)': 'mentalHealth' } },
      { questionId: 58, mappings: { 'Type 2 Diabetes': 'type2Diabetes', 'Polycystic Ovary Syndrome (PCOS)': 'pcos' } },
      { questionId: 59, mappings: { 'Hypertension': 'hypertension', 'Cardiovascular Disease': 'cardiovascularDisease' } },
      { questionId: 60, mappings: { 'Sleep Apnea': 'sleepApnea', 'NAFLD/NASH': 'nafld', 'Osteoarthritis': 'osteoarthritis' } },
    ];

    const clinicalData: Record<string, boolean> = {};
    symptomMappings.forEach(({ questionId, mappings }) => {
      const response = state.responses.find(r => r.questionId === questionId);
      const answers = Array.isArray(response?.answer) ? response.answer : [];
      answers.forEach(answer => {
        const field = mappings[answer as keyof typeof mappings];
        if (field) {
          clinicalData[field] = true;
        }
      });
    });

    // Store interview data for assessment
    const assessmentData = {
      anthropometrics: {
        height: heightInches,
        weight: state.bmiData.weight,
        age: age,
        sex: sexValue as 'male' | 'female' | undefined,
        ethnicity: ethnicityResponse?.answer ? ethnicityMap[ethnicityResponse.answer as string] : undefined,
        bodyFatPercentage: bodyFatPercentage,
      },
      functional: functionalData,
      clinical: clinicalData,
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
            <Stethoscope className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-bold">Initial Visit Interview</h1>
              <p className="text-xs text-muted-foreground">Weight Management Intake</p>
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

        {/* Content based on phase */}
        {phase === 'import' && (
          <DataImport
            value={state.importedData}
            onChange={setImportedData}
            onSkip={handleNext}
            onContinue={handleNext}
          />
        )}

        {phase === 'bmi' && (
          <div className="space-y-6">
            <BMICalculator
              height={state.bmiData.height}
              weight={state.bmiData.weight}
              heightInFeet={state.bmiData.heightInFeet}
              heightInInches={state.bmiData.heightInInches}
              useFeetInches={state.bmiData.useFeetInches}
              onUpdate={setBmiData}
            />
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleNext}>
                Continue to Questions
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {phase === 'questions' && currentQuestion && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <span className="text-xs uppercase tracking-wide text-primary font-medium">
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
                Back
              </Button>
              <Button onClick={handleNext}>
                {state.currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {phase === 'summary' && (
          <InterviewSummary
            responses={state.responses}
            questions={questions}
            elapsedTime={state.elapsedTime}
            visitType="initial"
            bmiData={state.bmiData}
            onRestart={handleReset}
            onProceedToAssessment={handleProceedToAssessment}
          />
        )}
      </main>
    </div>
  );
}
