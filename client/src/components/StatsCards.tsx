import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingUp, Award } from "lucide-react";

interface StatsCardsProps {
  weeklyHours: number;
  monthlyHours: number;
  avgDailyHours: number;
  workingDays: number;
  isOvertime?: boolean;
}

export default function StatsCards({ 
  weeklyHours, 
  monthlyHours, 
  avgDailyHours, 
  workingDays,
  isOvertime = false 
}: StatsCardsProps) {
  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}時間${mins > 0 ? `${mins}分` : ''}`;
  };

  const formatDecimalHours = (hours: number) => {
    return `${hours.toFixed(1)}時間`;
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            今週の勤務
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold" data-testid="text-weekly-hours">
            {formatHours(weeklyHours)}
          </div>
          {isOvertime && (
            <Badge variant="secondary" className="bg-break-start/20 text-break-start border-break-start/30 mt-1">
              残業中
            </Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            今月の勤務
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold" data-testid="text-monthly-hours">
            {formatHours(monthlyHours)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {workingDays}日勤務
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            平均勤務時間
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold" data-testid="text-avg-hours">
            {formatDecimalHours(avgDailyHours)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            1日あたり
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Award className="w-4 h-4" />
            月間実績
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold" data-testid="text-working-days">
            {workingDays}日
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            稼働日数
          </p>
        </CardContent>
      </Card>
    </div>
  );
}