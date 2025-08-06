import React from 'react';

interface AttendanceChartProps {
  data: {
    present: number;
    absent: number;
    leave: number;
    holiday: number;
    total: number;
  };
}

const AttendanceChart: React.FC<AttendanceChartProps> = ({ data }) => {
  const chartData = [
    { name: 'Present', value: data.present, color: '#34c759' },
    { name: 'Absent', value: data.absent, color: '#ff3b30' },
    { name: 'Leave', value: data.leave, color: '#007aff' },
    { name: 'Holiday', value: data.holiday, color: '#ffcc00' }
  ].filter(item => item.value > 0);

  if (data.total === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-2 flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-sm">No data to display</p>
        </div>
      </div>
    );
  }

  // Simple donut chart using CSS
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercentage = 0;

  return (
    <div className="h-48 flex flex-col items-center justify-center space-y-4">
      <div className="relative w-32 h-32">
        <div className="w-full h-full rounded-full bg-muted"></div>
        <div className="absolute inset-4 bg-background rounded-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center gap-4">
        {chartData.map((entry, index) => {
          const percentage = ((entry.value / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">
                {entry.name}: {entry.value} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttendanceChart;