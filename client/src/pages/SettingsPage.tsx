import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SettingsPanel from '@/components/SettingsPanel';
import { Settings } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { saveSettings, loadSettings } from '@/lib/localStorage';

export default function SettingsPage() {
  const queryClient = useQueryClient();

  // Get settings from API with localStorage fallback
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          return {
            ...data,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt)
          };
        }
        throw new Error('API not available');
      } catch {
        // Fallback to localStorage or default settings
        const localSettings = loadSettings();
        if (localSettings) {
          return localSettings;
        }
        return {
          id: 'main',
          hourlyRate: 3000,
          overtimeRate: 3750,
          targetHoursPerDay: 480,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: Partial<Settings>) => {
      try {
        const response = await apiRequest('PATCH', '/api/settings', updatedSettings);
        return await response.json();
      } catch {
        // Fallback to localStorage
        if (settings) {
          const newSettings = {
            ...settings,
            ...updatedSettings,
            updatedAt: new Date(),
          };
          saveSettings(newSettings);
          return newSettings;
        }
        throw new Error('Settings not available');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      console.log('Settings updated successfully');
    },
  });

  const handleSave = (updatedSettings: Partial<Settings>) => {
    updateSettingsMutation.mutate(updatedSettings);
  };

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen bg-background pb-20 px-4 lg:px-8 xl:px-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 px-4 lg:px-8 xl:px-12">
      <div className="max-w-md mx-auto pt-6 space-y-6 lg:max-w-2xl lg:pt-8 xl:pt-12">
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