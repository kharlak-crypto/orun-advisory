import type { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = (req as any).session;
  if (\!session?.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export function getSessionUser(req: Request): { userId: string; orgId: string; role: string } | null {
  const session = (req as any).session;
  if (\!session?.userId) return null;
  return { userId: session.userId, orgId: session.orgId, role: session.role };
}
