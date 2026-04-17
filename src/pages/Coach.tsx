import { useState, useRef, useEffect } from "react";
import { Bot, Send, Loader2, Zap, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface Message {
  role: "ai" | "user";
  text: string;
  sources?: string[];
  mlPrediction?: {
    calories_burned: number;
    lower_bound: number;
    upper_bound: number;
    confidence_level: number;
  };
}

const starterMessage: Message = {
  role: "ai",
  text: "Hey! I'm your Nexus AI Coach, powered by RAG — I search through my fitness knowledge base to give you evidence-based advice. I can also predict your calorie burn using our ML model. Try asking me about HIIT, running, weightlifting, nutrition, recovery, or say \"how many calories will I burn?\"",
};

export default function Coach() {
  const [messages, setMessages] = useState<Message[]>([starterMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChatHistory = async () => {
    const { data } = await supabase
      .from("chat_history")
      .select("message, response, sources")
      .order("created_at", { ascending: true })
      .limit(50);

    if (data && data.length > 0) {
      const historyMessages: Message[] = [starterMessage];
      data.forEach((row: { message: string; response: string; sources: string[] }) => {
        historyMessages.push({ role: "user", text: row.message });
        historyMessages.push({
          role: "ai",
          text: row.response,
          sources: row.sources || [],
        });
      });
      setMessages(historyMessages);
    }
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const aiMsg: Message = {
        role: "ai",
        text: data.response,
        sources: data.sources,
        mlPrediction: data.ml_prediction,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Save to Supabase
      await supabase.from("chat_history").insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        message: trimmed,
        response: data.response,
        sources: data.sources || [],
        intent: data.intent || null,
        confidence: data.confidence || 0,
      });
    } catch {
      const errMsg: Message = {
        role: "ai",
        text: "⚠️ Sorry, I couldn't process that. Make sure the Nexus API is running on port 8000.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatText = (text: string) => {
    return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
      i % 2 === 1 ? (
        <span key={i} className="font-semibold text-nexus-cyan">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-xl border border-nexus-border bg-nexus-surface">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-nexus-border px-6 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-nexus-purple/20">
          <Bot size={16} className="text-nexus-purple" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-nexus-text-primary">Nexus AI Coach</h3>
          <p className="text-xs text-nexus-text-secondary">RAG-powered • 25 knowledge documents • ML predictions</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-nexus-green animate-pulse" />
          <span className="text-xs text-nexus-green">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex gap-3", m.role === "user" && "justify-end")}>
            {m.role === "ai" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nexus-purple/20">
                <Bot size={16} className="text-nexus-purple" />
              </div>
            )}
            <div className="max-w-[75%] space-y-2">
              <div
                className={cn(
                  "rounded-xl px-4 py-3 text-sm leading-relaxed",
                  m.role === "ai"
                    ? "border-l-2 border-nexus-purple bg-nexus-bg text-nexus-text-secondary"
                    : "bg-nexus-cyan/10 text-nexus-text-primary"
                )}
              >
                {formatText(m.text)}
              </div>

              {/* ML Prediction Card */}
              {m.mlPrediction && (
                <div className="rounded-lg border border-nexus-cyan/30 bg-nexus-cyan/5 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Zap size={12} className="text-nexus-cyan" />
                    <span className="text-xs font-semibold text-nexus-cyan">ML Prediction</span>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-lg font-bold font-mono text-nexus-cyan">
                        {m.mlPrediction.calories_burned}
                      </p>
                      <p className="text-xs text-nexus-text-secondary">kcal</p>
                    </div>
                    <div>
                      <p className="text-sm font-mono text-nexus-green">
                        {m.mlPrediction.lower_bound}–{m.mlPrediction.upper_bound}
                      </p>
                      <p className="text-xs text-nexus-text-secondary">
                        {(m.mlPrediction.confidence_level * 100).toFixed(0)}% confidence
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sources */}
              {m.sources && m.sources.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <BookOpen size={10} className="text-nexus-text-secondary" />
                  {m.sources.map((source, j) => (
                    <span
                      key={j}
                      className="rounded-full bg-nexus-purple/10 border border-nexus-purple/20 px-2 py-0.5 text-xs text-nexus-purple"
                    >
                      {source}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nexus-purple/20">
              <Bot size={16} className="text-nexus-purple" />
            </div>
            <div className="rounded-xl border-l-2 border-nexus-purple bg-nexus-bg px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-nexus-text-secondary">
                <Loader2 size={14} className="animate-spin text-nexus-purple" />
                Searching knowledge base...
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-nexus-border p-4">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your AI coach about exercises, nutrition, recovery..."
            className="flex-1 rounded-lg border border-nexus-border bg-nexus-bg px-4 py-2.5 text-sm text-nexus-text-primary placeholder:text-nexus-text-secondary focus:outline-none focus:ring-1 focus:ring-nexus-cyan"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-nexus-cyan text-nexus-bg hover:bg-nexus-cyan/90 disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}