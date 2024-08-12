import { Router } from "express";
import { getgarantiaId } from "../controllers/garantia.js";

const router = Router();

/* garantia */

router.get("/garantia/:id", getgarantiaId);

export default router;
