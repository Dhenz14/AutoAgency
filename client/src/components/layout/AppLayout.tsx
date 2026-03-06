import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Library, 
  CalendarDays, 
  Bot, 
  Settings,
  Bell,
  Search,
  Sparkles,
  Users,
  LineChart,
  MessageSquarePlus,
  Power
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const [systemActive, setSystemActive] = useState(true);

  const navItems = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Account Fleet", href: "/accounts", icon: Users },
    { name: "AI Analytics", href: "/analytics", icon: LineChart },
    { name: "Reply Ops", href: "/opportunities", icon: MessageSquarePlus },
    { name: "Content Engine", href: "/content", icon: Library },
    { name: "Post Scheduler", href: "/scheduler", icon: CalendarDays },
    { name: "AI Agents", href: "/agents", icon: Bot },
  ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      <div className="absolute inset-0 bg-noise z-0"></div>
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-background/80 backdrop-blur-xl flex flex-col z-10">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">AutoAgency</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-primary" : ""}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="glass-card rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">System Status</span>
              <button 
                onClick={() => setSystemActive(!systemActive)}
                className={`p-1.5 rounded-md transition-colors ${systemActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}
                title={systemActive ? "System Active - Click to Pause" : "System Paused - Click to Resume"}
              >
                <Power className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border border-white/10">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>User</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Agency Admin</span>
                <span className="text-xs text-muted-foreground">Fleet Plan</span>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-start gap-2 bg-white/5 border-white/10 hover:bg-white/10 text-foreground" onClick={() => window.location.href='/settings'}>
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col z-10 overflow-hidden relative">
        {!systemActive && (
          <div className="w-full bg-rose-500/20 text-rose-400 border-b border-rose-500/30 px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 z-30">
            <Power className="w-4 h-4" />
            AUTOMATION PAUSED: All agents are currently asleep. No posts or replies will be sent.
          </div>
        )}
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 glass z-20 sticky top-0">
          <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-full border border-white/10 w-96 transition-all focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Ask AI to find a trend or account..." 
              className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <Button size="icon" variant="ghost" className="rounded-full border-white/10 hover:bg-white/10 text-foreground relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </Button>
            <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 font-semibold shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <Sparkles className="w-4 h-4 mr-2" />
              Deploy Agent
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}