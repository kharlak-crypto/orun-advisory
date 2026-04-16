import { useState } from "react";
import { trpc } from "../trpc";

const ISSUE_COLORS: Record<string, string> = {
  gender_bias: "bg-pink-100 text-pink-800",
  racial_bias: "bg-red-100 text-red-800",
  cultural_bias: "bg-orange-100 text-orange-800",
  age_bias: "bg-yellow-100 text-yellow-800",
  policy_violation: "bg-purple-100 text-purple-800",
  unexplained_decision: "bg-blue-100 text-blue-800",
  transparency_failure: "bg-indigo-100 text-indigo-800",
  hallucination: "bg-gray-100 text-gray-800",
  values_misalignment: "bg-teal-100 text-teal-800",
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-black",
  low: "bg-green-500 text-white",
};

function CreateIntegrationDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("openai");
  const [created, setCreated] = useState<{ id: string; webhookSecret: string } | null>(null);
  const create = trpc.llmAlignment.createIntegration.useMutation({
    onSuccess: (data) => { setCreated(data); onCreated(); },
  });
  if (\!open) return <button onClick={() => setOpen(true)} className="bg-[#00A8E8] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0090CC]">+ Add Integration</button>;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="font-bold text-lg mb-4">Connect LLM Integration</h3>
        {\!created ? (
          <form onSubmit={(e) => { e.preventDefault(); create.mutate({ name, provider: provider as any }); }} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Integration Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Customer Support Bot" className="w-full border rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">LLM Provider</label>
              <select value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="openai">OpenAI (ChatGPT)</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="azure_openai">Azure OpenAI</option>
                <option value="google_vertex">Google Vertex AI</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={create.isPending} className="flex-1 bg-[#00A8E8] text-white py-2 rounded-lg font-semibold text-sm">{create.isPending ? "Creating..." : "Create Integration"}</button>
              <button type="button" onClick={() => setOpen(false)} className="flex-1 border py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">✅ Integration created successfully\!</div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Webhook URL</label>
              <code className="block bg-gray-100 p-2 rounded text-xs break-all">{window.location.origin}/api/webhooks/llm-conversations/{created.id}</code>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Webhook Secret (save this now — shown once)</label>
              <code className="block bg-[#0D1B2A] text-[#00FF88] p-2 rounded text-xs break-all">{created.webhookSecret}</code>
            </div>
            <p className="text-xs text-gray-500">Sign each request with HMAC-SHA256 using this secret. Set header: <code>X-Orun-Signature: sha256=&lt;hash&gt;</code></p>
            <button onClick={() => { setOpen(false); setCreated(null); setName(""); }} className="w-full bg-[#0D1B2A] text-white py-2 rounded-lg text-sm font-semibold">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

function SuggestionCard({ s, integrationId, onUpdate }: { s: any; integrationId: string; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const update = trpc.llmAlignment.updateSuggestion.useMutation({ onSuccess: onUpdate });
  const apply = trpc.llmAlignment.applySuggestion.useMutation({ onSuccess: onUpdate });
  const suggestion = s.suggestion ?? s;
  return (
    <div className="border rounded-xl p-4 space-y-3 bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ISSUE_COLORS[suggestion.issueType] ?? "bg-gray-100 text-gray-700"}`}>{suggestion.issueType?.replace(/_/g, " ")}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${SEVERITY_COLORS[suggestion.severity] ?? ""}`}>{suggestion.severity}</span>
          <span className="text-xs text-gray-400">Confidence: {suggestion.confidenceScore}%</span>
        </div>
        {suggestion.status === "pending_review" && (
          <div className="flex gap-2 shrink-0">
            <button onClick={() => update.mutate({ id: suggestion.id, status: "approved" })} className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold hover:bg-green-200">Approve</button>
            <button onClick={() => update.mutate({ id: suggestion.id, status: "dismissed" })} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200">Dismiss</button>
          </div>
        )}
        {suggestion.status === "approved" && (
          <button onClick={() => apply.mutate({ suggestionId: suggestion.id, integrationId })} className="text-xs bg-[#00A8E8] text-white px-3 py-1 rounded-full font-semibold hover:bg-[#0090CC]">Apply to Prompt</button>
        )}
        {suggestion.status === "applied" && <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full">Applied ✓</span>}
        {suggestion.status === "dismissed" && <span className="text-xs bg-gray-300 text-gray-600 px-3 py-1 rounded-full">Dismissed</span>}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700">Issue detected:</p>
        <p className="text-sm text-gray-600 mt-1 italic">"{suggestion.problematicExcerpt}"</p>
      </div>
      {suggestion.regulatoryArticles?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {suggestion.regulatoryArticles.map((a: string) => (
            <span key={a} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">{a}</span>
          ))}
        </div>
      )}
      <button onClick={() => setExpanded(\!expanded)} className="text-xs text-[#00A8E8] hover:underline">
        {expanded ? "▲ Hide" : "▼ Show"} suggested prompt addition
      </button>
      {expanded && (
        <pre className="bg-[#0D1B2A] text-[#00FF88] text-xs p-3 rounded-lg overflow-auto whitespace-pre-wrap">{suggestion.suggestedPromptAddition}</pre>
      )}
    </div>
  );
}

export default function LLMAlignmentEngine() {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"suggestions" | "versions" | "metrics">("suggestions");
  const [statusFilter, setStatusFilter] = useState("pending_review");

  const { data: integrations, refetch: refetchIntegrations } = trpc.llmAlignment.listIntegrations.useQuery();
  const { data: suggestions, refetch: refetchSuggestions } = trpc.llmAlignment.listSuggestions.useQuery(
    { integrationId: selectedIntegration ?? undefined, status: statusFilter as any },
    { enabled: \!\!selectedIntegration }
  );
  const { data: versions } = trpc.llmAlignment.listPromptVersions.useQuery(
    { integrationId: selectedIntegration\! },
    { enabled: \!\!selectedIntegration && activeTab === "versions" }
  );
  const { data: metrics } = trpc.llmAlignment.getMetrics.useQuery(
    { integrationId: selectedIntegration\!, days: 30 },
    { enabled: \!\!selectedIntegration && activeTab === "metrics" }
  );
  const rollback = trpc.llmAlignment.rollbackPrompt.useMutation({ onSuccess: () => refetchSuggestions() });

  const tabs = [
    { id: "suggestions", label: "💡 Suggestions" },
    { id: "versions", label: "📜 Prompt Versions" },
    { id: "metrics", label: "📊 Impact Metrics" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🧠 LLM Alignment Engine</h1>
          <p className="text-gray-500 text-sm mt-1">Continuous improvement — every conversation makes your LLM smarter and more compliant</p>
        </div>
        <CreateIntegrationDialog onCreated={() => refetchIntegrations()} />
      </div>

      {/* Integrations */}
      {integrations && integrations.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {integrations.map((integration) => (
            <button key={integration.id} onClick={() => setSelectedIntegration(integration.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${selectedIntegration === integration.id ? "border-[#00A8E8] bg-blue-50 text-[#00A8E8]" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"}`}>
              <span>{integration.provider === "openai" ? "🤖" : integration.provider === "anthropic" ? "🧠" : "⚡"}</span>
              <span>{integration.name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold text-white ${integration.status === "active" ? "bg-green-500" : "bg-gray-400"}`}>{integration.status}</span>
            </button>
          ))}
        </div>
      )}

      {\!selectedIntegration && (
        <div className="bg-gradient-to-br from-[#0D1B2A] to-[#1A3A5C] rounded-2xl p-8 text-center text-white">
          <div className="text-5xl mb-4">🧠</div>
          <h2 className="text-xl font-bold text-[#00A8E8] mb-2">Connect your first LLM</h2>
          <p className="text-gray-300 text-sm max-w-md mx-auto mb-6">Every conversation your AI has with users will be automatically analyzed for bias, policy violations, and regulatory non-compliance. You'll receive targeted system-prompt improvements to review and apply.</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            {[["Step 1","Click 'Add Integration' → get webhook URL"],["Step 2","Send conversation logs to the webhook"],["Step 3","Review AI-generated prompt improvements"]].map(([s,d]) => (
              <div key={s} className="bg-white/10 rounded-xl p-3"><div className="font-bold text-[#00A8E8]">{s}</div><div className="text-gray-300 text-xs mt-1">{d}</div></div>
            ))}
          </div>
        </div>
      )}

      {selectedIntegration && (
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? "border-[#00A8E8] text-[#00A8E8]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Suggestions tab */}
          {activeTab === "suggestions" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {["pending_review","approved","applied","dismissed","all"].map((s) => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`text-xs px-3 py-1 rounded-full font-medium ${statusFilter === s ? "bg-[#00A8E8] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {s.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
              {suggestions && suggestions.length > 0 ? (
                <div className="space-y-3">
                  {suggestions.map((s: any) => (
                    <SuggestionCard key={s.suggestion?.id ?? s.id} s={s} integrationId={selectedIntegration} onUpdate={() => refetchSuggestions()} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-sm">No {statusFilter.replace(/_/g, " ")} suggestions — your LLM is aligned\!</p>
                </div>
              )}
            </div>
          )}

          {/* Versions tab */}
          {activeTab === "versions" && (
            <div className="space-y-3">
              {versions && versions.length > 0 ? versions.map((v) => (
                <div key={v.id} className={`border rounded-xl p-4 ${v.isActive ? "border-green-400 bg-green-50" : "bg-white"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-800">v{v.version}</span>
                      {v.isActive && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">ACTIVE</span>}
                      <span className="text-xs text-gray-400">{new Date(v.appliedAt).toLocaleDateString()}</span>
                    </div>
                    {\!v.isActive && (
                      <button onClick={() => rollback.mutate({ versionId: v.id, integrationId: selectedIntegration })}
                        className="text-xs border border-gray-300 px-3 py-1 rounded-full hover:bg-gray-100">Rollback</button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{v.changeReason}</p>
                  <pre className="bg-[#0D1B2A] text-[#00FF88] text-xs p-3 rounded-lg overflow-auto max-h-32 whitespace-pre-wrap">{v.promptContent}</pre>
                </div>
              )) : <p className="text-center text-gray-400 py-8 text-sm">No prompt versions yet. Apply a suggestion to create the first version.</p>}
            </div>
          )}

          {/* Metrics tab */}
          {activeTab === "metrics" && (
            <div className="space-y-4">
              {metrics && metrics.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Conversations Analyzed", value: metrics.reduce((s: number, m: any) => s + (m.conversationsAnalyzed ?? 0), 0) },
                    { label: "Suggestions Generated", value: metrics.reduce((s: number, m: any) => s + (m.suggestionsGenerated ?? 0), 0) },
                    { label: "Suggestions Applied", value: metrics.reduce((s: number, m: any) => s + (m.suggestionsApplied ?? 0), 0) },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-[#0D1B2A] text-center p-4 rounded-xl border border-[#00A8E8]/30">
                      <div className="text-3xl font-bold text-[#00A8E8]">{stat.value}</div>
                      <div className="text-gray-400 text-xs mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-center text-gray-400 py-8 text-sm">No metrics yet. Metrics are generated after conversations are analyzed.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
