import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Save, DollarSign, Clock, Target } from "lucide-react";
import { Settings } from "@shared/schema";

interface SettingsPanelProps {
  settings: Settings;
  onSave: (settings: Partial<Settings>) => void;
}

export default function SettingsPanel({ settings, onSave }: SettingsPanelProps) {
  const [hourlyRate, setHourlyRate] = useState(settings.hourlyRate.toString());
  const [overtimeRate, setOvertimeRate] = useState(settings.overtimeRate.toString());
  const [targetHours, setTargetHours] = useState((settings.targetHoursPerDay / 60).toString());

  const handleSave = () => {
    const updatedSettings = {
      hourlyRate: parseFloat(hourlyRate) || 0,
      overtimeRate: parseFloat(overtimeRate) || 0,
      targetHoursPerDay: (parseFloat(targetHours) || 0) * 60, // Convert hours to minutes
    };
    
    onSave(updatedSettings);
    console.log('Settings saved:', updatedSettings);
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value) || 0;
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5" />
          設定
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="hourlyRate" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            時給 (円)
          </Label>
          <Input
            id="hourlyRate"
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            placeholder="3000"
            data-testid="input-hourly-rate"
          />
          <p className="text-xs text-muted-foreground">
            現在: {formatCurrency(hourlyRate)}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="overtimeRate" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            残業時給 (円)
          </Label>
          <Input
            id="overtimeRate"
            type="number"
            value={overtimeRate}
            onChange={(e) => setOvertimeRate(e.target.value)}
            placeholder="3750"
            data-testid="input-overtime-rate"
          />
          <p className="text-xs text-muted-foreground">
            現在: {formatCurrency(overtimeRate)}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetHours" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            1日の目標時間
          </Label>
          <Input
            id="targetHours"
            type="number"
            step="0.5"
            value={targetHours}
            onChange={(e) => setTargetHours(e.target.value)}
            placeholder="8"
            data-testid="input-target-hours"
          />
          <p className="text-xs text-muted-foreground">
            現在: {parseFloat(targetHours) || 0}時間
          </p>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            月収シミュレーション
          </h4>
          <div className="text-sm text-muted-foreground">
            <p>20日働いた場合: {formatCurrency((parseFloat(hourlyRate) * parseFloat(targetHours) * 20).toString())}</p>
            <p>25日働いた場合: {formatCurrency((parseFloat(hourlyRate) * parseFloat(targetHours) * 25).toString())}</p>
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          className="w-full"
          data-testid="button-save-settings"
        >
          <Save className="w-4 h-4 mr-2" />
          設定を保存
        </Button>
      </CardContent>
    </Card>
  );
}