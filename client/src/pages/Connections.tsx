export default function Connections() {
  const platforms = [
    { name: "X (Twitter)", connected: true, handle: "@autoagency", icon: "X" },
    { name: "Instagram", connected: false, icon: "Ig" },
    { name: "LinkedIn", connected: true, handle: "AutoAgency SaaS", icon: "In" },
    { name: "Hive", connected: false, icon: "🐝" },
    { name: "Medium", connected: false, icon: "M" },
    { name: "Reddit", connected: false, icon: "R" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Social Connections</h1>
        <p className="text-muted-foreground">Connect your accounts for the AI to manage.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-lg border border-white/10">
                {platform.icon}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{platform.name}</h3>
                {platform.connected ? (
                  <p className="text-xs text-primary">{platform.handle}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Not connected</p>
                )}
              </div>
            </div>
            <button className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              platform.connected 
                ? 'bg-white/5 text-foreground hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/50 border border-white/10' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}>
              {platform.connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}