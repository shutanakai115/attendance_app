import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Clock, Play, Pause, Square } from "lucide-react";
import { WorkStatus } from "@shared/schema";

interface TimeRecorderProps {
  status: WorkStatus;
  onClockIn: () => void;
  onBreakStart: () => void;
  onBreakEnd: () => void;
  onClockOut: () => void;
  currentSessionMinutes: number;
  lastActionTime?: Date;
}

export default function TimeRecorder({ 
  status, 
  onClockIn, 
  onBreakStart, 
  onBreakEnd, 
  onClockOut,
  currentSessionMinutes,
  lastActionTime 
}: TimeRecorderProps) {
  const [timeSinceLastAction, setTimeSinceLastAction] = useState<string>('');

  useEffect(() => {
    if (!lastActionTime) return;
    
    const updateTime = () => {
      const now = new Date();
      const actionTime = new Date(lastActionTime); // Ensure it's a Date object
      const diff = Math.floor((now.getTime() - actionTime.getTime()) / 1000 / 60);
      if (diff < 60) {
        setTimeSinceLastAction(`${diff}分前`);
      } else {
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        setTimeSinceLastAction(`${hours}時間${minutes}分前`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [lastActionTime]);

  const getStatusInfo = () => {
    switch (status) {
      case 'not_started':
        return { text: '出勤前', color: 'not-started', bgClass: 'bg-not-started' };
      case 'working':
        return { text: '出勤中', color: 'clock-in', bgClass: 'bg-clock-in' };
      case 'on_break':
        return { text: '休憩中', color: 'break-start', bgClass: 'bg-break-start' };
      case 'finished':
        return { text: '退勤済み', color: 'clock-out', bgClass: 'bg-clock-out' };
    }
  };

  const statusInfo = getStatusInfo();
  const hours = Math.floor(currentSessionMinutes / 60);
  const minutes = currentSessionMinutes % 60;

  return (
    <Card className="w-full max-w-md mx-auto lg:max-w-lg xl:max-w-xl">
      <CardHeader className="text-center pb-4">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold ${statusInfo.bgClass}`}>
          <Clock className="w-5 h-5" />
          <span className="text-base">{statusInfo.text}</span>
        </div>
        {lastActionTime && (
          <p className="text-sm text-muted-foreground mt-2">
            最終操作: {timeSinceLastAction}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-3xl font-mono font-bold">
            {hours}:{minutes.toString().padStart(2, '0')}
          </div>
          <p className="text-sm text-muted-foreground">本日の勤務時間</p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          <Button
            onClick={onClockIn}
            disabled={status !== 'not_started' && status !== 'finished'}
            className="h-16 bg-clock-in hover:bg-clock-in/90 text-white font-bold text-lg"
            data-testid="button-clock-in"
          >
            <Play className="w-6 h-6 mr-2" />
            出勤
          </Button>

          <Button
            onClick={onClockOut}
            disabled={status !== 'working' && status !== 'on_break'}
            className="h-16 bg-clock-out hover:bg-clock-out/90 text-white font-bold text-lg"
            data-testid="button-clock-out"
          >
            <Square className="w-6 h-6 mr-2" />
            退勤
          </Button>

          <Button
            onClick={onBreakStart}
            disabled={status !== 'working'}
            className="h-16 bg-break-start hover:bg-break-start/90 text-white font-bold text-lg"
            data-testid="button-break-start"
          >
            <Pause className="w-6 h-6 mr-2" />
            休憩開始
          </Button>

          <Button
            onClick={onBreakEnd}
            disabled={status !== 'on_break'}
            className="h-16 bg-break-end hover:bg-break-end/90 text-white font-bold text-lg"
            data-testid="button-break-end"
          >
            <Play className="w-6 h-6 mr-2" />
            休憩終了
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}