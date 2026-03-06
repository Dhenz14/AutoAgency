import { useState } from "react";
import { MessageSquarePlus, Zap, Eye, Clock, ArrowRight, User, Plus } from "lucide-react";
import { useReplyOpportunities, useCreateReplyOpportunity, useGenerateReplyForOpportunity, useUpdateReplyOpportunity, useAccounts } from "@/lib/api";

export default function Opportunities() {
  const { data: opportunities, isLoading } = useReplyOpportunities();
  const { data: accounts } = useAccounts();
  const createOpp = useCreateReplyOpportunity();
  const generateReply = useGenerateReplyForOpportunity();
  const updateOpp = useUpdateReplyOpportunity();
  const [showAdd, setShowAdd] = useState(false);
  const [newOpp, setNewOpp] = useState({ targetHandle: "", targetFollowers: "0", tweetContent: "", tweetViews: "0", niche: "General", sentiment: "Neutral" });

  const handleCreate = async () => {
    if (!newOpp.targetHandle || !newOpp.tweetContent) return;
    const created = await createOpp.mutateAsync(newOpp);
    try { await generateReply.mutateAsync(created.id); } catch {}
    setNewOpp({ targetHandle: "", targetFollowers: "0", tweetContent: "", tweetViews: "0", niche: "General", sentiment: "Neutral" });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Reply Ops <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          </h1>
          <p className="text-muted-foreground mt-1">Monitor viral threads and inject your accounts with AI-crafted replies.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAdd(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Opportunity
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">Loading opportunities...</p>
        ) : opportunities && opportunities.length > 0 ? opportunities.map((opp: any) => (
          <div key={opp.id} className="glass-card rounded-2xl p-0 overflow-hidden border border-white/10 shadow-lg">
            <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-foreground">{opp.targetHandle}</span>
                  <span className="text-xs text-muted-foreground bg-white/10 px-2 py-0.5 rounded-full">{opp.targetFollowers} followers</span>
                </div>
                <p className="text-lg text-foreground/90 font-medium">"{opp.tweetContent}"</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {opp.tweetViews}</span>
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md">{opp.niche}</span>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-background to-blue-950/10 relative">
              {opp.aiReply ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-primary">AI Reply</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${opp.status === 'fired' ? 'bg-emerald-500/20 text-emerald-400' : opp.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {opp.status}
                    </span>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-4 font-mono text-sm text-foreground/90 shadow-inner">
                    {opp.aiReply}
                  </div>
                  {opp.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => updateOpp.mutate({ id: opp.id, status: 'rejected' })} className="px-4 py-2 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 border border-white/10 rounded-lg text-sm font-medium transition-colors">Reject</button>
                      <button onClick={() => updateOpp.mutate({ id: opp.id, status: 'fired' })} className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(59,130,246,0.4)] flex items-center gap-2">
                        Fire Reply <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <button 
                    onClick={() => generateReply.mutate(opp.id)} 
                    disabled={generateReply.isPending}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                  >
                    {generateReply.isPending ? "Generating..." : "Generate AI Reply"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )) : (
          <div className="glass-card rounded-2xl p-12 text-center">
            <p className="text-muted-foreground">No opportunities yet. Add one manually or wait for the Reply Agent to find viral threads.</p>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="font-bold text-lg">Add Reply Opportunity</h3>
              <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Target Handle</label>
                  <input value={newOpp.targetHandle} onChange={e => setNewOpp({...newOpp, targetHandle: e.target.value})} placeholder="@elonmusk" className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Followers</label>
                  <input value={newOpp.targetFollowers} onChange={e => setNewOpp({...newOpp, targetFollowers: e.target.value})} placeholder="2.8M" className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Tweet Content</label>
                <textarea value={newOpp.tweetContent} onChange={e => setNewOpp({...newOpp, tweetContent: e.target.value})} rows={3} placeholder="Paste the viral tweet..." className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Niche</label>
                  <input value={newOpp.niche} onChange={e => setNewOpp({...newOpp, niche: e.target.value})} placeholder="AI" className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Views</label>
                  <input value={newOpp.tweetViews} onChange={e => setNewOpp({...newOpp, tweetViews: e.target.value})} placeholder="1.2M" className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10">Cancel</button>
              <button onClick={handleCreate} disabled={createOpp.isPending || generateReply.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg text-sm font-bold">
                {createOpp.isPending || generateReply.isPending ? "Creating..." : "Add & Generate Reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}