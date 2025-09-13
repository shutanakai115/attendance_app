import EarningsDisplay from '../EarningsDisplay';

export default function EarningsDisplayExample() {
  return (
    <EarningsDisplay
      todayEarnings={12500}
      monthlyEarnings={187500}
      monthlyTarget={250000}
      hourlyRate={3000}
    />
  );
}