import { Router, Request, Response } from "express";
import OAuthClient from "intuit-oauth";
import crypto from "crypto";
import { getCompanyInfo } from "../qb/handlers/get-company-info.handler.js";
import { QuickbooksClient } from "../qb/quickbooks-client.js";

const router = Router();

// GET /api/auth/qb/connect — redirect to Intuit OAuth
router.get("/qb/connect", (req: Request, res: Response) => {
  const state = crypto.randomBytes(16).toString("hex");
  (req.session as any).oauthState = state;

  const oauthClient = new OAuthClient({
    clientId: process.env.QUICKBOOKS_CLIENT_ID!,
    clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
    environment: (process.env.QUICKBOOKS_ENVIRONMENT || "sandbox") as "sandbox" | "production",
    redirectUri: process.env.QUICKBOOKS_REDIRECT_URI || "http://localhost:3001/api/auth/qb/callback",
  });

  const authUri = oauthClient
    .authorizeUri({
      scope: [OAuthClient.scopes.Accounting as string],
      state,
    })
    .toString();

  res.redirect(authUri);
});

// GET /api/auth/qb/callback — exchange code for tokens
router.get("/qb/callback", async (req: Request, res: Response) => {
  try {
    const client = new QuickbooksClient({
      clientId: process.env.QUICKBOOKS_CLIENT_ID!,
      clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
      refreshToken: "", // not yet available
      realmId: "", // not yet available
      environment: (process.env.QUICKBOOKS_ENVIRONMENT || "sandbox") as "sandbox" | "production",
      redirectUri: process.env.QUICKBOOKS_REDIRECT_URI || "http://localhost:3001/api/auth/qb/callback",
    });

    const tokens = await client.exchangeCode(req.url);

    (req.session as any).qbTokens = tokens;

    res.redirect("/");
  } catch (error: any) {
    console.error("[auth] OAuth callback error:", error);
    res.redirect("/?error=auth_failed");
  }
});

// GET /api/auth/status
router.get("/status", async (req: Request, res: Response) => {
  const session = req.session as any;
  if (!session?.qbTokens?.refreshToken) {
    res.json({ connected: false });
    return;
  }

  // Try to get company name
  let companyName = session.companyName;
  if (!companyName) {
    try {
      const client = new QuickbooksClient({
        clientId: process.env.QUICKBOOKS_CLIENT_ID!,
        clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
        refreshToken: session.qbTokens.refreshToken,
        realmId: session.qbTokens.realmId,
        environment: (process.env.QUICKBOOKS_ENVIRONMENT || "sandbox") as "sandbox" | "production",
        redirectUri: process.env.QUICKBOOKS_REDIRECT_URI || "http://localhost:3001/api/auth/qb/callback",
      });
      const result = await getCompanyInfo(client);
      if (!result.isError && result.result) {
        companyName = result.result.CompanyName;
        session.companyName = companyName;
      }
    } catch {
      // ignore — we'll just not show company name
    }
  }

  res.json({ connected: true, companyName: companyName || null, realmId: session.qbTokens.realmId });
});

// POST /api/auth/logout
router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

export default router;
