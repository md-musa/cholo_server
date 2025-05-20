// src/app/routes/test.route.ts
import express from "express";
import { ErrorLogController } from "./errorLog.controller";

const router = express.Router();

router.get("/", ErrorLogController.getLogs);

export const ErrorLogRoute = router;
