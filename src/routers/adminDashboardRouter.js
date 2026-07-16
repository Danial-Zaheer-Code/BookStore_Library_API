import express from "express"
import { body, query } from "express-validator"
import { validateToken } from "../middleware/tokenValidation.js";
import { isAdmin } from "../middleware/adminValidation.js";
import * as adminDashboardController from "../controllers/adminDashboardController.js";

export const router = express.Router();