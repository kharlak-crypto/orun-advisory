import { z } from "zod"; import { router, protectedProcedure } from "../routers"; import { db } from "../db"; import { complianceRemediations } from "../../../drizzle/schema"; import { eq, and, desc } from "drizzle-orm"; import { invokeLLM } from "../llm"; import { randomUUID } from "crypto"; import { REGULATORY_ARTICLES } from "@orun/shared";
export const remediationsRouter = router({
  generateFromAnomaly: protectedProcedure.input(z.object({ issueType: z.enum(["gender_bias","racial_bias","cultural_bias","age_bias","policy_violation","unexplained_decision","transparency_failure","hallucination","values_misalignment"]), context: z.string(), interactionId: z.string().optional() })).mutation(async ({ input, ctx }) => {
    const articles = REGULATORY_ARTICLES[input.issueType] ?? [];
    const prompt = `You are an AI compliance expert. Generate a system-prompt addition to remediate this compliance issue.\nIssue Type: ${input.issueType}\nContext: ${input.context}\nRegulatory articles breached: ${articles.join(", ")}\nRespond with only the exact text to add to the system prompt. Be specific and actionable.`;
    const suggestedPrompt = await invokeLLM(prompt);
    const id = randomUUID();
    await db.insert(complianceRemediations).values({ id, orgId: ctx.orgId, issueType: input.issueType as any, severity: "medium", interactionId: input.interactionId, regulatoryBreaches: articles, suggestedPrompt, status: "pending_review", createdAt: new Date() });
    return { id, suggestedPrompt };
  }),
  list: protectedProcedure.input(z.object({ status: z.string().optional() })).query(async ({ ctx }) => db.select().from(complianceRemediations).where(eq(complianceRemediations.orgId, ctx.orgId)).orderBy(desc(complianceRemediations.createdAt))),
  updateStatus: protectedProcedure.input(z.object({ id: z.string(), status: z.enum(["approved","applied","dismissed"]) })).mutation(async ({ input, ctx }) => { await db.update(complianceRemediations).set({ status: input.status, reviewedBy: ctx.userId, reviewedAt: new Date() }).where(eq(complianceRemediations.id, input.id)); return { success: true }; }),
});
