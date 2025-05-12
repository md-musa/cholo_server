import express from "express";
import { RouteController } from "./route.controller";
import validateRequest from "../../middlewares/validateRequest";
import { RouteValidation } from "./route.validation";

const router = express.Router();

router.get("/", RouteController.getRoutes);
router.post("/", validateRequest(RouteValidation.create), RouteController.addRoute);
router.put("/:id", validateRequest(RouteValidation.update), RouteController.updateRoute);
router.delete("/:id", RouteController.deleteRoute);

export const RouteRouter = router;

