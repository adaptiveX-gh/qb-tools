import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/require-auth.js";
import { getCompanyInfo } from "../qb/handlers/get-company-info.handler.js";

const router = Router();

// GET /api/company — get connected company info
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const result = await getCompanyInfo(req.qbClient!);
  if (result.isError) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json(result.result);
});

export default router;
