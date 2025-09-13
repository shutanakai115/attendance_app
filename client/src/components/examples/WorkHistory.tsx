import WorkHistory from '../WorkHistory';
import { WorkRecord } from "@shared/schema";

export default function WorkHistoryExample() {
  // todo: remove mock functionality
  const mockRecords: WorkRecord[] = [
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
      totalWorkMinutes: 120,
      status: 'working',
      earnings: 6000,
      createdAt: new Date('2024-01-13T09:30:00'),
      updatedAt: new Date('2024-01-13T11:30:00'),
    },
  ];

  const handleExportCSV = () => {
    console.log('CSV Export triggered');
  };

  return (
    <WorkHistory 
      records={mockRecords} 
      onExportCSV={handleExportCSV}
    />
  );
}