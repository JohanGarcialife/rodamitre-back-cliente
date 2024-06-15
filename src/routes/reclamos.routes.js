import { Router } from "express";
import { getreclamosId } from "../controllers/reclamos.js";

const router = Router();

/* reclamos */

router.get("/reclamos/:id", getreclamosId);

export default router;
