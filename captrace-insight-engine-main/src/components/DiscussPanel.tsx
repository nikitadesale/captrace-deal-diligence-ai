import { useState, useRef, useEffect } from "react";
import { X, Send, MessageSquare } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface DiscussPanelProps {
  open: boolean;
  onClose: () => void;
  runResult: unknown;
  dealId: string;
}

export default function DiscussPanel({ open, onClose, runResult, dealId }: DiscussPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Fall back to VITE_N8N_WEBHOOK_URL if chat URL is not set
  // n8n can branch on body.action to distinguish chat from diligence
  const chatUrl = (import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL ?? import.meta.env.VITE_N8N_WEBHOOK_URL) as string | undefined;

  const send = async () => {
    const q = input.trim();
    if (!q || !chatUrl || !runResult) return;
    setInput("");
    setError(null);

    const userMsg: Message = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(chatUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "explain",
          question: q,
          context: runResult,
          deal_id: dealId || undefined,
        }),
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      const answer = typeof data === "string" ? data : data?.answer ?? data?.response ?? data?.message ?? JSON.stringify(data);
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l bg-card shadow-2xl" role="complementary" aria-label="Ask Captrace">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Ask Captrace
          </h2>
          <p className="text-meta text-muted-foreground">Plain-language explanations of this run.</p>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors" aria-label="Close panel">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {!runResult && (
          <p className="text-sm text-muted-foreground text-center py-8">Run diligence first to ask questions about this output.</p>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
              aria-live={m.role === "assistant" ? "polite" : undefined}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl bg-muted px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-pulse-dot" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-pulse-dot" style={{ animationDelay: "200ms" }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-pulse-dot" style={{ animationDelay: "400ms" }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t px-5 py-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder={runResult ? "Explain the top risk in simpler terms" : "Run diligence first…"}
            disabled={!runResult || loading}
            className="input-surface flex-1 focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-50"
            aria-label="Ask a question about this run"
          />
          <button
            onClick={send}
            disabled={!input.trim() || !runResult || loading}
            className="rounded-xl bg-primary p-2.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
