import express from "express"
import { body, check, query } from "express-validator"
import { validateRequest } from "../middleware/requestValidation.js";
import { validateToken } from "../middleware/tokenValidation.js";
import { isAdmin } from "../middleware/adminValidation.js";
import * as categoryController from "../controllers/categoryController.js";

export const router = express.Router()

router.post("/create",
    validateToken,
    isAdmin,
    body("name")
    .exists()
    .withMessage("Name is required")
    .notEmpty()
    .withMessage("Name can't be empty"),
    validateRequest,
    categoryController.createCategory
)
