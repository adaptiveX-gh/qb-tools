import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/require-auth.js";
import { searchCustomers } from "../qb/handlers/search-customers.handler.js";
import { getCustomer } from "../qb/handlers/get-customer.handler.js";

const router = Router();

// GET /api/customers — search/list customers
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const criteria = req.query.q ? JSON.parse(req.query.q as string) : {};
  const result = await searchCustomers(req.qbClient!, criteria);
  if (result.isError) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json(result.result);
});

// GET /api/customers/:id — get one customer
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  const result = await getCustomer(req.qbClient!, req.params.id as string);
  if (result.isError) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json(result.result);
});

export default router;
