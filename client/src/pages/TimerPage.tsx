import { useQuery } from '@tanstack/react-query';
import TimeRecorder from '@/components/TimeRecorder';
import EarningsDisplay from '@/components/EarningsDisplay';
import StatsCards from '@/components/StatsCards';
import { useWorkTracker } from '@/hooks/useWorkTracker';
import { calculateMonthlyStats } from '@/lib/timeCalculations';
import { loadWorkRecords } from '@/lib/localStorage';

export default function TimerPage() {
  const { 
    currentRecord, 
    isTimerRunning, 
    settings, 
    isLoading, 
    actions 
  } = useWorkTracker();

  // Get all records for monthly stats
  const { data: allRecords = [] } = useQuery({
    queryKey: ['/api/records'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/records');
        if (response.ok) {
          const records = await response.json();
          // Convert date strings back to Date objects
          return records.map((record: any) => ({
            ...record,
            clockIn: record.clockIn ? new Date(record.clockIn) : undefined,
            clockOut: record.clockOut ? new Date(record.clockOut) : undefined,
            breakStart: record.breakStart ? new Date(record.breakStart) : undefined,
            breakEnd: record.breakEnd ? new Date(record.breakEnd) : undefined,
            createdAt: new Date(record.createdAt),
            updatedAt: new Date(record.updatedAt)
          }));
        }
        throw new Error('API not available');
      } catch {
        return loadWorkRecords();
      }
    }
  });

  const monthlyStats = calculateMonthlyStats(allRecords);
  
  if (isLoading || !currentRecord || !settings) {
    return (
      <div className="min-h-screen bg-background pb-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

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
          status={currentRecord.status}
          onClockIn={actions.handleClockIn}
          onBreakStart={actions.handleBreakStart}
          onBreakEnd={actions.handleBreakEnd}
          onClockOut={actions.handleClockOut}
          currentSessionMinutes={currentRecord.totalWorkMinutes}
          lastActionTime={currentRecord.updatedAt}
        />

        <EarningsDisplay
          todayEarnings={currentRecord.earnings}
          monthlyEarnings={monthlyStats.totalEarnings}
          monthlyTarget={250000}
          hourlyRate={settings.hourlyRate}
        />

        <StatsCards
          weeklyHours={monthlyStats.totalHours * 60} // Convert to minutes
          monthlyHours={monthlyStats.totalHours * 60} // Convert to minutes  
          avgDailyHours={monthlyStats.averageHoursPerDay}
          workingDays={monthlyStats.workingDays}
          isOvertime={currentRecord.totalWorkMinutes > settings.targetHoursPerDay}
        />
      </div>
    </div>
  );
}