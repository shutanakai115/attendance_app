import { Button } from "@/components/ui/button";
import { Clock, History, Settings, Sun, Moon } from "lucide-react";
import { useState } from "react";

interface NavigationProps {
  currentPage: 'timer' | 'history' | 'settings';
  onPageChange: (page: 'timer' | 'history' | 'settings') => void;
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    console.log('Theme toggled:', !isDark ? 'dark' : 'light');
  };

  const navItems = [
    { id: 'timer' as const, label: 'タイマー', icon: Clock },
    { id: 'history' as const, label: '履歴', icon: History },
    { id: 'settings' as const, label: '設定', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-2 z-50">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => onPageChange(item.id)}
                className={`flex flex-col items-center gap-1 h-12 w-16 ${isActive ? 'bg-primary text-primary-foreground' : ''}`}
                data-testid={`nav-${item.id}`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-10 w-10"
          data-testid="button-theme-toggle"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>
    </div>
  );
}