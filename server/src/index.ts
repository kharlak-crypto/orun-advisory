import express from "express";
import session from "express-session";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./routers";
import crypto from "crypto";
import { db } from "./db";
import { llmIntegrations, conversationLogs } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:5173"],
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET\!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

// ── tRPC ──────────────────────────────────────────────────────────────────────
app.use("/trpc", createExpressMiddleware({
  router: appRouter,
  createContext,
}));

// ── LLM Alignment Engine — Webhook Receiver ───────────────────────────────────
// POST /api/webhooks/llm-conversations/:integrationId
// Authenticated via HMAC-SHA256 signature in X-Orun-Signature header
app.post("/api/webhooks/llm-conversations/:integrationId", async (req, res) => {
  try {
    const { integrationId } = req.params;
    const signature = req.headers["x-orun-signature"] as string;
    const rawBody = JSON.stringify(req.body);

    // Lookup integration
    const [integration] = await db
      .select()
      .from(llmIntegrations)
      .where(eq(llmIntegrations.id, integrationId))
      .limit(1);

    if (\!integration) return res.status(404).json({ error: "Integration not found" });
    if (integration.status \!== "active") return res.status(403).json({ error: "Integration paused" });

    // Verify HMAC signature
    const expected = crypto
      .createHmac("sha256", integration.webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (signature \!== `sha256=${expected}`) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const payload = req.body as {
      sessionId: string;
      timestamp: string;
      messages: Array<{ role: string; content: string; timestamp: string }>;
      metadata?: { userId?: string; locale?: string; systemId?: string };
    };

    // Store conversation log
    const convId = randomUUID();
    await db.insert(conversationLogs).values({
      id: convId,
      integrationId,
      sessionId: payload.sessionId,
      messages: payload.messages,
      userLocale: payload.metadata?.locale,
      createdAt: new Date(),
    });

    // Trigger async analysis (non-blocking)
    analyzeConversationAsync(convId, integrationId, integration.orgId, payload)
      .catch(console.error);

    res.json({ received: true, conversationId: convId });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

// Async analysis pipeline
async function analyzeConversationAsync(
  convId: string,
  integrationId: string,
  orgId: string,
  payload: any
) {
  const { analyzeConversation } = await import("./routers/llmAlignment");
  await analyzeConversation(convId, integrationId, orgId, payload);
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", version: "2.0.0" }));

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Orun Advisory server running on port ${PORT}`);
});

export type AppRouter = typeof appRouter;
