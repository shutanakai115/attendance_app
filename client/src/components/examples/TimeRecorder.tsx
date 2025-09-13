import TimeRecorder from '../TimeRecorder';

export default function TimeRecorderExample() {
  const handleAction = (action: string) => {
    console.log(`${action} triggered`);
  };

  return (
    <TimeRecorder
      status="working"
      onClockIn={() => handleAction('Clock In')}
      onBreakStart={() => handleAction('Break Start')}
      onBreakEnd={() => handleAction('Break End')}
      onClockOut={() => handleAction('Clock Out')}
      currentSessionMinutes={125}
      lastActionTime={new Date(Date.now() - 30 * 60 * 1000)}
    />
  );
}