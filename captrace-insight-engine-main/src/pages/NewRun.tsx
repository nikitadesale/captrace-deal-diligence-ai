import { useState, useRef, useCallback } from "react";
import { Upload, X, FileText, Sheet, AlertTriangle } from "lucide-react";
import ConfidenceGauge from "@/components/ConfidenceGauge";
import GuardrailsCard from "@/components/GuardrailsCard";
import RunMetadataCard from "@/components/RunMetadataCard";
import RawTrace from "@/components/RawTrace";
import LoadingSteps from "@/components/LoadingSteps";
import DiscussPanel from "@/components/DiscussPanel";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractResult(raw: any) {
  const src = raw?.extract_json ?? raw;
  return {
    title: src?.company_name ?? src?.deal_title ?? src?.title ?? null,
    summary: src?.executive_summary ?? src?.summary ?? null,
    score: typeof src?.confidence === "number" ? src.confidence : typeof src?.score === "number" ? src.score : typeof src?.mosaic_score === "number" ? src.mosaic_score : null,
    risks: Array.isArray(src?.key_risks) ? src.key_risks : Array.isArray(src?.risks) ? src.risks : [],
    questions: Array.isArray(src?.open_questions) ? src.open_questions : Array.isArray(src?.questions) ? src.questions : [],
    claims: Array.isArray(src?.claims) ? src.claims : Array.isArray(src?.metrics) ? src.metrics : [],
    memo: src?.memo ?? src?.investment_memo ?? null,
    status: src?.status ?? "Complete",
    raw,
  };
}

