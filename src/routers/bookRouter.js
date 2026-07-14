import express from "express"
import { body, query } from "express-validator"
import { validateRequest } from "../middleware/requestValidation.js";
import { validateToken } from "../middleware/tokenValidation.js";
import { isAdmin } from "../middleware/adminValidation.js";
import * as bookController from "../controllers/bookController.js";

export const router = express.Router();

router.post("/create",
    validateToken,
    isAdmin,
    body("title")
        .exists()
        .withMessage("Author name is required")
        .notEmpty()
        .withMessage("Author name must not be empty")
        .escape(),
    body("isbn")
        .exists()
        .withMessage("ISBN is required")
        .notEmpty()
        .withMessage("ISBN must not be empty")
        .escape(),
    body("authorId")
        .exists()
        .withMessage("Author id is required")
        .isNumeric()
        .withMessage("Author id must be a number")
        .toInt()
        .custom(value => value > 0)
        .withMessage("Author id must be positive"),
    body("categoryId")
        .exists()
        .withMessage("Category id is required")
        .isNumeric()
        .withMessage("Category id must be a number")
        .toInt()
        .custom(value => value > 0)
        .withMessage("Category id must be positive"),
    body("totalCopies")
        .exists()
        .withMessage("Total copies are required")
        .isNumeric()
        .withMessage("Total copies must be a number")
        .toInt()
        .custom(value => value > 0)
        .withMessage("Total copies must be positive"),
    body("publishedYear")
        .exists()
        .withMessage("Published year is required")
        .isNumeric()
        .withMessage("Published year must be a number")
        .toInt()
        .custom(value => value > 0 && value <= new Date().getFullYear())
        .withMessage("Published year must be posititve and not greater then current year"),
    validateRequest,
    bookController.createBook
)