import { z } from "zod"; import { router, protectedProcedure } from "../routers"; import { db } from "../db"; import { biasAuditJobs, biasFindings } from "../../../drizzle/schema"; import { eq, and, desc } from "drizzle-orm"; import { invokeLLMJson } from "../llm"; import { randomUUID } from "crypto";
export const biasRouter = router({
  createJob: protectedProcedure.input(z.object({ systemId: z.string(), protectedAttrs: z.array(z.string()), datasetRef: z.string().optional() })).mutation(async ({ input, ctx }) => { const id = randomUUID(); await db.insert(biasAuditJobs).values({ id, systemId: input.systemId, orgId: ctx.orgId, protectedAttrs: input.protectedAttrs, datasetRef: input.datasetRef, status: "queued", createdAt: new Date() }); return { id }; }),
  listJobs: protectedProcedure.input(z.object({ systemId: z.string().optional() })).query(async ({ input, ctx }) => { return db.select().from(biasAuditJobs).where(and(eq(biasAuditJobs.orgId, ctx.orgId), input.systemId ? eq(biasAuditJobs.systemId, input.systemId) : undefined)).orderBy(desc(biasAuditJobs.createdAt)); }),
  getJob: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => { const [j] = await db.select().from(biasAuditJobs).where(eq(biasAuditJobs.id, input.id)).limit(1); return j ?? null; }),
  listFindings: protectedProcedure.input(z.object({ jobId: z.string() })).query(async ({ input }) => { return db.select().from(biasFindings).where(eq(biasFindings.jobId, input.jobId)); }),
  generateReport: protectedProcedure.input(z.object({ jobId: z.string(), systemDescription: z.string() })).mutation(async ({ input }) => {
    const findings = await db.select().from(biasFindings).where(eq(biasFindings.jobId, input.jobId));
    const prompt = `Generate a professional AI bias audit report for: ${input.systemDescription}\nFindings: ${JSON.stringify(findings)}\nReturn JSON: { "summary": string, "riskLevel": "critical"|"high"|"medium"|"low", "recommendations": string[], "euAiActCompliance": string, "pl2338Compliance": string }`;
    const report = await invokeLLMJson(prompt);
    await db.update(biasAuditJobs).set({ report, status: "completed", completedAt: new Date() }).where(eq(biasAuditJobs.id, input.jobId));
    return report;
  }),
});
