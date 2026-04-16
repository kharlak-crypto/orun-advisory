import { Switch, Route, Redirect } from "wouter";
import { AppLayout } from "./components/AppLayout";
import { trpc } from "./trpc";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DocumentationGenerator from "./pages/DocumentationGenerator";
import BiasAuditing from "./pages/BiasAuditing";
import ComplianceMapper from "./pages/ComplianceMapper";
import Monitoring from "./pages/Monitoring";
import CompanyPolicyEngine from "./pages/CompanyPolicyEngine";
import LLMGuardrails from "./pages/LLMGuardrails";
import RemediationSuggestions from "./pages/RemediationSuggestions";
import LLMAlignmentEngine from "./pages/LLMAlignmentEngine";
import ComplianceDeadlines from "./pages/ComplianceDeadlines";
import RACIAssignment from "./pages/RACIAssignment";
import EUAIAct from "./pages/compliance/EUAIAct";
import BrazilPL2338 from "./pages/compliance/BrazilPL2338";
import LGPD from "./pages/compliance/LGPD";
import ISO42001 from "./pages/compliance/ISO42001";
import NIST from "./pages/compliance/NIST";
import UNESCO from "./pages/compliance/UNESCO";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = trpc.auth.me.useQuery(undefined, { retry: false });
  if (isLoading) return <div className="flex items-center justify-center h-screen bg-[#0D1B2A] text-[#00A8E8] text-lg">Loading O.A.R.A™...</div>;
  if (\!user) return <Redirect to="/login" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route>
        <AuthGuard>
          <AppLayout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/documentation" component={DocumentationGenerator} />
              <Route path="/bias-auditing" component={BiasAuditing} />
              <Route path="/compliance-mapper" component={ComplianceMapper} />
              <Route path="/monitoring" component={Monitoring} />
              <Route path="/company-policy" component={CompanyPolicyEngine} />
              <Route path="/guardrails" component={LLMGuardrails} />
              <Route path="/remediations" component={RemediationSuggestions} />
              <Route path="/llm-alignment" component={LLMAlignmentEngine} />
              <Route path="/deadlines" component={ComplianceDeadlines} />
              <Route path="/raci" component={RACIAssignment} />
              <Route path="/compliance/eu-ai-act" component={EUAIAct} />
              <Route path="/compliance/brazil-pl2338" component={BrazilPL2338} />
              <Route path="/compliance/lgpd" component={LGPD} />
              <Route path="/compliance/iso-42001" component={ISO42001} />
              <Route path="/compliance/nist" component={NIST} />
              <Route path="/compliance/unesco" component={UNESCO} />
              <Route><Redirect to="/" /></Route>
            </Switch>
          </AppLayout>
        </AuthGuard>
      </Route>
    </Switch>
  );
}
