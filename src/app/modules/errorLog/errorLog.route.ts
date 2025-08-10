// src/app/routes/test.route.ts
import express from "express";
import { ErrorLogController } from "./errorLog.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums";

const router = express.Router();

router.get("/", ErrorLogController.getLogs);

export const ErrorLogRoute = router;
