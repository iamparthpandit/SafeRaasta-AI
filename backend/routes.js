import express from "express";
import { triggerSOS } from "./controllers/sosController.js";

const router = express.Router();

router.post("/sos", triggerSOS);
// Alias kept for legacy docs/clients
router.post("/sos-trigger", triggerSOS);

export default router;
