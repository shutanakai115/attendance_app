import { Button } from "@/components/ui/button";
import { Clock, History, Settings, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function Navigation() {
  const [location] = useLocation();
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    console.log('Theme toggled:', !isDark ? 'dark' : 'light');
  };

  const navItems = [
    { id: 'timer' as const, label: 'タイマー', icon: Clock, path: '/' },
    { id: 'history' as const, label: '履歴', icon: History, path: '/history' },
    { id: 'settings' as const, label: '設定', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:top-0 lg:bottom-auto bg-background border-t lg:border-t-0 lg:border-b border-border px-4 py-2 z-50">
      <div className="max-w-md mx-auto lg:max-w-6xl flex items-center justify-between">
        <div className="flex items-center space-x-2 lg:space-x-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.id} href={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`flex flex-col lg:flex-row items-center gap-1 lg:gap-2 h-12 w-16 lg:w-auto lg:px-4 ${isActive ? 'bg-primary text-primary-foreground' : ''}`}
                  data-testid={`nav-${item.id}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs lg:text-sm">{item.label}</span>
                </Button>
              </Link>
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