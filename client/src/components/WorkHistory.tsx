import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, Clock, DollarSign } from "lucide-react";
import { WorkRecord } from "@shared/schema";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface WorkHistoryProps {
  records: WorkRecord[];
  onExportCSV: () => void;
}

export default function WorkHistory({ records, onExportCSV }: WorkHistoryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}時間${mins}分`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'finished':
        return <Badge variant="default" className="bg-clock-out text-white">完了</Badge>;
      case 'working':
        return <Badge variant="default" className="bg-clock-in text-white">勤務中</Badge>;
      case 'on_break':
        return <Badge variant="default" className="bg-break-start text-white">休憩中</Badge>;
      default:
        return <Badge variant="secondary">未開始</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          勤務履歴
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onExportCSV}
          data-testid="button-export-csv"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          CSV出力
        </Button>
      </CardHeader>
      
      <CardContent>
        {records.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            勤務記録がありません
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div 
                key={record.id} 
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover-elevate"
                data-testid={`row-work-record-${record.id}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium">
                      {format(new Date(record.date), 'M月d日(E)', { locale: ja })}
                    </span>
                    {getStatusBadge(record.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {record.clockIn ? format(record.clockIn, 'HH:mm') : '--:--'} - 
                      {record.clockOut ? format(record.clockOut, 'HH:mm') : '--:--'}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {formatCurrency(record.earnings)}
                    </div>
                  </div>
                  
                  {record.totalWorkMinutes > 0 && (
                    <div className="text-sm text-muted-foreground mt-1">
                      実働: {formatDuration(record.totalWorkMinutes)}
                      {record.totalBreakMinutes > 0 && (
                        <span> (休憩: {formatDuration(record.totalBreakMinutes)})</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}