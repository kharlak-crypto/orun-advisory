import { z } from "zod"; import { router, protectedProcedure } from "../routers"; import { db } from "../db"; import { auditLogs, users, raciAssignments } from "../../../drizzle/schema"; import { eq, desc } from "drizzle-orm"; import { randomUUID } from "crypto";
export const adminRouter = router({
  listAuditLogs: protectedProcedure.input(z.object({ limit: z.number().default(100) })).query(async ({ ctx, input }) => db.select().from(auditLogs).where(eq(auditLogs.orgId, ctx.orgId)).orderBy(desc(auditLogs.timestamp)).limit(input.limit)),
  listUsers: protectedProcedure.query(async ({ ctx }) => { const rows = await db.select().from(users).where(eq(users.orgId, ctx.orgId)); return rows.map(({ passwordHash: _, ...u }) => u); }),
  upsertRaci: protectedProcedure.input(z.object({ systemId: z.string(), role: z.string(), responsibleUserId: z.string().optional(), raciType: z.enum(["responsible","accountable","consulted","informed"]), notes: z.string().optional() })).mutation(async ({ input }) => { await db.insert(raciAssignments).values({ id: randomUUID(), ...input }); return { success: true }; }),
  listRaci: protectedProcedure.input(z.object({ systemId: z.string() })).query(async ({ input }) => db.select().from(raciAssignments).where(eq(raciAssignments.systemId, input.systemId))),
});
