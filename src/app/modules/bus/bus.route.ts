import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { BusValidation } from "./bus.validation";
import { BusController } from "./bus.controller";

const router = express.Router();

router.get("/", BusController.getBuses);
router.post("/", validateRequest(BusValidation.create), BusController.createBus);
router.put("/:id", validateRequest(BusValidation.update), BusController.updateBus);
router.delete("/:id", BusController.deleteBus);

export const BusRouter = router;
