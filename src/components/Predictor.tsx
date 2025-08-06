import React, { useState, useEffect } from 'react';
import { Calculator, RotateCcw, TrendingUp, Calendar as CalendarIcon, Target, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
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
  leavesAvailable: number;
  presentNeeded: number;
  weeklyPresentNeeded: number;
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
  const [targetDate, setTargetDate] = useState('2026-03-31');
  const [includePreviousData, setIncludePreviousData] = useState(true);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [showWeeklyView, setShowWeeklyView] = useState(false);

  const calculatePrediction = () => {
    const stats = getOverallStats();
    const currentPercentage = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
    
    // Calculate days remaining until target date
    const sessionEnd = new Date(targetDate);
    const today = new Date();
    const daysRemaining = Math.max(0, Math.ceil((sessionEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Calculate working days (excluding Sundays and holidays) - roughly 85% of total days
    const workingDaysRemaining = Math.floor(daysRemaining * 0.85);
    
    const totalCurrentDays = includePreviousData ? stats.total : 0;
    const totalPresentDays = includePreviousData ? stats.present : 0;
    
    // Calculate days needed to achieve target
    const totalFutureDays = totalCurrentDays + workingDaysRemaining;
    const requiredPresentDays = Math.ceil((predictionTarget / 100) * totalFutureDays);
    const daysNeeded = Math.max(0, requiredPresentDays - totalPresentDays);
    const presentNeeded = Math.max(0, daysNeeded);
    
    // Calculate confidence score based on current performance
    const performanceRatio = currentPercentage / predictionTarget;
    const confidenceScore = Math.min(100, Math.max(0, performanceRatio * 100));
    
    // Check if target is achievable
    const isAchievable = daysNeeded <= workingDaysRemaining;
    
    // Calculate absents allowed
    const absentsAllowed = Math.max(0, workingDaysRemaining - daysNeeded);
    const absentsPerWeek = absentsAllowed / Math.max(1, (workingDaysRemaining / 7));
    const absentsPerMonth = absentsAllowed / Math.max(1, (workingDaysRemaining / 30));
    
    // Calculate weekly present needed
    const weeksRemaining = Math.max(1, workingDaysRemaining / 7);
    const weeklyPresentNeeded = daysNeeded / weeksRemaining;
    
    // Leaves available (separate from working days calculation)
    const currentLeaves = stats.leave;
    const leavesAvailable = Math.max(0, 15 - currentLeaves); // Assume 15 leaves per year

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
      daysNeeded: Math.round(daysNeeded),
      absentsPerWeek: Math.max(0, absentsPerWeek),
      absentsPerMonth: Math.max(0, absentsPerMonth),
      confidenceScore,
      isAchievable,
      recommendations,
      leavesAvailable: Math.round(leavesAvailable),
      presentNeeded: Math.round(presentNeeded),
      weeklyPresentNeeded
    };

    setPrediction(result);
  };

  const resetPrediction = () => {
    setPrediction(null);
    setPredictionTarget(target);
    setTargetDate('2026-03-31');
    setIncludePreviousData(true);
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
              
              <div>
                <Label htmlFor="targetDate">Target Date</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includePrevious"
                  checked={includePreviousData}
                  onCheckedChange={(checked) => setIncludePreviousData(checked as boolean)}
                />
                <Label htmlFor="includePrevious">Include previous attendance data</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="weeklyView">Show weekly view</Label>
                <Switch
                  id="weeklyView"
                  checked={showWeeklyView}
                  onCheckedChange={setShowWeeklyView}
                />
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
                    <span className="font-semibold">{Math.round(prediction.confidenceScore)}%</span>
                  </div>
                  <Progress 
                    value={prediction.confidenceScore} 
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                  <div>
                    <p className="text-sm text-muted-foreground">Present Needed</p>
                    <p className="text-xl font-bold text-green-500">{prediction.presentNeeded}</p>
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
                    <p className="text-sm text-muted-foreground">
                      {showWeeklyView ? 'Weekly Present' : 'Leaves Available'}
                    </p>
                    <p className="font-semibold text-blue-500">
                      {showWeeklyView ? Math.round(prediction.weeklyPresentNeeded) : prediction.leavesAvailable}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {showWeeklyView ? 'Absents/Week' : 'Absents/Month'}
                    </p>
                    <p className="font-semibold text-red-500">
                      {showWeeklyView ? Math.round(prediction.absentsPerWeek) : Math.round(prediction.absentsPerMonth)}
                    </p>
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

        {/* Target Dashboard */}
        {prediction && (
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Target Dashboard
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-background/50 rounded-xl">
                <div className="text-2xl font-bold text-green-500">{prediction.presentNeeded}</div>
                <div className="text-sm text-muted-foreground">Days to Present</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-xl">
                <div className="text-2xl font-bold text-red-500">{Math.round(prediction.absentsPerMonth)}</div>
                <div className="text-sm text-muted-foreground">Absents Allowed</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-xl">
                <div className="text-2xl font-bold text-blue-500">{prediction.leavesAvailable}</div>
                <div className="text-sm text-muted-foreground">Leaves Available</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-xl">
                <div className="text-2xl font-bold text-amber-500">{Math.round(prediction.weeklyPresentNeeded)}</div>
                <div className="text-sm text-muted-foreground">Weekly Target</div>
              </div>
            </div>
          </Card>
        )}

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