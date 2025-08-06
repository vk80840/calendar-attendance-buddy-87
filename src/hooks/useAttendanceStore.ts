import { useState, useEffect } from 'react';

interface AttendanceData {
  [date: string]: 'present' | 'absent' | 'leave' | 'holiday';
}

interface MonthStats {
  present: number;
  absent: number;
  leave: number;
  holiday: number;
  total: number;
}

interface TargetProgress {
  percentage: number;
  daysNeeded: number;
  absentsAllowed: number;
}

export const useAttendanceStore = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});
  const [target, setTarget] = useState(75);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });
  
  // Predefined holidays for academic session 2025-26
  const [holidays] = useState([
    '2025-08-15', // Independence Day
    '2025-10-02', // Gandhi Jayanti
    '2025-10-24', // Diwali (example date)
    '2025-12-25', // Christmas
    '2026-01-26', // Republic Day
    // Add more holidays as needed
  ]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('attendanceData');
    const savedTarget = localStorage.getItem('attendanceTarget');
    
    if (savedData) {
      setAttendanceData(JSON.parse(savedData));
    }
    if (savedTarget) {
      setTarget(Number(savedTarget));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
  }, [attendanceData]);

  useEffect(() => {
    localStorage.setItem('attendanceTarget', target.toString());
  }, [target]);

  const markAttendance = (date: string, status: 'present' | 'absent' | 'leave' | 'holiday') => {
    setAttendanceData(prev => ({
      ...prev,
      [date]: status
    }));
  };

  const getMonthStats = (month: string): MonthStats => {
    const monthData = Object.entries(attendanceData).filter(([date]) => 
      date.startsWith(month)
    );

    const stats = {
      present: 0,
      absent: 0,
      leave: 0,
      holiday: 0,
      total: 0
    };

    monthData.forEach(([_, status]) => {
      stats[status]++;
      stats.total++;
    });

    return stats;
  };

  const getOverallStats = (): MonthStats => {
    const stats = {
      present: 0,
      absent: 0,
      leave: 0,
      holiday: 0,
      total: 0
    };

    Object.values(attendanceData).forEach(status => {
      stats[status]++;
      stats.total++;
    });

    return stats;
  };

  const getTargetProgress = (): TargetProgress => {
    const stats = getOverallStats();
    const workingDays = stats.present + stats.absent + stats.leave; // Exclude holidays
    const percentage = workingDays > 0 ? (stats.present / workingDays) * 100 : 0;
    
    // Calculate days needed to reach target
    const requiredPresent = Math.ceil((target / 100) * (workingDays + 30)); // Assume 30 future working days
    const daysNeeded = Math.max(0, requiredPresent - stats.present);
    
    // Calculate absents allowed
    const maxAbsents = Math.floor(((100 - target) / 100) * (workingDays + 30));
    const absentsAllowed = Math.max(0, maxAbsents - stats.absent);

    return {
      percentage,
      daysNeeded,
      absentsAllowed
    };
  };

  const exportToCSV = (month: string) => {
    const monthData = Object.entries(attendanceData)
      .filter(([date]) => date.startsWith(month))
      .sort()
      .map(([date, status]) => {
        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        return [date, status, dayOfWeek];
      });

    const csvContent = [
      ['Date', 'Status', 'Day'],
      ...monthData
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAllData = () => {
    const exportData = {
      attendanceData,
      target,
      holidays,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (data: any) => {
    if (data.attendanceData) {
      setAttendanceData(data.attendanceData);
    }
    if (data.target) {
      setTarget(data.target);
    }
  };

  return {
    attendanceData,
    target,
    currentMonth,
    holidays,
    markAttendance,
    getMonthStats,
    getOverallStats,
    getTargetProgress,
    exportToCSV,
    exportAllData,
    importData,
    setTarget,
    setCurrentMonth
  };
};