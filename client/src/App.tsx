import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import ContentLibrary from "@/pages/ContentLibrary";
import Scheduler from "@/pages/Scheduler";
import Agents from "@/pages/Agents";
import Accounts from "@/pages/Accounts";
import Analytics from "@/pages/Analytics";
import Opportunities from "@/pages/Opportunities";
import Settings from "@/pages/Settings";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard}/>
        <Route path="/accounts" component={Accounts}/>
        <Route path="/analytics" component={Analytics}/>
        <Route path="/opportunities" component={Opportunities}/>
        <Route path="/content" component={ContentLibrary}/>
        <Route path="/scheduler" component={Scheduler}/>
        <Route path="/agents" component={Agents}/>
        <Route path="/settings" component={Settings}/>
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;