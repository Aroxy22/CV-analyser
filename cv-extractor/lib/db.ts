import type { CvAnalysis, AnalysisSummary } from "./types";

async function post(path: string, body: unknown) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

async function get(path: string) {
  const res = await fetch(path);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export const db = {
  extractCV: (base64: string, filename: string, goal: string) =>
    post("/api/extract", { base64, filename, goal }),

  saveCV: (filename: string, file_size: number) =>
    post("/api/save-cv", { filename, file_size }),

  saveAnalysis: (cv_id: string | null, analysis: CvAnalysis, goal: string) =>
    post("/api/save-analysis", { cv_id, analysis, goal }),

  saveJobs: (analysis_id: string, jobs: unknown) =>
    post("/api/save-jobs", { analysis_id, jobs }),

  getCachedJobs: (analysis_id: string) =>
    get(`/api/save-jobs?analysis_id=${analysis_id}`),

  listAnalyses: (): Promise<AnalysisSummary[]> =>
    get("/api/list-analyses"),

  getAnalysis: (id: string): Promise<{ analysis_json: CvAnalysis; id: string; candidate_goal: string }> =>
    get(`/api/get-analysis?id=${id}`),

  searchJobs: (cv: CvAnalysis, goal: string) =>
    post("/api/search-jobs", { cv, goal }),
};
