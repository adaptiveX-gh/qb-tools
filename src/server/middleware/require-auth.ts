import { Request, Response, NextFunction } from "express";
import { QuickbooksClient } from "../qb/quickbooks-client.js";

// Extend Express Request to include our QB client
declare global {
  namespace Express {
    interface Request {
      qbClient?: QuickbooksClient;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = req.session as any;
  if (!session?.qbTokens?.refreshToken) {
    res.status(401).json({ error: "Not connected to QuickBooks" });
    return;
  }

  req.qbClient = new QuickbooksClient({
    clientId: process.env.QUICKBOOKS_CLIENT_ID!,
    clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
    refreshToken: session.qbTokens.refreshToken,
    realmId: session.qbTokens.realmId,
    environment: process.env.QUICKBOOKS_ENVIRONMENT || "sandbox",
    redirectUri: process.env.QUICKBOOKS_REDIRECT_URI || "http://localhost:3002/api/auth/qb/callback",
  });

  // After the response finishes, persist any rotated tokens back to session
  res.on("finish", () => {
    if (req.qbClient?.tokensChanged()) {
      session.qbTokens = req.qbClient.getTokenSnapshot();
    }
  });

  next();
}
