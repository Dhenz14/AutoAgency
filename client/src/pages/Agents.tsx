import { useState } from "react";
import { useAgentConfigs, useCreateAgentConfig, useUpdateAgentConfig } from "@/lib/api";
import { Plus } from "lucide-react";

export default function Agents() {
  const { data: agents, isLoading } = useAgentConfigs();
  const createAgent = useCreateAgentConfig();
  const updateAgent = useUpdateAgentConfig();
  const [showAdd, setShowAdd] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: "", description: "", icon: "bot", status: "Active" });

  const handleCreate = async () => {
    if (!newAgent.name) return;
    await createAgent.mutateAsync(newAgent);
    setNewAgent({ name: "", description: "", icon: "bot", status: "Active" });
    setShowAdd(false);
  };

  const defaultAgents = [
    { name: "Content Agent", description: "Extracts ideas and drafts posts across platforms.", icon: "pencil", status: "Active" },
    { name: "Reply Agent", description: "Monitors keywords and engages intelligently.", icon: "message", status: "Active" },
    { name: "Research Agent", description: "Scans for trending topics and viral formats.", icon: "search", status: "Sleeping" },
    { name: "Strategy Agent", description: "Coordinates posting times and overarching narrative.", icon: "brain", status: "Active" },
  ];

  const seedDefaults = async () => {
    for (const agent of defaultAgents) {
      await createAgent.mutateAsync(agent);
    }
  };

  const iconMap: Record<string, string> = { pencil: "✍️", message: "💬", search: "🔍", brain: "🧠", bot: "🤖" };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Agent Hive</h1>
          <p className="text-muted-foreground">Manage and configure your autonomous social media team.</p>
        </div>
        <div className="flex gap-3">
          {agents && agents.length === 0 && (
            <button onClick={seedDefaults} disabled={createAgent.isPending} className="bg-white/10 hover:bg-white/20 text-foreground px-4 py-2 rounded-lg font-medium text-sm transition-colors border border-white/10">
              {createAgent.isPending ? "Seeding..." : "Load Default Agents"}
            </button>
          )}
          <button onClick={() => setShowAdd(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Agent
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <p className="text-muted-foreground col-span-2 text-center py-8">Loading agents...</p>
        ) : agents && agents.length > 0 ? agents.map((agent: any) => (
          <div key={agent.id} className="glass-card rounded-2xl p-6 group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl border border-white/10 group-hover:bg-white/10 transition-colors">
                  {iconMap[agent.icon] || "🤖"}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{agent.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className={`w-2 h-2 rounded-full ${agent.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-muted-foreground'}`}></div>
                    <span className="text-xs text-muted-foreground">{agent.status}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => updateAgent.mutate({ id: agent.id, status: agent.status === 'Active' ? 'Sleeping' : 'Active' })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  agent.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 hover:bg-rose-500/20 hover:text-rose-400' : 'bg-blue-500/20 text-blue-400 hover:bg-emerald-500/20 hover:text-emerald-400'
                }`}
              >
                {agent.status === 'Active' ? 'Pause' : 'Activate'}
              </button>
            </div>
            <p className="text-sm text-muted-foreground">{agent.description}</p>
          </div>
        )) : (
          <p className="text-muted-foreground col-span-2 text-center py-8">No agents configured. Click "Load Default Agents" to get started.</p>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="font-bold text-lg">Create Agent</h3>
              <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Name</label>
                <input value={newAgent.name} onChange={e => setNewAgent({...newAgent, name: e.target.value})} placeholder="Content Agent" className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Description</label>
                <input value={newAgent.description} onChange={e => setNewAgent({...newAgent, description: e.target.value})} placeholder="What does this agent do?" className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10">Cancel</button>
              <button onClick={handleCreate} disabled={createAgent.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg text-sm font-bold">
                {createAgent.isPending ? "Creating..." : "Create Agent"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}