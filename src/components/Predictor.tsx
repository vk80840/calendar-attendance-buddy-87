import React, { useState, useEffect } from 'react';
import { Calculator, RotateCcw, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PredictionCalendar from './PredictionCalendar';
import { useAttendanceStore } from '@/hooks/useAttendanceStore';

interface PredictionResult {
  targetPercentage: number;
  currentPercentage: number;
  daysNeeded: number;
  absentsPerWeek: number;
  absentsPerMonth: number;
  confidenceScore: number;
  isAchievable: boolean;
  recommendations: string[];
}

const Predictor = () => {
  const {
    attendanceData,
    getOverallStats,
    target,
    setTarget,
    holidays
  } = useAttendanceStore();

  const [predictionTarget, setPredictionTarget] = useState(target);
  const [includePreviousData, setIncludePreviousData] = useState(true);
  const [customHolidays, setCustomHolidays] = useState<string[]>([]);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [simulationDays, setSimulationDays] = useState('');
  const [simulationType, setSimulationType] = useState<'present' | 'absent'>('absent');

  const calculatePrediction = () => {
    const stats = getOverallStats();
    const currentPercentage = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
    
    // Calculate days remaining in academic session (assuming April to March)
    const sessionEnd = new Date(2026, 2, 31); // March 31, 2026
    const today = new Date();
    const daysRemaining = Math.max(0, Math.ceil((sessionEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Calculate working days (excluding Sundays and holidays)
    const workingDaysRemaining = Math.floor(daysRemaining * 0.85); // Rough estimate excluding weekends and holidays
    
    const totalCurrentDays = includePreviousData ? stats.total : 0;
    const totalPresentDays = includePreviousData ? stats.present : 0;
    
    // Calculate days needed to achieve target
    const requiredPresentDays = Math.ceil((predictionTarget / 100) * (totalCurrentDays + workingDaysRemaining));
    const daysNeeded = Math.max(0, requiredPresentDays - totalPresentDays);
    
    // Calculate confidence score based on current performance
    const performanceRatio = currentPercentage / predictionTarget;
    const confidenceScore = Math.min(100, Math.max(0, performanceRatio * 100));
    
    // Check if target is achievable
    const isAchievable = daysNeeded <= workingDaysRemaining;
    
    // Calculate absents per week/month
    const absentsAllowed = workingDaysRemaining - daysNeeded;
    const absentsPerWeek = absentsAllowed / (workingDaysRemaining / 7);
    const absentsPerMonth = absentsAllowed / (workingDaysRemaining / 30);

    // Generate recommendations
    const recommendations = [];
    if (!isAchievable) {
      recommendations.push('Target may not be achievable with current attendance pattern.');
      recommendations.push('Consider adjusting your target or improving attendance consistency.');
    } else if (confidenceScore < 70) {
      recommendations.push('Maintain consistent attendance to meet your target.');
      recommendations.push('Avoid unnecessary absences, especially in the coming weeks.');
    } else {
      recommendations.push('You are on track to meet your target!');
      recommendations.push(`You can afford ${Math.floor(absentsPerMonth)} absent days per month.`);
    }

    const result: PredictionResult = {
      targetPercentage: predictionTarget,
      currentPercentage,
      daysNeeded,
      absentsPerWeek: Math.max(0, absentsPerWeek),
      absentsPerMonth: Math.max(0, absentsPerMonth),
      confidenceScore,
      isAchievable,
      recommendations
    };

    setPrediction(result);
  };

  const resetPrediction = () => {
    setPrediction(null);
    setPredictionTarget(target);
    setIncludePreviousData(true);
    setCustomHolidays([]);
    setSimulationDays('');
  };

  const simulateScenario = () => {
    if (!simulationDays || !prediction) return;
    
    const days = parseInt(simulationDays);
    const stats = getOverallStats();
    
    let newPresent = stats.present;
    let newTotal = stats.total + days;
    
    if (simulationType === 'present') {
      newPresent += days;
    }
    
    const newPercentage = (newPresent / newTotal) * 100;
    
    setPrediction({
      ...prediction,
      currentPercentage: newPercentage,
      confidenceScore: Math.min(100, (newPercentage / predictionTarget) * 100)
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold">Predictor</h1>
            <p className="text-sm text-muted-foreground">Forecast your attendance goals</p>
          </div>
          <Button
            variant="outline"
            onClick={resetPrediction}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Prediction Form */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Prediction Settings
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target">Target Attendance (%)</Label>
                <Input
                  id="target"
                  type="number"
                  min="0"
                  max="100"
                  value={predictionTarget}
                  onChange={(e) => setPredictionTarget(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              
              <div className="flex items-center space-x-2 mt-6">
                <Checkbox
                  id="includePrevious"
                  checked={includePreviousData}
                  onCheckedChange={(checked) => setIncludePreviousData(checked as boolean)}
                />
                <Label htmlFor="includePrevious">Include previous attendance data</Label>
              </div>
            </div>

            <Button onClick={calculatePrediction} className="w-full">
              Calculate Prediction
            </Button>
          </div>
        </Card>

        {/* Prediction Results */}
        {prediction && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Prediction Results
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Attendance</span>
                  <span className="font-semibold">{prediction.currentPercentage.toFixed(1)}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Target</span>
                  <span className="font-semibold">{prediction.targetPercentage}%</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Confidence Score</span>
                    <span className="font-semibold">{prediction.confidenceScore.toFixed(0)}%</span>
                  </div>
                  <Progress 
                    value={prediction.confidenceScore} 
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                  <div>
                    <p className="text-sm text-muted-foreground">Days Needed</p>
                    <p className="text-xl font-bold">{prediction.daysNeeded}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className={`text-sm font-semibold ${prediction.isAchievable ? 'text-green-500' : 'text-red-500'}`}>
                      {prediction.isAchievable ? 'Achievable' : 'Challenging'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Absents/Week</p>
                    <p className="font-semibold">{prediction.absentsPerWeek.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Absents/Month</p>
                    <p className="font-semibold">{prediction.absentsPerMonth.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
              <div className="space-y-3">
                {prediction.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Simulation */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-4">Simulate Scenarios</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="simDays">Number of Days</Label>
              <Input
                id="simDays"
                type="number"
                min="1"
                value={simulationDays}
                onChange={(e) => setSimulationDays(e.target.value)}
                placeholder="e.g., 5"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Scenario Type</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={simulationType === 'present' ? 'default' : 'outline'}
                  onClick={() => setSimulationType('present')}
                  size="sm"
                >
                  Present
                </Button>
                <Button
                  variant={simulationType === 'absent' ? 'default' : 'outline'}
                  onClick={() => setSimulationType('absent')}
                  size="sm"
                >
                  Absent
                </Button>
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={simulateScenario} disabled={!simulationDays || !prediction}>
                Simulate
              </Button>
            </div>
          </div>
        </Card>

        {/* Prediction Calendar */}
        {prediction && (
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Prediction Calendar
            </h3>
            <PredictionCalendar
              attendanceData={attendanceData}
              prediction={prediction}
              holidays={holidays}
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default Predictor;