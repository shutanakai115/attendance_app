import { useQuery } from '@tanstack/react-query';
import WorkHistory from '@/components/WorkHistory';
import { WorkRecord } from '@shared/schema';
import { loadWorkRecords } from '@/lib/localStorage';

export default function HistoryPage() {
  // Get all work records from API with localStorage fallback
  const { data: records = [], isLoading } = useQuery({
    queryKey: ['/api/records'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/records');
        if (response.ok) {
          const records = await response.json();
          // Convert date strings back to Date objects
          return records.map((record: WorkRecord) => ({
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

  const handleExportCSV = async () => {
    try {
      // Try API first for CSV export
      const response = await fetch('/api/export/csv');
      if (response.ok) {
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `work_records_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        return;
      }
    } catch (error) {
      console.log('API CSV export failed, using local export');
    }

    // Fallback to local CSV generation
    const csvHeaders = ['日付', '出勤時刻', '退勤時刻', '休憩時間', '実働時間', '収益'];
    const csvRows = records.map((record: WorkRecord) => [
      record.date,
      record.clockIn ? record.clockIn.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '',
      record.clockOut ? record.clockOut.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '',
      `${Math.floor(record.totalBreakMinutes / 60)}:${(record.totalBreakMinutes % 60).toString().padStart(2, '0')}`,
      `${Math.floor(record.totalWorkMinutes / 60)}:${(record.totalWorkMinutes % 60).toString().padStart(2, '0')}`,
      record.earnings.toString()
    ]);
    
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `work_records_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    console.log('CSV export completed');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 px-4 lg:px-8 xl:px-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 px-4 lg:px-8 xl:px-12">
      <div className="max-w-2xl mx-auto pt-6 space-y-6 lg:max-w-5xl lg:pt-8 xl:pt-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            勤務履歴
          </h1>
          <p className="text-sm text-muted-foreground">
            過去の勤務記録とデータ出力
          </p>
        </div>

        <WorkHistory 
          records={records} 
          onExportCSV={handleExportCSV}
        />
      </div>
    </div>
  );
}