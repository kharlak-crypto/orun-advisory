import { Link, useLocation } from "wouter";
import { trpc } from "../trpc";
import { useState } from "react";

const NAV = [
  { label: "Dashboard", href: "/", icon: "🏠" },
  { section: "Compliance Modules" },
  { label: "M1 · Auto Documentation", href: "/documentation", icon: "📄" },
  { label: "M2 · Bias Auditing", href: "/bias-auditing", icon: "⚖️" },
  { label: "M3 · Compliance Mapper", href: "/compliance-mapper", icon: "🗺️", badge: "O.A.R.A™" },
  { label: "M4 · Monitoring", href: "/monitoring", icon: "📡" },
  { label: "M5 · Company Policy", href: "/company-policy", icon: "📋" },
  { section: "LLM Intelligence" },
  { label: "LLM Alignment Engine", href: "/llm-alignment", icon: "🧠", badge: "NEW", badgeColor: "bg-green-500" },
  { label: "LLM Guardrails", href: "/guardrails", icon: "🛡️" },
  { label: "LLM Remediations", href: "/remediations", icon: "🔧" },
  { section: "Regulatory Frameworks" },
  { label: "EU AI Act", href: "/compliance/eu-ai-act", icon: "🇪🇺" },
  { label: "Brazil PL 2338", href: "/compliance/brazil-pl2338", icon: "🇧🇷" },
  { label: "LGPD", href: "/compliance/lgpd", icon: "🔒" },
  { label: "ISO 42001", href: "/compliance/iso-42001", icon: "📐" },
  { label: "NIST AI RMF", href: "/compliance/nist", icon: "🇺🇸" },
  { label: "UNESCO", href: "/compliance/unesco", icon: "🌍" },
  { section: "Governance" },
  { label: "Compliance Deadlines", href: "/deadlines", icon: "📅" },
  { label: "RACI Assignment", href: "/raci", icon: "👥" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const logout = trpc.auth.logout.useMutation({ onSuccess: () => window.location.href = "/login" });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0D1B2A] flex flex-col overflow-y-auto shrink-0">
        <div className="p-4 border-b border-[#1A3A5C]">
          <div className="text-[#00A8E8] font-bold text-lg">ORUN ADVISORY</div>
          <div className="text-gray-400 text-xs mt-0.5">O.A.R.A™ Platform v2.0</div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map((item, i) => {
            if ("section" in item) return (
              <div key={i} className="text-gray-500 text-xs uppercase tracking-wider pt-4 pb-1 px-2">{item.section}</div>
            );
            const active = location === item.href || (item.href \!== "/" && location.startsWith(item.href));
            return (
              <Link key={i} href={item.href\!}>
                <a className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${active ? "bg-[#1A3A5C] text-white" : "text-gray-400 hover:bg-[#1A3A5C] hover:text-white"}`}>
                  <span>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold text-white ${item.badgeColor ?? "bg-[#00A8E8]"}`}>{item.badge}</span>}
                </a>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-[#1A3A5C]">
          <button onClick={() => logout.mutate()} className="w-full text-left text-gray-400 hover:text-white text-sm px-3 py-2 rounded hover:bg-[#1A3A5C] transition-colors">
            Sign out
          </button>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
