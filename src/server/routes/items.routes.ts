import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/require-auth.js";
import { searchItems } from "../qb/handlers/search-items.handler.js";
import { getItem } from "../qb/handlers/get-item.handler.js";

const router = Router();

// GET /api/items — search/list items
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const criteria = req.query.q ? JSON.parse(req.query.q as string) : {};
  const result = await searchItems(req.qbClient!, criteria);
  if (result.isError) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json(result.result);
});

// GET /api/items/:id — get one item
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  const result = await getItem(req.qbClient!, req.params.id as string);
  if (result.isError) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json(result.result);
});

export default router;
