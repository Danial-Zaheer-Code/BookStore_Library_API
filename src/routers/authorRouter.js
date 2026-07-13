import express from "express"
import { body, query } from "express-validator"
import { validateRequest } from "../middleware/requestValidation.js";
import { validateToken } from "../middleware/tokenValidation.js";
import { isAdmin } from "../middleware/adminValidation.js";
import * as authorController from "../controllers/authorController.js";

export const router = express.Router();

router.post("/create",
    validateToken,
    isAdmin, 
    body("name")
    .exists()
    .withMessage("Author name is required")
    .notEmpty()
    .withMessage("Author name must not be empty"),
    validateRequest,
    authorController.createAuthor
)

router.get("/list",
    validateToken,
    query("page")
        .exists()
        .withMessage("Page number is required")
        .isNumeric()
        .withMessage("Not a number")
        .custom(value => value > 0)
        .withMessage("Page Number must be positive"),
    query("limit")
        .exists()
        .withMessage("Limit is required")
        .isNumeric()
        .withMessage("Not a number")
        .custom(value => value > 0)
        .withMessage("Page Number must be positive"),
    query("search")
        .optional()
        .escape(),
    validateRequest,
    authorController.listAuthors
)