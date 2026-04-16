import { z } from "zod";
import { router, protectedProcedure } from "../routers";
import { db } from "../db";
import { documentationRequests, aiSystems } from "../../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { invokeLLM } from "../llm";
import { randomUUID } from "crypto";

const DOC_TEMPLATES: Record<string, string> = {
  conformity_assessment: "Generate a comprehensive EU AI Act conformity assessment document for this AI system. Include: system description, risk classification rationale, conformity assessment procedure followed, technical standards applied, declaration of conformity statement.",
  technical_documentation: "Generate technical documentation per EU AI Act Article 11. Include: general description, design specifications, training methodology, monitoring procedures, risk management measures, bias testing results placeholder, human oversight measures.",
  risk_report: "Generate a risk management report per EU AI Act Article 9. Include: risk identification, risk analysis, risk evaluation, risk mitigation measures, residual risk assessment, ongoing monitoring plan.",
  transparency_notice: "Generate an end-user transparency notice per EU AI Act Article 13 and LGPD Article 9. Include: what AI is being used, what decisions it influences, user rights, how to contest automated decisions, contact information.",
  impact_assessment: "Generate an Algorithmic Impact Assessment per Brazil PL 2338. Include: system purpose, data sources, affected populations, potential impacts on fundamental rights, mitigation measures, human oversight mechanisms.",
};

export const documentationRouter = router({
  listRequests: protectedProcedure
    .input(z.object({ systemId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      return db.select().from(documentationRequests)
        .where(and(eq(documentationRequests.orgId, ctx.orgId), input.systemId ? eq(documentationRequests.systemId, input.systemId) : undefined))
        .orderBy(desc(documentationRequests.createdAt));
    }),

  generateDocument: protectedProcedure
    .input(z.object({ systemId: z.string(), docType: z.string(), framework: z.enum(["EU_AI_ACT","PL_2338","LGPD","ISO_42001","NIST_AI_RMF","GDPR"]).optional() }))
    .mutation(async ({ input, ctx }) => {
      const [system] = await db.select().from(aiSystems).where(eq(aiSystems.id, input.systemId)).limit(1);
      if (\!system) throw new Error("System not found");
      const id = randomUUID();
      await db.insert(documentationRequests).values({
        id, systemId: input.systemId, orgId: ctx.orgId, docType: input.docType,
        framework: input.framework, status: "generating", generatedBy: ctx.userId, createdAt: new Date(),
      });
      const template = DOC_TEMPLATES[input.docType] ?? "Generate a compliance document for this AI system.";
      const prompt = `${template}\n\nSystem: ${system.name}\nPurpose: ${system.purpose}\nRisk Tier: ${system.riskTier}\nVendor: ${system.vendor ?? "Internal"}\n\nGenerate a complete, professional document in markdown format.`;
      const content = await invokeLLM(prompt);
      await db.update(documentationRequests).set({ content, status: "completed", generatedAt: new Date() }).where(eq(documentationRequests.id, id));
      return { id, content };
    }),

  getDocument: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [doc] = await db.select().from(documentationRequests).where(eq(documentationRequests.id, input.id)).limit(1);
      return doc ?? null;
    }),

  listTemplates: protectedProcedure.query(async () => {
    return Object.keys(DOC_TEMPLATES).map((key) => ({ key, label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) }));
  }),
});
