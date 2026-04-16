import { z } from "zod"; import { router, protectedProcedure } from "../routers"; import { db } from "../db"; import { complianceDeadlines } from "../../../drizzle/schema"; import { eq } from "drizzle-orm";
export const deadlinesRouter = router({
  list: protectedProcedure.query(async () => db.select().from(complianceDeadlines).orderBy(complianceDeadlines.date)),
  getByFramework: protectedProcedure.input(z.object({ framework: z.string() })).query(async ({ input }) => db.select().from(complianceDeadlines).where(eq(complianceDeadlines.framework, input.framework as any))),
});
