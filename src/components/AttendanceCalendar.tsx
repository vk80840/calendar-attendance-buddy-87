import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AttendanceCalendarProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
  onDateClick: (date: string) => void;
  attendanceData: Record<string, string>;
  holidays: string[];
}

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  currentMonth,
  onMonthChange,
  onDateClick,
  attendanceData,
  holidays
}) => {
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
      onMonthChange(`${newYear}-${newMonth.toString().padStart(2, '0')}`);
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
      onMonthChange(`${newYear}-${newMonth.toString().padStart(2, '0')}`);
    }
  };

  const getDateStatus = (day: number) => {
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const dayOfWeek = new Date(year, month - 1, day).getDay();
    
    if (holidays.includes(dateStr) || attendanceData[dateStr] === 'holiday') {
      return 'holiday';
    }
    if (dayOfWeek === 0) { // Sunday
      return 'sunday';
    }
    return attendanceData[dateStr] || 'pending';
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-lg shadow-emerald-500/40 hover:shadow-emerald-500/60 border border-emerald-300/20';
      case 'absent':
        return 'bg-gradient-to-br from-red-400 to-red-500 text-white shadow-lg shadow-red-500/40 hover:shadow-red-500/60 border border-red-300/20';
      case 'leave':
        return 'bg-gradient-to-br from-cyan-400 to-cyan-500 text-white shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60 border border-cyan-300/20';
      case 'holiday':
        return 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-500/40 hover:shadow-amber-500/60 border border-amber-300/20';
      case 'sunday':
        return 'bg-gradient-to-br from-violet-400 to-violet-500 text-white shadow-lg shadow-violet-500/40 hover:shadow-violet-500/60 border border-violet-300/20';
      default:
        return 'glass-card hover:bg-primary/10 text-muted-foreground border-2 border-dashed border-border/50 hover:border-primary/30';
    }
  };

  const days = [];
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} />);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const status = getDateStatus(day);
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    days.push(
      <button
        key={day}
        onClick={() => onDateClick(dateStr)}
        className={`
          w-10 h-10 sm:w-12 sm:h-12 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 
          hover:scale-105 active:scale-95 flex items-center justify-center
          relative group
          ${getStatusClasses(status)}
        `}
      >
        <span className="relative z-10">{day}</span>
        {/* Subtle glow effect without 3D transforms */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>
    );
  }

  return (
    <div className="space-y-6 bg-vector">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          {monthName}
        </h4>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={previousMonth} className="hover-glow rounded-xl">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={nextMonth} className="hover-glow rounded-xl">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-3 text-center text-sm font-semibold text-muted-foreground">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-3 px-2 bg-muted/30 rounded-lg backdrop-blur-sm">{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {days}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 sm:gap-6 text-xs sm:text-sm glass-card p-3 sm:p-4 rounded-2xl">
        {[
          { status: 'present', color: 'bg-emerald-500', label: 'Present', icon: '✓' },
          { status: 'absent', color: 'bg-red-500', label: 'Absent', icon: '✗' },
          { status: 'leave', color: 'bg-cyan-500', label: 'Leave', icon: '🏖️' },
          { status: 'holiday', color: 'bg-amber-500', label: 'Holiday', icon: '🎉' },
          { status: 'pending', color: 'bg-muted border-2 border-dashed', label: 'Pending', icon: '⏳' }
        ].map(({ status, color, label, icon }) => (
          <div key={status} className="flex items-center gap-2 hover-glow p-2 rounded-lg">
            <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold`}>
              {icon}
            </div>
            <span className="text-muted-foreground font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceCalendar;