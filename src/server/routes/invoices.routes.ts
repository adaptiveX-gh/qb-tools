import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/require-auth.js";
import { validate } from "../middleware/validate.js";
import { createInvoiceSchema, bulkCreateInvoicesSchema } from "../schemas/invoice.schema.js";
import { createInvoice } from "../qb/handlers/create-invoice.handler.js";
import { readInvoice } from "../qb/handlers/read-invoice.handler.js";
import { searchInvoices } from "../qb/handlers/search-invoices.handler.js";

const router = Router();

// POST /api/invoices — create one invoice
router.post("/", requireAuth, validate(createInvoiceSchema), async (req: Request, res: Response) => {
  const result = await createInvoice(req.qbClient!, (req as any).validated);
  if (result.isError) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json(result.result);
});

// POST /api/invoices/bulk — create multiple invoices
router.post("/bulk", requireAuth, validate(bulkCreateInvoicesSchema), async (req: Request, res: Response) => {
  const { invoices } = (req as any).validated;
  const results = await Promise.allSettled(
    invoices.map((inv: any) => createInvoice(req.qbClient!, inv))
  );

  const response = results.map((r, i) => {
    if (r.status === "fulfilled") {
      return r.value.isError
        ? { success: false, error: r.value.error, index: i }
        : { success: true, invoice: r.value.result, index: i };
    }
    return { success: false, error: (r.reason as Error).message, index: i };
  });

  res.json({ results: response });
});

// GET /api/invoices/:id — read one invoice
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  const result = await readInvoice(req.qbClient!, req.params.id as string);
  if (result.isError) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json(result.result);
});

// GET /api/invoices — search invoices
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const criteria = req.query.q ? JSON.parse(req.query.q as string) : {};
  const result = await searchInvoices(req.qbClient!, criteria);
  if (result.isError) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json(result.result);
});

export default router;
