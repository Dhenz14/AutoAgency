import { useState } from "react";
import { Key, Bot, Shield, Save, CheckCircle2, Zap, AlertTriangle } from "lucide-react";
import { useHealthCheck } from "@/lib/api";

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const { data: health } = useHealthCheck();

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your AI provider and agent behaviors.</p>
      </div>

      <div className="grid gap-6">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
            <Key className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Claude API Key</h2>
          </div>

          {health?.aiConfigured ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-emerald-400">API Key Configured</p>
                <p className="text-xs text-emerald-400/80">Your Anthropic API key is set and ready to use.</p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-400">API Key Not Set (TODO)</p>
                <p className="text-xs text-amber-400/80 mt-1">
                  Add your <code className="bg-black/30 px-1 rounded">ANTHROPIC_API_KEY</code> in the Secrets tab (lock icon in the sidebar). 
                  Get yours from <a href="https://console.anthropic.com/settings/keys" target="_blank" className="underline">console.anthropic.com</a>.
                  AI features (content generation, reply drafting, account analysis) won't work until this is configured.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
            <Bot className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-semibold">Global System Prompt</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center justify-between text-sm font-semibold text-foreground mb-2">
                <span>Base Persona (Applied to all agents)</span>
              </label>
              <textarea 
                className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-foreground/90 focus:border-primary/50 outline-none font-mono leading-relaxed"
                defaultValue={`You are a highly intelligent, slightly cynical but deeply optimistic tech operator. You never use hashtags like #tech or #innovation. You write in short, punchy sentences. You avoid generic AI words like "delve", "testament", or "tapestry". When you disagree, you do so with raw data or structural logic, never emotion.`}
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Safety Guardrails</label>
                <div className="space-y-2 bg-white/5 p-4 rounded-xl border border-white/10">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="accent-primary" defaultChecked /> Do not engage in political threads
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="accent-primary" defaultChecked /> Auto-skip posts with negative sentiment
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="accent-primary" defaultChecked /> Maintain brand safety mode
                  </label>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Architecture</label>
                <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 h-[116px] flex flex-col justify-center">
                  <p className="text-sm font-medium text-primary mb-2 flex items-center gap-1">
                    <Zap className="w-4 h-4" /> Claude Sonnet 4 Active
                  </p>
                  <p className="text-xs text-primary/80">
                    All AI operations (content generation, reply drafting, account analysis) are powered by Claude.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              saved 
                ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(59,130,246,0.3)]'
            }`}
          >
            {saved ? (
              <><CheckCircle2 className="w-4 h-4" /> Saved</>
            ) : (
              <><Save className="w-4 h-4" /> Save Configuration</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}