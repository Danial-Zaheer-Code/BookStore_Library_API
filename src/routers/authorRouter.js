import express from "express"
import { check } from "express-validator"
import { validateRequest } from "../middleware/requestValidation.js";
import { validateToken } from "../middleware/tokenValidation.js";
import { isAdmin } from "../middleware/adminValidation.js";
import * as authorController from "../controllers/authorController.js";

export const router = express.Router();

router.post("/create", 
    check("name")
    .exists()
    .withMessage("Author name is required")
    .notEmpty()
    .withMessage("Author name must not be empty"),
    validateRequest,
    validateToken,
    isAdmin,
    authorController.createAuthor
)