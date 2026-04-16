import { useState } from "react";
import { trpc } from "../trpc";
import { useLocation } from "wouter";

export default function Login() {
  const [, nav] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = trpc.auth.login.useMutation({
    onSuccess: () => nav("/"),
    onError: (e) => setError(e.message),
  });
  return (
    <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-[#00A8E8] font-bold text-2xl">ORUN ADVISORY</div>
          <div className="text-gray-400 text-sm mt-1">O.A.R.A™ AI Governance Platform</div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); login.mutate({ email, password }); }} className="bg-[#1A3A5C] rounded-xl p-6 space-y-4">
          <div>
            <label className="text-gray-300 text-sm block mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#0D1B2A] text-white border border-[#00A8E8]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A8E8]" required />
          </div>
          <div>
            <label className="text-gray-300 text-sm block mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#0D1B2A] text-white border border-[#00A8E8]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A8E8]" required />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={login.isPending} className="w-full bg-[#00A8E8] text-white font-semibold py-2 rounded-lg hover:bg-[#0090CC] transition-colors disabled:opacity-50">
            {login.isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
