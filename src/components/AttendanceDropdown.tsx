import React, { useState } from 'react';
import { Check, Calendar, Clock, Umbrella, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AttendanceDropdownProps {
  selectedDate: string;
  onMarkAttendance: (status: 'present' | 'absent' | 'leave' | 'holiday') => void;
  onClose: () => void;
}

const AttendanceDropdown: React.FC<AttendanceDropdownProps> = ({
  selectedDate,
  onMarkAttendance,
  onClose
}) => {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const options = [
    {
      status: 'present',
      label: 'Present',
      icon: Check,
      description: 'Mark as attended',
      gradient: 'from-emerald-500 to-green-600',
      hoverGradient: 'from-emerald-400 to-green-500',
      shadow: 'shadow-emerald-500/25'
    },
    {
      status: 'absent',
      label: 'Absent',
      icon: Clock,
      description: 'Mark as missed',
      gradient: 'from-red-500 to-rose-600',
      hoverGradient: 'from-red-400 to-rose-500',
      shadow: 'shadow-red-500/25'
    },
    {
      status: 'leave',
      label: 'Leave',
      icon: Umbrella,
      description: 'Approved leave',
      gradient: 'from-blue-500 to-indigo-600',
      hoverGradient: 'from-blue-400 to-indigo-500',
      shadow: 'shadow-blue-500/25'
    },
    {
      status: 'holiday',
      label: 'Holiday',
      icon: Sun,
      description: 'Public holiday',
      gradient: 'from-amber-500 to-orange-600',
      hoverGradient: 'from-amber-400 to-orange-500',
      shadow: 'shadow-amber-500/25'
    }
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-background/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-border/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Mark Attendance
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            {formatDate(selectedDate)}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {options.map((option) => {
            const Icon = option.icon;
            const isHovered = hoveredOption === option.status;
            
            return (
              <Button
                key={option.status}
                onClick={() => onMarkAttendance(option.status as any)}
                onMouseEnter={() => setHoveredOption(option.status)}
                onMouseLeave={() => setHoveredOption(null)}
                className={`
                  w-full h-16 p-4 rounded-2xl border-0 text-white font-medium
                  bg-gradient-to-r ${isHovered ? option.hoverGradient : option.gradient}
                  ${option.shadow} shadow-lg
                  transform transition-all duration-300 ease-out
                  ${isHovered ? 'scale-105 shadow-xl' : 'hover:scale-102'}
                  relative overflow-hidden group
                `}
              >
                {/* Background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="flex items-center justify-between w-full relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-lg">{option.label}</div>
                      <div className="text-white/80 text-sm">{option.description}</div>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-white/60 rounded-full" />
                </div>
              </Button>
            );
          })}
        </div>

        {/* Cancel Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          className="w-full mt-6 h-12 rounded-xl text-muted-foreground hover:bg-muted/50"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AttendanceDropdown;