import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "./queryClient";

async function apiRequest(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function useAccounts() {
  return useQuery({ queryKey: ["/api/accounts"], queryFn: () => apiRequest("/api/accounts") });
}

export function useAccountStats() {
  return useQuery({ queryKey: ["/api/accounts/stats"], queryFn: () => apiRequest("/api/accounts/stats") });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiRequest("/api/accounts", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/accounts"] }); qc.invalidateQueries({ queryKey: ["/api/accounts/stats"] }); },
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/accounts/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/accounts"] }); },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiRequest(`/api/accounts/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/accounts"] }); qc.invalidateQueries({ queryKey: ["/api/accounts/stats"] }); },
  });
}

export function useAnalyzeAccount() {
  return useMutation({
    mutationFn: (id: number) => apiRequest(`/api/accounts/${id}/analyze`, { method: "POST" }),
  });
}

export function useContentSources() {
  return useQuery({ queryKey: ["/api/content-sources"], queryFn: () => apiRequest("/api/content-sources") });
}

export function useCreateContentSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiRequest("/api/content-sources", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/content-sources"] }); },
  });
}

export function useGenerateContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiRequest(`/api/content-sources/${id}/generate`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/posts"] });
      qc.invalidateQueries({ queryKey: ["/api/reply-angles"] });
      qc.invalidateQueries({ queryKey: ["/api/content-sources"] });
    },
  });
}

export function usePosts(contentSourceId?: number) {
  const url = contentSourceId ? `/api/posts?contentSourceId=${contentSourceId}` : "/api/posts";
  return useQuery({ queryKey: ["/api/posts", contentSourceId], queryFn: () => apiRequest(url) });
}

export function useTopPosts(limit = 10) {
  return useQuery({ queryKey: ["/api/posts/top", limit], queryFn: () => apiRequest(`/api/posts/top?limit=${limit}`) });
}

export function useScheduledPosts() {
  return useQuery({ queryKey: ["/api/posts/scheduled"], queryFn: () => apiRequest("/api/posts/scheduled") });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/posts/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/posts"] }); qc.invalidateQueries({ queryKey: ["/api/posts/scheduled"] }); },
  });
}

export function useReplyAngles(contentSourceId?: number) {
  const url = contentSourceId ? `/api/reply-angles?contentSourceId=${contentSourceId}` : "/api/reply-angles";
  return useQuery({ queryKey: ["/api/reply-angles", contentSourceId], queryFn: () => apiRequest(url) });
}

export function useReplyOpportunities() {
  return useQuery({ queryKey: ["/api/reply-opportunities"], queryFn: () => apiRequest("/api/reply-opportunities") });
}

export function useCreateReplyOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiRequest("/api/reply-opportunities", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/reply-opportunities"] }); },
  });
}

export function useGenerateReplyForOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiRequest(`/api/reply-opportunities/${id}/generate-reply`, { method: "POST" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/reply-opportunities"] }); },
  });
}

export function useUpdateReplyOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/reply-opportunities/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/reply-opportunities"] }); },
  });
}

export function useAgentConfigs() {
  return useQuery({ queryKey: ["/api/agents"], queryFn: () => apiRequest("/api/agents") });
}

export function useCreateAgentConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiRequest("/api/agents", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/agents"] }); },
  });
}

export function useUpdateAgentConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/agents/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/agents"] }); },
  });
}

export function useDashboardStats() {
  return useQuery({ queryKey: ["/api/dashboard/stats"], queryFn: () => apiRequest("/api/dashboard/stats") });
}

export function useHealthCheck() {
  return useQuery({ queryKey: ["/api/health"], queryFn: () => apiRequest("/api/health") });
}