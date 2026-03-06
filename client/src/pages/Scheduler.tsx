import { CheckSquare, Clock, AlertTriangle } from "lucide-react";
import { useScheduledPosts, useUpdatePost } from "@/lib/api";

export default function Scheduler() {
  const { data: scheduled, isLoading } = useScheduledPosts();
  const updatePost = useUpdatePost();

  const pendingPosts = scheduled?.filter((p: any) => p.status === 'pending_approval' || p.status === 'draft' || p.status === 'scheduled') ?? [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Post Scheduler</h1>
          <p className="text-muted-foreground mt-1">Review, approve, and manage the AI's posting queue across your fleet.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              pendingPosts.filter((p: any) => p.status === 'draft').forEach((p: any) => {
                updatePost.mutate({ id: p.id, status: 'scheduled' });
              });
            }}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
          >
            <CheckSquare className="w-4 h-4" /> Approve All Drafts
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-semibold mb-6">Post Queue</h3>
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : pendingPosts.length > 0 ? pendingPosts.map((post: any) => (
            <div key={post.id} className="flex flex-col md:flex-row gap-4 justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    post.platform === 'x' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {post.platform}
                  </span>
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-muted-foreground">{post.postType}</span>
                </div>
                <p className="text-sm text-foreground/90 line-clamp-2">{post.content}</p>
              </div>
              <div className="flex flex-col items-end justify-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  post.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400' :
                  post.status === 'draft' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-white/10 text-muted-foreground'
                }`}>
                  {post.status}
                </span>
                {post.status === 'draft' && (
                  <div className="flex gap-2">
                    <button onClick={() => updatePost.mutate({ id: post.id, status: 'scheduled' })} className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-bold shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <p className="text-muted-foreground text-center py-8">No posts in queue. Generate content from the Content Engine.</p>
          )}
        </div>
      </div>
    </div>
  );
}