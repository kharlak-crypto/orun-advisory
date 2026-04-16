import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../routers";
import { db } from "../db";
import { users, organizations } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import crypto from "crypto";

function hashPassword(pw: string) {
  return crypto.createHash("sha256").update(pw + process.env.SESSION_SECRET).digest("hex");
}

export const authRouter = router({
  register: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().min(1), orgName: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const orgId = randomUUID();
      await db.insert(organizations).values({ id: orgId, name: input.orgName, plan: "starter", createdAt: new Date(), updatedAt: new Date() });
      const userId = randomUUID();
      await db.insert(users).values({ id: userId, orgId, email: input.email, passwordHash: hashPassword(input.password), name: input.name, role: "owner", createdAt: new Date() });
      return { userId, orgId };
    }),

  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (\!user || user.passwordHash \!== hashPassword(input.password)) throw new Error("Invalid credentials");
      (ctx.req as any).session.userId = user.id;
      (ctx.req as any).session.orgId  = user.orgId;
      (ctx.req as any).session.role   = user.role;
      return { userId: user.id, orgId: user.orgId, role: user.role, name: user.name };
    }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    await new Promise<void>((resolve, reject) =>
      (ctx.req as any).session.destroy((err: any) => err ? reject(err) : resolve()));
    return { success: true };
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await db.select().from(users).where(eq(users.id, ctx.userId)).limit(1);
    if (\!user) throw new Error("User not found");
    const { passwordHash: _, ...safe } = user;
    return safe;
  }),
});
