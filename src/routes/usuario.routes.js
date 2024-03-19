import { Router } from "express";
import {
  getclientes,
  getclientesId
} from "../controllers/user.controllers.js";

const router = Router();

/* login datos del usuario */

router.post("/clientes/sing-in", getclientes ); 
router.get("/clientes/:id", getclientesId);

export default router;
