import { trpc } from "../trpc";

export default function Dashboard() {
  const { data: user } = trpc.auth.me.useQuery();
  const { data: deadlines } = trpc.deadlines.list.useQuery();
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back{user ? `, ${user.name}` : ""}</h1>
        <p className="text-gray-500 text-sm mt-1">O.A.R.A™ AI Governance Dashboard — {new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "EU AI Act Deadline", value: "2 Aug 2026", sub: "High-risk systems", color: "bg-red-50 border-red-200" },
          { label: "Active Frameworks", value: "6", sub: "Regulations monitored", color: "bg-blue-50 border-blue-200" },
          { label: "LLM Alignment", value: "Active", sub: "Continuous improvement", color: "bg-green-50 border-green-200" },
          { label: "O.A.R.A™ Status", value: "Ready", sub: "Assessments available", color: "bg-purple-50 border-purple-200" },
        ].map((card) => (
          <div key={card.label} className={`border rounded-xl p-4 ${card.color}`}>
            <div className="text-xs text-gray-500 font-medium">{card.label}</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{card.value}</div>
            <div className="text-xs text-gray-500 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>
      <div className="bg-gradient-to-r from-[#0D1B2A] to-[#1A3A5C] rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">🧠</span>
          <div>
            <div className="font-bold text-lg text-[#00A8E8]">Continuous LLM Alignment Engine</div>
            <div className="text-gray-300 text-sm">Your LLM conversations are being analyzed for bias and compliance in real time</div>
          </div>
        </div>
        <a href="/llm-alignment" className="inline-block bg-[#00A8E8] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#0090CC] transition-colors">View Suggestions →</a>
      </div>
    </div>
  );
}
