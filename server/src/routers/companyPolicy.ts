import { z } from "zod"; import { router, protectedProcedure } from "../routers"; import { db } from "../db"; import { companyPolicies, companyPolicyRequirements, companyPolicyAssessments, policyControlMappings } from "../../../drizzle/schema"; import { eq, and } from "drizzle-orm"; import { invokeLLMJson } from "../llm"; import { randomUUID } from "crypto";
export const companyPolicyRouter = router({
  createPolicy: protectedProcedure.input(z.object({ companyName: z.string(), title: z.string(), version: z.string().optional(), language: z.string().default("en") })).mutation(async ({ input, ctx }) => { const id = randomUUID(); await db.insert(companyPolicies).values({ id, orgId: ctx.orgId, ...input, extractionStatus: "pending", createdAt: new Date() }); return { id }; }),
  listPolicies: protectedProcedure.query(async ({ ctx }) => db.select().from(companyPolicies).where(eq(companyPolicies.orgId, ctx.orgId))),
  extractRequirements: protectedProcedure.input(z.object({ policyId: z.string(), policyText: z.string() })).mutation(async ({ input }) => {
    await db.update(companyPolicies).set({ extractionStatus: "extracting" }).where(eq(companyPolicies.id, input.policyId));
    const prompt = `Extract all discrete compliance requirements from this AI governance policy document. Return a JSON array:\n[\n  {\n    "requirementCode": "REQ-001",\n    "title": string,\n    "description": string,\n    "pillar": "data_governance"|"risk_management"|"transparency"|"human_oversight"|"accountability"|"security"|"fairness"|"rights_protection"|"incident_management",\n    "severity": "critical"|"high"|"medium"|"low",\n    "sourceSection": string\n  }\n]\n\nPolicy text:\n${input.policyText.slice(0, 8000)}`;
    const requirements = await invokeLLMJson<any[]>(prompt);
    for (const req of requirements) {
      await db.insert(companyPolicyRequirements).values({ id: randomUUID(), policyId: input.policyId, ...req, extractedByLlm: true });
    }
    await db.update(companyPolicies).set({ extractionStatus: "completed", requirementsCount: requirements.length }).where(eq(companyPolicies.id, input.policyId));
    return { count: requirements.length };
  }),
  listRequirements: protectedProcedure.input(z.object({ policyId: z.string() })).query(async ({ input }) => db.select().from(companyPolicyRequirements).where(eq(companyPolicyRequirements.policyId, input.policyId))),
});
