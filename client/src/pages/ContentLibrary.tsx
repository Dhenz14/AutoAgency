import { useState } from "react";
import { FileText, Link as LinkIcon, UploadCloud, SplitSquareHorizontal, ArrowRight, CheckCircle2, MessageSquare, Twitter, FileEdit, Sparkles, Users, Settings2 } from "lucide-react";
import { useCreateContentSource, useGenerateContent, usePosts, useReplyAngles, useContentSources } from "@/lib/api";

export default function ContentLibrary() {
  const [activeTab, setActiveTab] = useState("upload");
  const [distribution, setDistribution] = useState({ short: 40, reply: 40, long: 20 });
  const [inputUrl, setInputUrl] = useState("");
  const [inputText, setInputText] = useState("");
  const [inputTitle, setInputTitle] = useState("");
  const [activeSourceId, setActiveSourceId] = useState<number | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);

  const createSource = useCreateContentSource();
  const generateContent = useGenerateContent();
  const { data: posts } = usePosts(activeSourceId ?? undefined);
  const { data: angles } = useReplyAngles(activeSourceId ?? undefined);
  const { data: sources } = useContentSources();

  const [generationResult, setGenerationResult] = useState<any>(null);

  const handleProcess = async () => {
    const sourceText = inputUrl || inputText;
    const title = inputTitle || inputUrl || "Untitled Source";
    if (!sourceText) return;

    try {
      const source = await createSource.mutateAsync({
        title,
        sourceType: inputUrl ? "url" : "text",
        sourceUrl: inputUrl || null,
        rawText: inputText || inputUrl,
        status: "processing",
        shortFormPct: distribution.short,
        replyOpsPct: distribution.reply,
        longFormPct: distribution.long,
      });

      setActiveSourceId(source.id);
      const result = await generateContent.mutateAsync(source.id);
      setGenerationResult(result);
      setActiveTab("campaign");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const isProcessing = createSource.isPending || generateContent.isPending;

  const shortPosts = posts?.filter((p: any) => p.postType === "short") ?? [];
  const longPosts = posts?.filter((p: any) => p.postType === "long") ?? [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Engine</h1>
          <p className="text-muted-foreground mt-1">Drop in a single source, let Claude multiply it across your network.</p>
        </div>
        {sources && sources.length > 0 && activeTab === "upload" && (
          <div className="flex gap-2">
            {sources.slice(0, 3).map((s: any) => (
              <button key={s.id} onClick={() => { setActiveSourceId(s.id); setActiveTab("campaign"); }}
                className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/10 transition-colors truncate max-w-[160px]">
                {s.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeTab === "upload" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card rounded-2xl p-8 border-dashed border-white/20 relative overflow-hidden">
            {isProcessing && (
              <div className="absolute inset-0 bg-background/90 backdrop-blur-md z-10 flex flex-col items-center justify-center">
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
                </div>
                <h3 className="font-bold text-xl mb-2">Claude is synthesizing...</h3>
                <p className="text-sm text-muted-foreground">Extracting ideas and generating platform-specific content.</p>
              </div>
            )}

            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                <UploadCloud className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Initialize New Campaign</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
                Paste a URL or write a raw thought. Claude will shatter it into dozens of platform-specific assets.
              </p>
              
              <div className="max-w-xl mx-auto space-y-4">
                {!showTextInput ? (
                  <>
                    <div className="flex bg-black/40 border border-white/10 rounded-xl overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all shadow-inner">
                      <div className="px-4 py-4 bg-white/5 border-r border-white/10 flex items-center justify-center">
                        <LinkIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <input value={inputUrl} onChange={e => setInputUrl(e.target.value)} type="text" placeholder="Paste a URL or topic..." className="flex-1 bg-transparent border-none outline-none px-4 text-sm text-foreground placeholder:text-muted-foreground/50" />
                      <button onClick={handleProcess} disabled={isProcessing || !inputUrl} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 font-bold transition-all disabled:opacity-50">
                        Process
                      </button>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-2 py-2">
                      <span className="h-px w-12 bg-white/10"></span><span>OR</span><span className="h-px w-12 bg-white/10"></span>
                    </div>
                    <button onClick={() => setShowTextInput(true)} className="w-full py-5 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-all flex flex-col items-center gap-3 group">
                      <SplitSquareHorizontal className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <span className="text-sm font-semibold">Raw Brain Dump</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <input value={inputTitle} onChange={e => setInputTitle(e.target.value)} type="text" placeholder="Title for this content..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50" />
                    <textarea value={inputText} onChange={e => setInputText(e.target.value)} rows={6} placeholder="Paste your article, notes, ideas..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 resize-none" />
                    <div className="flex gap-3">
                      <button onClick={() => setShowTextInput(false)} className="flex-1 py-2.5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/5">Cancel</button>
                      <button onClick={handleProcess} disabled={isProcessing || !inputText} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold disabled:opacity-50">Process with Claude</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Settings2 className="w-4 h-4 text-primary" /> Distribution Rules</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium flex items-center gap-1.5"><Twitter className="w-3.5 h-3.5 text-blue-400"/> Short-form</span>
                    <span className="text-muted-foreground font-mono">{distribution.short}%</span>
                  </div>
                  <input type="range" className="w-full accent-blue-500" value={distribution.short} onChange={(e) => setDistribution({...distribution, short: parseInt(e.target.value)})} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-emerald-400"/> Reply Ops</span>
                    <span className="text-muted-foreground font-mono">{distribution.reply}%</span>
                  </div>
                  <input type="range" className="w-full accent-emerald-500" value={distribution.reply} onChange={(e) => setDistribution({...distribution, reply: parseInt(e.target.value)})} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium flex items-center gap-1.5"><FileEdit className="w-3.5 h-3.5 text-purple-400"/> Long-form</span>
                    <span className="text-muted-foreground font-mono">{distribution.long}%</span>
                  </div>
                  <input type="range" className="w-full accent-purple-500" value={distribution.long} onChange={(e) => setDistribution({...distribution, long: parseInt(e.target.value)})} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "campaign" && (
        <div className="space-y-6">
          <button onClick={() => setActiveTab("upload")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back to Upload</button>
          
          {generationResult && (
            <div className="glass-card rounded-2xl p-6 border-l-4 border-l-emerald-500">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md uppercase tracking-wider flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Processed</span>
              </div>
              <div className="flex gap-6 mt-4">
                <div className="text-center"><p className="text-3xl font-bold text-blue-400">{generationResult.posts}</p><p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Posts</p></div>
                <div className="w-px bg-white/10"></div>
                <div className="text-center"><p className="text-3xl font-bold text-emerald-400">{generationResult.replyAngles}</p><p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Replies</p></div>
                <div className="w-px bg-white/10"></div>
                <div className="text-center"><p className="text-3xl font-bold text-purple-400">{generationResult.longFormDrafts}</p><p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Articles</p></div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 pb-2 border-b border-white/10"><Twitter className="w-4 h-4 text-blue-400" /> Feed Posts</h3>
              {shortPosts.length > 0 ? shortPosts.map((post: any) => (
                <div key={post.id} className="glass-card p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors">
                  <p className="text-sm text-foreground/90 leading-relaxed">{post.content}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">No posts generated yet.</p>}
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 pb-2 border-b border-white/10"><MessageSquare className="w-4 h-4 text-emerald-400" /> Reply Angles</h3>
              {angles && angles.length > 0 ? angles.map((a: any) => (
                <div key={a.id} className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1 block">Trigger: {a.trigger}</span>
                  <p className="text-sm font-medium text-foreground/90">{a.angle}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">No reply angles yet.</p>}
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 pb-2 border-b border-white/10"><FileEdit className="w-4 h-4 text-purple-400" /> Long-form</h3>
              {longPosts.length > 0 ? longPosts.map((post: any) => (
                <div key={post.id} className="glass-card p-5 rounded-xl border border-white/5 hover:border-purple-500/30 transition-colors">
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap line-clamp-6">{post.content}</p>
                  <button className="mt-3 w-full py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg text-sm font-bold border border-purple-500/20 flex items-center justify-center gap-2">
                    Review <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )) : <p className="text-sm text-muted-foreground">No articles generated.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}