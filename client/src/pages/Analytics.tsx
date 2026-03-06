import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, TrendingUp, Target, Zap } from 'lucide-react';
import { useDashboardStats, useTopPosts, useAccounts } from '@/lib/api';

export default function Analytics() {
  const { data: stats } = useDashboardStats();
  const { data: topPosts } = useTopPosts(5);
  const { data: accounts } = useAccounts();

  const impressionData = [
    { name: 'Mon', value: Math.floor(Math.random() * 5000) + 2000 },
    { name: 'Tue', value: Math.floor(Math.random() * 5000) + 2000 },
    { name: 'Wed', value: Math.floor(Math.random() * 5000) + 2000 },
    { name: 'Thu', value: Math.floor(Math.random() * 5000) + 2000 },
    { name: 'Fri', value: Math.floor(Math.random() * 5000) + 2000 },
    { name: 'Sat', value: Math.floor(Math.random() * 5000) + 2000 },
    { name: 'Sun', value: Math.floor(Math.random() * 5000) + 2000 },
  ];

  const aiInsights = [
    {
      title: "Trend Alert: 'Autonomous Agents'",
      description: "This topic is gaining momentum. Recommend prioritizing agent-related content for the next 48 hours.",
      impact: "High Impact",
      type: "trend"
    },
    {
      title: "Format Optimization",
      description: "Short-form posts are outperforming threads by 2.4x. Recommend increasing hot takes output.",
      impact: "Medium Impact",
      type: "format"
    },
    {
      title: "Account Health Alert",
      description: `${stats?.accountStats?.needsTuning ?? 0} accounts need attention. Consider running AI analysis on underperformers.`,
      impact: "Action Required",
      type: "alert"
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Analytics & Insights</h1>
        <p className="text-muted-foreground mt-1">Performance data and AI-driven growth recommendations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 glass-card rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-semibold">Network Impressions</h3>
              <p className="text-sm text-muted-foreground">Total: {stats?.totalEngagement?.toLocaleString() ?? 0}</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={impressionData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(210, 100%, 50%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(210, 100%, 50%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                <Area type="monotone" dataKey="value" stroke="hsl(210, 100%, 50%)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 flex flex-col">
          <h3 className="font-semibold mb-1">Top Posts</h3>
          <p className="text-sm text-muted-foreground mb-6">By impressions</p>
          <div className="space-y-4 flex-1 overflow-y-auto">
            {topPosts && topPosts.length > 0 ? topPosts.map((post: any) => (
              <div key={post.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-primary font-medium">{post.platform}</span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {post.impressions.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 line-clamp-2">{post.content}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground">No posts yet.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3">
          <h3 className="font-semibold text-xl mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> AI Strategy Recommendations</h3>
        </div>
        {aiInsights.map((insight, i) => (
          <div key={i} className={`glass-card p-6 rounded-2xl border-t-4 ${
            insight.type === 'trend' ? 'border-t-blue-500' : insight.type === 'format' ? 'border-t-purple-500' : 'border-t-rose-500'
          }`}>
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 rounded-lg ${insight.type === 'trend' ? 'bg-blue-500/20 text-blue-400' : insight.type === 'format' ? 'bg-purple-500/20 text-purple-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {insight.type === 'trend' ? <TrendingUp className="w-5 h-5" /> : insight.type === 'format' ? <Target className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${insight.impact === 'High Impact' ? 'bg-emerald-500/20 text-emerald-400' : insight.impact === 'Action Required' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {insight.impact}
              </span>
            </div>
            <h4 className="font-semibold mb-2">{insight.title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}