export default function NewRun() {
  const [pitchFile, setPitchFile] = useState<File | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [dealId, setDealId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "claims" | "memo">("overview");
  const [discussOpen, setDiscussOpen] = useState(false);
  const pitchRef = useRef<HTMLInputElement>(null);
  const modelRef = useRef<HTMLInputElement>(null);
  const startTime = useRef<number>(0);
  const [duration, setDuration] = useState<string | null>(null);

  const webhookUrl = (import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined) ?? "https://captracenik.app.n8n.cloud/webhook/captrace-run";

  const handleSubmit = useCallback(async () => {
    if (!pitchFile || !webhookUrl) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setLoadingStep(0);
    startTime.current = Date.now();

    const stepInterval = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, 3));
    }, 2200);

    try {
      const fd = new FormData();
      fd.append("pitch_deck", pitchFile);
      if (modelFile) fd.append("financial_model", modelFile);
      if (dealId.trim()) fd.append("deal_id", dealId.trim());

      const res = await fetch(webhookUrl, { method: "POST", body: fd });
      if (!res.ok) throw new Error(`Webhook returned ${res.status}`);
      const json = await res.json();
      setResult(json);
      setDuration(`${((Date.now() - startTime.current) / 1000).toFixed(1)}s`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  }, [pitchFile, modelFile, dealId, webhookUrl]);

  const parsed = result ? extractResult(result) : null;
  const runId = `run_${Date.now().toString(36)}`;
  const timestamp = new Date().toLocaleString();

  const guardrails = [
    { label: "Deck ingested", done: !!parsed },
    { label: "Model attached", done: !!modelFile },
    { label: "Agent pass 1", done: !!parsed },
    { label: "Score generated", done: parsed?.score !== null && parsed?.score !== undefined },
  ];

  return (
    <div className="relative">
      {/* Env banner */}
      {!webhookUrl && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>Set <code className="font-mono text-meta">VITE_N8N_WEBHOOK_URL</code> to enable diligence runs.</span>
        </div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-page font-semibold text-foreground">New run</h1>
          <p className="mt-1 text-body text-muted-foreground">Upload documents and run governed diligence analysis.</p>
        </div>
        {parsed && (
          <button
            onClick={() => setDiscussOpen(true)}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Ask Captrace
          </button>
        )}
      </div>

      {/* ROW 1 — Ingest */}
      <div className="card-surface p-6 mb-6">
        <h2 className="text-section font-semibold text-foreground mb-4">Ingest documents</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Pitch deck upload */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Pitch deck <span className="text-destructive">*</span>
            </label>
            {pitchFile ? (
              <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">{pitchFile.name}</span>
                  <span className="text-muted-foreground">({(pitchFile.size / 1024).toFixed(0)} KB)</span>
                </div>
                <button onClick={() => setPitchFile(null)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => pitchRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files[0];
                  if (f) setPitchFile(f);
                }}
                className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border py-8 text-sm text-muted-foreground hover:border-primary/50 hover:bg-primary/[0.02] transition-colors cursor-pointer"
              >
                <Upload className="h-6 w-6" />
                <span>Drop PDF here or click to browse</span>
              </button>
            )}
            <input ref={pitchRef} type="file" accept=".pdf" className="hidden" onChange={(e) => setPitchFile(e.target.files?.[0] ?? null)} />
          </div>

          {/* Financial model */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Financial model <span className="text-muted-foreground text-meta">(optional)</span>
            </label>
            {modelFile ? (
              <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-2 text-sm">
                  <Sheet className="h-4 w-4 text-success" />
                  <span className="font-medium text-foreground">{modelFile.name}</span>
                  <span className="text-muted-foreground">({(modelFile.size / 1024).toFixed(0)} KB)</span>
                </div>
                <button onClick={() => setModelFile(null)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => modelRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files[0];
                  if (f) setModelFile(f);
                }}
                className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border py-8 text-sm text-muted-foreground hover:border-primary/50 hover:bg-primary/[0.02] transition-colors cursor-pointer"
              >
                <Upload className="h-6 w-6" />
                <span>Drop .xlsx / .csv or click to browse</span>
              </button>
            )}
            <input ref={modelRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => setModelFile(e.target.files?.[0] ?? null)} />
            <p className="mt-1.5 text-meta text-muted-foreground">Tabular cross-check vs deck claims.</p>
          </div>
        </div>

        {/* Deal label + submit */}
        <div className="mt-4 flex items-end gap-4">
          <div className="flex-1 max-w-xs">
            <label className="text-sm font-medium text-foreground mb-1.5 block">Deal label</label>
            <input
              type="text"
              placeholder="DL-204"
              value={dealId}
              onChange={(e) => setDealId(e.target.value)}
              className="input-surface w-full focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!pitchFile || loading || !webhookUrl}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Running…" : "Run diligence"}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && <LoadingSteps currentStep={loadingStep} />}

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ROW 2 — Results */}
      {parsed && !loading && (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          {/* Left column — main results */}
          <div className="space-y-6">
            {/* Header */}
            <div className="card-surface p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-section font-semibold text-foreground">
                    {parsed.title ?? "Latest run"}
                  </h2>
                  <span className="mt-1.5 inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-meta font-medium text-success">
                    {parsed.status}
                  </span>
                </div>
                <ConfidenceGauge score={parsed.score} />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b">
              {(["overview", "claims", "memo"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === "overview" && (
              <div className="space-y-4">
                {parsed.summary && (
                  <div className="card-surface p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Executive summary</h3>
                    <p className="text-body text-foreground leading-relaxed">{parsed.summary}</p>
                  </div>
                )}

                {parsed.risks.length > 0 && (
                  <div className="card-surface p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Key risks</h3>
                    <ul className="space-y-2">
                      {parsed.risks.map((r: string | { description?: string; risk?: string; label?: string }, i: number) => (
                        <li key={i} className="flex gap-3 text-sm text-foreground">
                          <span className="mt-0.5 h-full w-0.5 flex-shrink-0 rounded-full bg-warning" />
                          {typeof r === "string" ? r : r.description ?? r.risk ?? r.label ?? JSON.stringify(r)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {parsed.questions.length > 0 && (
                  <div className="card-surface p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Open questions</h3>
                    <ul className="space-y-2">
                      {parsed.questions.map((q: string | { question?: string }, i: number) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                          <span className="mt-1 h-4 w-4 flex-shrink-0 rounded border border-border" />
                          {typeof q === "string" ? q : q.question ?? JSON.stringify(q)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "claims" && (
              <div className="card-surface overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left text-meta font-medium text-muted-foreground">
                      <th className="px-5 py-3">Claim</th>
                      <th className="px-5 py-3">Source</th>
                      <th className="px-5 py-3">Severity</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.claims.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                          No claims extracted in this run.
                        </td>
                      </tr>
                    ) : (
                      parsed.claims.map((c: Record<string, unknown>, i: number) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-3 text-foreground">{String(c.claim ?? c.title ?? c.metric ?? "—")}</td>
                          <td className="px-5 py-3 text-muted-foreground">{String(c.source ?? c.source_hint ?? "—")}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-meta font-medium ${
                              String(c.severity).toLowerCase() === "high" ? "bg-destructive/10 text-destructive" :
                              String(c.severity).toLowerCase() === "medium" ? "bg-warning/10 text-warning" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {String(c.severity ?? "—")}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">{String(c.status ?? "—")}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "memo" && (
              <div className="card-surface p-5">
                <h3 className="text-sm font-semibold text-foreground mb-2">Investment memo</h3>
                <div className="text-body text-foreground leading-relaxed whitespace-pre-wrap">
                  {parsed.memo ?? "No memo content in this run."}
                </div>
              </div>
            )}
          </div>

          {/* Right column — governance */}
          <div className="space-y-4">
            <GuardrailsCard items={guardrails} />
            <RunMetadataCard runId={runId} timestamp={timestamp} duration={duration ?? undefined} />
            <RawTrace data={parsed.raw} />
          </div>
        </div>
      )}

      {/* Empty state */}
      {!parsed && !loading && !error && (
        <div className="card-surface flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No results yet</p>
          <p className="mt-1 text-meta text-muted-foreground">Upload a pitch deck and run diligence to see analysis here.</p>
        </div>
      )}

      {/* Discuss panel */}
      <DiscussPanel
        open={discussOpen}
        onClose={() => setDiscussOpen(false)}
        runResult={parsed?.raw ?? null}
        dealId={dealId}
      />
    </div>
  );
}
