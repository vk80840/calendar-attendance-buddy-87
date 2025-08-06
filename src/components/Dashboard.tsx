import React, { useState, useEffect } from 'react';
import { Calendar, Bell, Download, Settings, Plus, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import AttendanceCalendar from './AttendanceCalendar';
import AttendanceChart from './AttendanceChart';
import { useAttendanceStore } from '@/hooks/useAttendanceStore';

const Dashboard = () => {
  const {
    attendanceData,
    markAttendance,
    getMonthStats,
    getTargetProgress,
    exportToCSV,
    currentMonth,
    setCurrentMonth,
    target,
    holidays
  } = useAttendanceStore();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const monthStats = getMonthStats(currentMonth);
  const targetProgress = getTargetProgress();

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setShowMarkModal(true);
  };

  const handleMarkAttendance = (status: 'present' | 'absent' | 'leave' | 'holiday') => {
    if (selectedDate) {
      markAttendance(selectedDate, status);
      setShowMarkModal(false);
      setSelectedDate(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-green-500';
      case 'absent': return 'text-red-500';
      case 'leave': return 'text-blue-500';
      case 'holiday': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-500';
      case 'absent': return 'bg-red-500';
      case 'leave': return 'bg-blue-500';
      case 'holiday': return 'bg-yellow-500';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Academic Session 2025-2026</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="h-5 w-5" />
              {targetProgress.percentage < target && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowProfile(true)}
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Present', value: monthStats.present, color: 'bg-green-500' },
            { label: 'Absent', value: monthStats.absent, color: 'bg-red-500' },
            { label: 'Leaves', value: monthStats.leave, color: 'bg-blue-500' },
            { label: 'Holidays', value: monthStats.holiday, color: 'bg-yellow-500' }
          ].map((stat) => (
            <Card key={stat.label} className="p-4 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">
                    {monthStats.total > 0 ? Math.round((stat.value / monthStats.total) * 100) : 0}%
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>

        {/* Charts and Calendar Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Attendance Chart */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4">Attendance Distribution</h3>
            <AttendanceChart data={monthStats} />
          </Card>

          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Monthly Calendar</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV(currentMonth)}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
              <AttendanceCalendar
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                onDateClick={handleDateClick}
                attendanceData={attendanceData}
                holidays={holidays}
              />
            </Card>
          </div>
        </div>

        {/* Target Progress */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-4">Target Progress</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Attendance</span>
              <span className="font-semibold">{targetProgress.percentage.toFixed(1)}%</span>
            </div>
            <Progress 
              value={targetProgress.percentage} 
              className="h-3"
            />
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Target</p>
                <p className="font-semibold">{target}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Days Needed</p>
                <p className="font-semibold">{targetProgress.daysNeeded}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Absents Allowed</p>
                <p className="font-semibold">{targetProgress.absentsAllowed}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Monthly Records */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-4">Monthly Records</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Day</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(attendanceData)
                  .filter(([date]) => date.startsWith(currentMonth))
                  .sort()
                  .map(([date, status]) => {
                    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
                    return (
                      <tr key={date} className="border-b border-border/30">
                        <td className="p-2">{new Date(date).getDate()}</td>
                        <td className="p-2">
                          <span className={`inline-flex items-center gap-2 ${getStatusColor(status)}`}>
                            <div className={`w-2 h-2 rounded-full ${getStatusBg(status)}`} />
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td className="p-2 text-muted-foreground">{dayOfWeek}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Mark Attendance Modal */}
      <Dialog open={showMarkModal} onOpenChange={setShowMarkModal}>
        <DialogContent className="bg-card/90 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { status: 'present', label: 'Present', color: 'bg-green-500 hover:bg-green-600' },
              { status: 'absent', label: 'Absent', color: 'bg-red-500 hover:bg-red-600' },
              { status: 'leave', label: 'Leave', color: 'bg-blue-500 hover:bg-blue-600' },
              { status: 'holiday', label: 'Holiday', color: 'bg-yellow-500 hover:bg-yellow-600' }
            ].map((option) => (
              <Button
                key={option.status}
                onClick={() => handleMarkAttendance(option.status as any)}
                className={`${option.color} text-white border-0`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;