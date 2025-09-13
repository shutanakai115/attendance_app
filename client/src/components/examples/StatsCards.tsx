import StatsCards from '../StatsCards';

export default function StatsCardsExample() {
  return (
    <StatsCards
      weeklyHours={2400} // 40 hours in minutes
      monthlyHours={9600} // 160 hours in minutes
      avgDailyHours={8.2}
      workingDays={20}
      isOvertime={true}
    />
  );
}