import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Stethoscope, Moon, Sun } from 'lucide-react';
import { useInterviewState } from '@/hooks/useInterviewState';
import { useEffect, useState } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const { setVisitType, reset, state } = useInterviewState();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const handleInitialVisit = () => {
    reset();
    setVisitType('initial');
    navigate('/interview/initial');
  };

  const handleReturnVisit = () => {
    reset();
    setVisitType('return');
    navigate('/interview/return');
  };

  const handleDirectAssessment = () => {
    navigate('/assessment');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Stethoscope className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Weight Clinic</h1>
              <p className="text-sm text-muted-foreground">Patient Encounter System</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">
              Patient Encounter Portal
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select the type of visit to begin the structured patient interview. 
              Data will automatically populate the clinical obesity assessment.
            </p>
          </div>

          {/* Visit Type Selection */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group"
              onClick={handleInitialVisit}
            >
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                <div className="flex items-center justify-between">
                  <UserPlus className="h-10 w-10 text-primary" />
                  <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                    New Patient
                  </span>
                </div>
                <CardTitle className="text-2xl">Initial Patient Visit</CardTitle>
                <CardDescription>
                  Complete intake interview for new weight management patients
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Patient data import (optional)</li>
                  <li>• BMI calculation & targets</li>
                  <li>• Comprehensive health history</li>
                  <li>• Medication counseling & education</li>
                  <li>• Treatment plan development</li>
                </ul>
                <Button className="w-full mt-4 group-hover:bg-primary">
                  Start Initial Visit
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all hover:shadow-lg hover:border-secondary/50 group"
              onClick={handleReturnVisit}
            >
              <CardHeader className="bg-gradient-to-r from-secondary/10 to-secondary/5 group-hover:from-secondary/20 group-hover:to-secondary/10 transition-colors">
                <div className="flex items-center justify-between">
                  <UserCheck className="h-10 w-10 text-secondary-light" />
                  <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                    Existing Patient
                  </span>
                </div>
                <CardTitle className="text-2xl">Return Visit</CardTitle>
                <CardDescription>
                  Follow-up interview for established patients
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Weight progress tracking</li>
                  <li>• Medication review & adjustment</li>
                  <li>• Side effects assessment</li>
                  <li>• Diet & exercise evaluation</li>
                  <li>• Lab review & clinical notes</li>
                </ul>
                <Button variant="secondary" className="w-full mt-4">
                  Start Return Visit
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Direct Assessment Link */}
          <div className="text-center pt-8 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Or go directly to the clinical assessment
            </p>
            <Button variant="outline" onClick={handleDirectAssessment}>
              Open Obesity Assessment Tool
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
