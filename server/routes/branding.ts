import { Router, Request, Response } from "express";

const router = Router();

/**
 * GET /api/branding
 * Return branding configuration for current account
 */
router.get("/", (req: Request, res: Response) => {
  const branding = req.branding || {
    primary_color: "#37ca37",
    secondary_color: "#188bf6",
    company_name: "Voxmation",
  };

  res.json(branding);
});

export default router;
