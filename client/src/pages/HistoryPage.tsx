import { useState } from 'react';
import WorkHistory from '@/components/WorkHistory';
import { WorkRecord } from '@shared/schema';

export default function HistoryPage() {
  // todo: remove mock functionality
  const [records] = useState<WorkRecord[]>([
    {
      id: '1',
      date: '2024-01-15',
      clockIn: new Date('2024-01-15T09:00:00'),
      clockOut: new Date('2024-01-15T18:00:00'),
      breakStart: new Date('2024-01-15T12:00:00'),
      breakEnd: new Date('2024-01-15T13:00:00'),
      totalBreakMinutes: 60,
      totalWorkMinutes: 480,
      status: 'finished',
      earnings: 24000,
      createdAt: new Date('2024-01-15T09:00:00'),
      updatedAt: new Date('2024-01-15T18:00:00'),
    },
    {
      id: '2',
      date: '2024-01-14',
      clockIn: new Date('2024-01-14T10:00:00'),
      clockOut: new Date('2024-01-14T16:30:00'),
      totalBreakMinutes: 30,
      totalWorkMinutes: 360,
      status: 'finished',
      earnings: 18000,
      createdAt: new Date('2024-01-14T10:00:00'),
      updatedAt: new Date('2024-01-14T16:30:00'),
    },
    {
      id: '3',
      date: '2024-01-13',
      clockIn: new Date('2024-01-13T09:30:00'),
      totalBreakMinutes: 0,
      totalWorkMinutes: 180,
      status: 'finished',
      earnings: 9000,
      createdAt: new Date('2024-01-13T09:30:00'),
      updatedAt: new Date('2024-01-13T12:30:00'),
    },
    {
      id: '4',
      date: '2024-01-12',
      clockIn: new Date('2024-01-12T14:00:00'),
      clockOut: new Date('2024-01-12T20:00:00'),
      breakStart: new Date('2024-01-12T17:00:00'),
      breakEnd: new Date('2024-01-12T17:30:00'),
      totalBreakMinutes: 30,
      totalWorkMinutes: 330,
      status: 'finished',
      earnings: 16500,
      createdAt: new Date('2024-01-12T14:00:00'),
      updatedAt: new Date('2024-01-12T20:00:00'),
    },
  ]);

  const handleExportCSV = () => {
    // todo: implement real CSV export
    const csvContent = [
      ['日付', '出勤時刻', '退勤時刻', '休憩時間', '実働時間', '収益'],
      ...records.map(record => [
        record.date,
        record.clockIn ? record.clockIn.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '',
        record.clockOut ? record.clockOut.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '',
        `${Math.floor(record.totalBreakMinutes / 60)}:${(record.totalBreakMinutes % 60).toString().padStart(2, '0')}`,
        `${Math.floor(record.totalWorkMinutes / 60)}:${(record.totalWorkMinutes % 60).toString().padStart(2, '0')}`,
        record.earnings.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `work_records_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    console.log('CSV export completed');
  };

  return (
    <div className="min-h-screen bg-background pb-20 px-4">
      <div className="max-w-2xl mx-auto pt-6 space-y-6">
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