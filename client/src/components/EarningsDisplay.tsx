import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Target } from "lucide-react";

interface EarningsDisplayProps {
  todayEarnings: number;
  monthlyEarnings: number;
  monthlyTarget?: number;
  hourlyRate: number;
}

export default function EarningsDisplay({ 
  todayEarnings, 
  monthlyEarnings, 
  monthlyTarget,
  hourlyRate 
}: EarningsDisplayProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const targetProgress = monthlyTarget ? (monthlyEarnings / monthlyTarget) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Monthly Earnings - Prominent Display */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">今月の収益</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-4xl font-bold text-primary mb-2" data-testid="text-monthly-earnings">
            {formatCurrency(monthlyEarnings)}
          </div>
          {monthlyTarget && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Target className="w-4 h-4" />
              <span>目標まで {formatCurrency(monthlyTarget - monthlyEarnings)}</span>
              <span className="text-primary font-semibold">
                ({targetProgress.toFixed(1)}%)
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Earnings */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              本日の収益
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-today-earnings">
              {formatCurrency(todayEarnings)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              時給設定
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-hourly-rate">
              {formatCurrency(hourlyRate)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}