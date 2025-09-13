import { useState, useEffect } from 'react';
import TimeRecorder from '@/components/TimeRecorder';
import EarningsDisplay from '@/components/EarningsDisplay';
import StatsCards from '@/components/StatsCards';
import { WorkStatus, WorkRecord, Settings } from '@shared/schema';

export default function TimerPage() {
  // todo: remove mock functionality
  const [status, setStatus] = useState<WorkStatus>('not_started');
  const [currentSessionMinutes, setCurrentSessionMinutes] = useState(0);
  const [lastActionTime, setLastActionTime] = useState<Date>();
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(187500);

  // Mock settings - todo: replace with real data
  const settings: Settings = {
    id: 'main',
    hourlyRate: 3000,
    overtimeRate: 3750,
    targetHoursPerDay: 480,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (status === 'working') {
        setCurrentSessionMinutes(prev => prev + 1);
        setTodayEarnings(prev => prev + (settings.hourlyRate / 60));
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [status, settings.hourlyRate]);

  const handleClockIn = () => {
    setStatus('working');
    setLastActionTime(new Date());
    setCurrentSessionMinutes(0);
    console.log('Clocked in');
  };

  const handleBreakStart = () => {
    setStatus('on_break');
    setLastActionTime(new Date());
    console.log('Break started');
  };

  const handleBreakEnd = () => {
    setStatus('working');
    setLastActionTime(new Date());
    console.log('Break ended');
  };

  const handleClockOut = () => {
    setStatus('finished');
    setLastActionTime(new Date());
    console.log('Clocked out');
  };

  return (
    <div className="min-h-screen bg-background pb-20 px-4">
      <div className="max-w-md mx-auto pt-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            出退勤記録
          </h1>
          <p className="text-sm text-muted-foreground">
            副業エンジニア向けタイムレコーダー
          </p>
        </div>

        <TimeRecorder
          status={status}
          onClockIn={handleClockIn}
          onBreakStart={handleBreakStart}
          onBreakEnd={handleBreakEnd}
          onClockOut={handleClockOut}
          currentSessionMinutes={currentSessionMinutes}
          lastActionTime={lastActionTime}
        />

        <EarningsDisplay
          todayEarnings={todayEarnings}
          monthlyEarnings={monthlyEarnings}
          monthlyTarget={250000}
          hourlyRate={settings.hourlyRate}
        />

        <StatsCards
          weeklyHours={2400}
          monthlyHours={9600}
          avgDailyHours={8.2}
          workingDays={20}
          isOvertime={currentSessionMinutes > 480}
        />
      </div>
    </div>
  );
}