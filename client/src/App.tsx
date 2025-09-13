import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/Navigation";
import TimerPage from "@/pages/TimerPage";
import HistoryPage from "@/pages/HistoryPage";
import HistoryDetailPage from "@/pages/HistoryDetailPage";
import SettingsPage from "@/pages/SettingsPage";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Switch>
            <Route path="/" component={TimerPage} />
            <Route path="/history" component={HistoryPage} />
            <Route path="/history/:id" component={HistoryDetailPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route component={TimerPage} /> {/* Default route */}
          </Switch>
          <Navigation />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;