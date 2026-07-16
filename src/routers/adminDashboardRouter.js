import express from "express"
import { query } from "express-validator"
import { validateRequest } from "../middleware/requestValidation.js";
import { validateToken } from "../middleware/tokenValidation.js";
import { isAdmin } from "../middleware/adminValidation.js";
import * as adminDashboardController from "../controllers/adminDashboardController.js";

export const router = express.Router();

router.get("/stats",
	validateToken,
	isAdmin,
	adminDashboardController.retrieveStats
)

router.get("/reports/top-books",
	validateToken,
	isAdmin,
	query("from")
		.exists()
		.withMessage("From date is required")
		.isISO8601()
		.withMessage("From date must be a valid date"),
	query("to")
		.exists()
		.withMessage("To date is required")
		.isISO8601()
		.withMessage("To date must be a valid date"),
	validateRequest,
	adminDashboardController.retrieveTopBooks
)