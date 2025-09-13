import { useState } from 'react';
import SettingsPanel from '@/components/SettingsPanel';
import { Settings } from '@shared/schema';

export default function SettingsPage() {
  // todo: remove mock functionality
  const [settings, setSettings] = useState<Settings>({
    id: 'main',
    hourlyRate: 3000,
    overtimeRate: 3750,
    targetHoursPerDay: 480, // 8 hours in minutes
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const handleSave = (updatedSettings: Partial<Settings>) => {
    // todo: implement real save functionality
    setSettings(prev => ({
      ...prev,
      ...updatedSettings,
      updatedAt: new Date(),
    }));
    
    // Simulate localStorage save
    localStorage.setItem('timeTracker_settings', JSON.stringify({
      ...settings,
      ...updatedSettings,
      updatedAt: new Date(),
    }));
    
    console.log('Settings updated and saved to localStorage:', updatedSettings);
  };

  return (
    <div className="min-h-screen bg-background pb-20 px-4">
      <div className="max-w-md mx-auto pt-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            設定
          </h1>
          <p className="text-sm text-muted-foreground">
            時給と勤務時間の設定
          </p>
        </div>

        <SettingsPanel 
          settings={settings} 
          onSave={handleSave}
        />

        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>設定はブラウザに保存されます</p>
          <p>バージョン: 1.0.0 (MVP)</p>
        </div>
      </div>
    </div>
  );
}