import SettingsPanel from '../SettingsPanel';
import { Settings } from "@shared/schema";

export default function SettingsPanelExample() {
  // todo: remove mock functionality
  const mockSettings: Settings = {
    id: 'main',
    hourlyRate: 3000,
    overtimeRate: 3750,
    targetHoursPerDay: 480, // 8 hours in minutes
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const handleSave = (updatedSettings: Partial<Settings>) => {
    console.log('Settings saved:', updatedSettings);
  };

  return (
    <SettingsPanel 
      settings={mockSettings} 
      onSave={handleSave}
    />
  );
}