import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/Navigation";
import TimerPage from "@/pages/TimerPage";
import HistoryPage from "@/pages/HistoryPage";
import SettingsPage from "@/pages/SettingsPage";

function App() {
  const [currentPage, setCurrentPage] = useState<'timer' | 'history' | 'settings'>('timer');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'timer':
        return <TimerPage />;
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <TimerPage />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          {renderCurrentPage()}
          <Navigation 
            currentPage={currentPage} 
            onPageChange={setCurrentPage}
          />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;