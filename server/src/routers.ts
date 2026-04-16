import { initTRPC, TRPCError } from "@trpc/server";
import type { Request, Response } from "express";
import { z } from "zod";
import { authRouter } from "./routers/auth";
import { documentationRouter } from "./routers/documentation";
import { biasRouter } from "./routers/bias";
import { complianceRouter } from "./routers/compliance";
import { monitoringRouter } from "./routers/monitoring";
import { companyPolicyRouter } from "./routers/companyPolicy";
import { guardrailsRouter } from "./routers/guardrails";
import { remediationsRouter } from "./routers/remediations";
import { llmAlignmentRouter } from "./routers/llmAlignment";
import { deadlinesRouter } from "./routers/deadlines";
import { adminRouter } from "./routers/admin";

export interface Context {
  req: Request;
  res: Response;
  session: { userId?: string; orgId?: string; role?: string };
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (\!ctx.session.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, userId: ctx.session.userId\!, orgId: ctx.session.orgId\! } });
});

export function createContext({ req, res }: { req: Request; res: Response }): Context {
  const session = (req as any).session || {};
  return { req, res, session };
}

export const appRouter = router({
  auth:          authRouter,
  documentation: documentationRouter,
  bias:          biasRouter,
  compliance:    complianceRouter,
  monitoring:    monitoringRouter,
  companyPolicy: companyPolicyRouter,
  guardrails:    guardrailsRouter,
  remediations:  remediationsRouter,
  llmAlignment:  llmAlignmentRouter,
  deadlines:     deadlinesRouter,
  admin:         adminRouter,
});

export type AppRouter = typeof appRouter;
