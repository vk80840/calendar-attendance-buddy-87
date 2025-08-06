import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PredictionCalendarProps {
  attendanceData: Record<string, string>;
  prediction: any;
  holidays: string[];
}

const PredictionCalendar: React.FC<PredictionCalendarProps> = ({
  attendanceData,
  prediction,
  holidays
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  const [year, month] = currentMonth.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = date.getDay();
  const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const previousMonth = () => {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    // Limit to academic session (April 2025 to March 2026)
    if (newYear >= 2025 && (newYear > 2025 || newMonth >= 4)) {
      setCurrentMonth(`${newYear}-${newMonth.toString().padStart(2, '0')}`);
    }
  };

  const nextMonth = () => {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    // Limit to academic session (April 2025 to March 2026)
    if (newYear <= 2026 && (newYear < 2026 || newMonth <= 3)) {
      setCurrentMonth(`${newYear}-${newMonth.toString().padStart(2, '0')}`);
    }
  };

  const generatePrediction = (day: number) => {
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const dayOfWeek = new Date(year, month - 1, day).getDay();
    const today = new Date();
    const currentDate = new Date(year, month - 1, day);
    
    // If date is in the past and we have data, use actual data
    if (currentDate <= today && attendanceData[dateStr]) {
      return attendanceData[dateStr];
    }
    
    // If it's a holiday or Sunday, predict as holiday
    if (holidays.includes(dateStr) || dayOfWeek === 0) {
      return 'holiday';
    }
    
    // For future dates, predict based on confidence score
    if (currentDate > today) {
      // Higher confidence means more likely to be present
      const presentProbability = prediction.confidenceScore / 100;
      
      // Add some randomness but bias towards the prediction
      if (Math.random() < presentProbability * 0.9) {
        return 'predicted-present';
      } else {
        return 'predicted-absent';
      }
    }
    
    return 'pending';
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-500 text-white shadow-lg shadow-green-500/20';
      case 'absent':
        return 'bg-red-500 text-white shadow-lg shadow-red-500/20';
      case 'leave':
        return 'bg-blue-500 text-white shadow-lg shadow-blue-500/20';
      case 'holiday':
        return 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20';
      case 'predicted-present':
        return 'bg-green-200 text-green-800 border-2 border-green-400 shadow-sm';
      case 'predicted-absent':
        return 'bg-red-200 text-red-800 border-2 border-red-400 shadow-sm';
      default:
        return 'bg-muted hover:bg-muted/80 text-muted-foreground border border-border/50';
    }
  };

  const days = [];
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} />);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const status = generatePrediction(day);
    
    days.push(
      <div
        key={day}
        className={`
          w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 
          flex items-center justify-center
          ${getStatusClasses(status)}
        `}
      >
        {day}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold">{monthName}</h4>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-muted-foreground">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {[
          { status: 'present', color: 'bg-green-500', label: 'Confirmed Present' },
          { status: 'absent', color: 'bg-red-500', label: 'Confirmed Absent' },
          { status: 'predicted-present', color: 'bg-green-200 border-2 border-green-400', label: 'Predicted Present' },
          { status: 'predicted-absent', color: 'bg-red-200 border-2 border-red-400', label: 'Predicted Absent' },
          { status: 'holiday', color: 'bg-yellow-500', label: 'Holiday' }
        ].map(({ status, color, label }) => (
          <div key={status} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${color}`} />
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PredictionCalendar;