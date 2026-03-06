import { useState } from "react";
import { Search, Filter, MoreHorizontal, TrendingUp, TrendingDown, Settings2, SlidersHorizontal, Sparkles, Plus, X } from "lucide-react";
import { useAccounts, useAccountStats, useCreateAccount, useUpdateAccount, useDeleteAccount, useAnalyzeAccount } from "@/lib/api";

export default function Accounts() {
  const { data: accounts, isLoading } = useAccounts();
  const { data: stats } = useAccountStats();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();
  const analyzeAccount = useAnalyzeAccount();
  
  const [tuningAccount, setTuningAccount] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newAccount, setNewAccount] = useState({ handle: "", niche: "General", platform: "x" });

  const handleAnalyze = async (acc: any) => {
    setTuningAccount(acc);
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await analyzeAccount.mutateAsync(acc.id);
      setAnalysis(result);
    } catch (err: any) {
      setAnalysis({ recommendation: err.message, suggestedNichePivot: "N/A", formatAdvice: "N/A" });
    }
    setAnalyzing(false);
  };

  const handleAddAccount = async () => {
    if (!newAccount.handle) return;
    await createAccount.mutateAsync(newAccount);
    setNewAccount({ handle: "", niche: "General", platform: "x" });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Fleet</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor your army of automated accounts.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAdd(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Account
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-5 rounded-xl border-l-4 border-l-blue-500">
          <p className="text-sm font-medium text-muted-foreground">Total Accounts</p>
          <h3 className="text-2xl font-bold mt-1">{stats?.total ?? 0}</h3>
        </div>
        <div className="glass-card p-5 rounded-xl border-l-4 border-l-emerald-500">
          <p className="text-sm font-medium text-muted-foreground">Thriving</p>
          <h3 className="text-2xl font-bold mt-1">{stats?.thriving ?? 0}</h3>
        </div>
        <div className="glass-card p-5 rounded-xl border-l-4 border-l-amber-500">
          <p className="text-sm font-medium text-muted-foreground">Needs Tuning</p>
          <h3 className="text-2xl font-bold mt-1">{stats?.needsTuning ?? 0}</h3>
        </div>
        <div className="glass-card p-5 rounded-xl border-l-4 border-l-rose-500">
          <p className="text-sm font-medium text-muted-foreground">Critical</p>
          <h3 className="text-2xl font-bold mt-1">{stats?.critical ?? 0}</h3>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden flex flex-col relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-muted-foreground bg-white/5">
                <th className="px-6 py-4 font-semibold">Account</th>
                <th className="px-6 py-4 font-semibold">Platform</th>
                <th className="px-6 py-4 font-semibold">Niche</th>
                <th className="px-6 py-4 font-semibold">Impressions</th>
                <th className="px-6 py-4 font-semibold">Growth</th>
                <th className="px-6 py-4 font-semibold">Health</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">Loading accounts...</td></tr>
              ) : accounts && accounts.length > 0 ? accounts.map((acc: any) => (
                <tr key={acc.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                        {acc.handle.charAt(0) === '@' ? acc.handle.charAt(1).toUpperCase() : acc.handle.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-foreground">{acc.handle}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground capitalize">{acc.platform}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md bg-white/10 text-xs font-medium text-muted-foreground">{acc.niche}</span>
                  </td>
                  <td className="px-6 py-4 font-medium">{acc.impressions.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1 text-sm font-medium ${acc.growth.startsWith('+') ? 'text-emerald-400' : acc.growth.startsWith('-') ? 'text-rose-400' : 'text-muted-foreground'}`}>
                      {acc.growth.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : acc.growth.startsWith('-') ? <TrendingDown className="w-3 h-3" /> : null}
                      {acc.growth}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        acc.health === 'Viral' ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' :
                        ['Excellent','Good'].includes(acc.health) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' :
                        acc.health === 'Needs Tuning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' :
                        'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                      }`}></div>
                      <span className="text-sm text-muted-foreground">{acc.health}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button onClick={() => handleAnalyze(acc)} className="text-xs bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 px-3 py-1.5 rounded-lg font-medium transition-colors border border-amber-500/30 flex items-center gap-1">
                      <Settings2 className="w-3 h-3" /> AI Tune
                    </button>
                    <button onClick={() => deleteAccount.mutate(acc.id)} className="p-1.5 text-muted-foreground hover:text-rose-400 rounded-md hover:bg-white/10 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">No accounts yet. Click "Add Account" to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Account Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="font-bold text-lg">Add Account</h3>
              <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Handle</label>
                <input value={newAccount.handle} onChange={e => setNewAccount({...newAccount, handle: e.target.value})} placeholder="@username" className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Platform</label>
                <select value={newAccount.platform} onChange={e => setNewAccount({...newAccount, platform: e.target.value})} className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none">
                  <option value="x">X (Twitter)</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="medium">Medium</option>
                  <option value="reddit">Reddit</option>
                  <option value="hive">Hive</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Niche</label>
                <input value={newAccount.niche} onChange={e => setNewAccount({...newAccount, niche: e.target.value})} placeholder="Tech/AI" className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={handleAddAccount} disabled={createAccount.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg text-sm font-bold transition-colors">
                {createAccount.isPending ? "Adding..." : "Add Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Tuning Modal */}
      {tuningAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-lg">AI Analysis</h3>
              </div>
              <button onClick={() => { setTuningAccount(null); setAnalysis(null); }} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div>
                  <p className="text-sm font-medium text-amber-400">Account</p>
                  <p className="text-lg font-bold">{tuningAccount.handle}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-amber-400">{tuningAccount.impressions.toLocaleString()} impressions</p>
                  <p className="text-sm font-medium">{tuningAccount.health}</p>
                </div>
              </div>

              {analyzing ? (
                <div className="flex flex-col items-center py-8">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-sm text-muted-foreground">Claude is analyzing this account...</p>
                </div>
              ) : analysis ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-sm font-semibold text-primary mb-1 flex items-center gap-1"><Sparkles className="w-4 h-4" /> Recommendation</p>
                    <p className="text-sm text-primary/90 leading-relaxed">{analysis.recommendation}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm font-semibold mb-1">Niche Strategy</p>
                    <p className="text-sm text-muted-foreground">{analysis.suggestedNichePivot}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm font-semibold mb-1">Format Advice</p>
                    <p className="text-sm text-muted-foreground">{analysis.formatAdvice}</p>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex justify-end">
              <button onClick={() => { setTuningAccount(null); setAnalysis(null); }} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}