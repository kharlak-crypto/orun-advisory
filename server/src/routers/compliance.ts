import { z } from "zod";
import { router, protectedProcedure } from "../routers";
import { db } from "../db";
import { complianceAssessments, controlMappings, complianceControls, aiSystems } from "../../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { invokeLLMJson } from "../llm";
import { randomUUID } from "crypto";
import { ALL_FRAMEWORKS, OARA_PILLARS } from "@orun/shared";

export const complianceRouter = router({
  createAssessment: protectedProcedure
    .input(z.object({ systemId: z.string(), framework: z.enum(["EU_AI_ACT","PL_2338","LGPD","ISO_42001","NIST_AI_RMF","GDPR"]) }))
    .mutation(async ({ input, ctx }) => {
      const id = randomUUID();
      await db.insert(complianceAssessments).values({
        id, systemId: input.systemId, framework: input.framework,
        status: "not_assessed", createdAt: new Date(),
      });
      return { id };
    }),

  getOaraScore: protectedProcedure
    .input(z.object({ systemId: z.string(), framework: z.enum(["EU_AI_ACT","PL_2338","LGPD","ISO_42001","NIST_AI_RMF","GDPR"]) }))
    .query(async ({ input }) => {
      const [assessment] = await db.select().from(complianceAssessments)
        .where(and(eq(complianceAssessments.systemId, input.systemId), eq(complianceAssessments.framework, input.framework)))
        .orderBy(desc(complianceAssessments.createdAt)).limit(1);
      return assessment ?? null;
    }),

  getMultiFrameworkScores: protectedProcedure
    .input(z.object({ systemId: z.string() }))
    .query(async ({ input }) => {
      const assessments = await db.select().from(complianceAssessments)
        .where(eq(complianceAssessments.systemId, input.systemId))
        .orderBy(desc(complianceAssessments.createdAt));
      const latest: Record<string, any> = {};
      for (const a of assessments) { if (\!latest[a.framework]) latest[a.framework] = a; }
      return latest;
    }),

  generateOaraReport: protectedProcedure
    .input(z.object({ systemId: z.string() }))
    .mutation(async ({ input }) => {
      const [system] = await db.select().from(aiSystems).where(eq(aiSystems.id, input.systemId)).limit(1);
      if (\!system) throw new Error("System not found");
      const prompt = `Generate an O.A.R.A™ compliance assessment for this AI system:
Name: ${system.name}
Purpose: ${system.purpose}
Risk Tier: ${system.riskTier}
Frameworks: ${(system.frameworks as string[]).join(", ")}

Return JSON with pillar scores (0-100 each) and overall score:
{
  "overall": <0-100>,
  "pillars": {
    "rights_protection": <0-100>,
    "institutional_oversight": <0-100>,
    "safety_risk_management": <0-100>,
    "knowledge_transparency": <0-100>,
    "accountability_governance": <0-100>
  },
  "summary": "<2 sentence summary>",
  "topGaps": ["<gap1>", "<gap2>", "<gap3>"]
}`;
      return invokeLLMJson(prompt);
    }),

  listAssessments: protectedProcedure
    .input(z.object({ systemId: z.string() }))
    .query(async ({ input }) => {
      return db.select().from(complianceAssessments)
        .where(eq(complianceAssessments.systemId, input.systemId))
        .orderBy(desc(complianceAssessments.createdAt));
    }),
});
