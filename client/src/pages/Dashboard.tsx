import { useDashboardStats, useAccounts, useTopPosts, useAgentConfigs } from "@/lib/api";

export default function Dashboard() {
  const { data: stats } = useDashboardStats();
  const { data: accounts } = useAccounts();
  const { data: topPosts } = useTopPosts(3);
  const { data: agents } = useAgentConfigs();

  const statCards = [
    { label: "Total Engagement", value: stats?.totalEngagement?.toLocaleString() ?? "0", change: `${stats?.totalAccounts ?? 0} accounts`, positive: true },
    { label: "AI Generated Posts", value: stats?.aiGeneratedPosts?.toString() ?? "0", change: "total", positive: true },
    { label: "Active Agents", value: stats?.activeAgents?.toString() ?? "0", change: "Running", positive: true },
    { label: "Audience Growth", value: stats?.accountStats?.thriving?.toString() ?? "0", change: "thriving", positive: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">Your AI agents are actively managing your social presence.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl">
            <p className="text-sm font-medium text-muted-foreground mb-2">{stat.label}</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-bold">{stat.value}</h3>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 glass-card rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Top Performing Posts</h3>
          {topPosts && topPosts.length > 0 ? (
            <div className="space-y-4">
              {topPosts.map((post: any) => (
                <div key={post.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">{post.platform}</span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{post.impressions.toLocaleString()} views</span>
                  </div>
                  <p className="text-sm text-foreground/90 line-clamp-2">{post.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 border border-dashed border-white/10 rounded-xl bg-white/5">
              <p className="text-muted-foreground text-sm">No posts yet. Upload content to get started.</p>
            </div>
          )}
        </div>
        
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Agent Status</h3>
          <div className="space-y-4">
            {agents && agents.length > 0 ? agents.map((agent: any) => (
              <div key={agent.id} className="flex gap-4 items-start p-3 rounded-xl bg-white/5 border border-white/5">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${agent.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-muted-foreground'}`}></div>
                <div>
                  <p className="text-sm font-medium text-foreground">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">{agent.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{agent.status}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">No agents configured yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}