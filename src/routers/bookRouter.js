import express from "express"
import { body, query } from "express-validator"
import { validateRequest } from "../middleware/requestValidation.js";
import { validateToken } from "../middleware/tokenValidation.js";
import { isAdmin } from "../middleware/adminValidation.js";
import * as bookController from "../controllers/bookController.js";

export const router = express.Router();

router.get("/list",
    validateToken,
    query("page")
        .exists()
        .withMessage("Page number is required")
        .isNumeric()
        .withMessage("Page number must be a number")
        .custom(value => value > 0)
        .withMessage("Page number must be positive"),
    query("limit")
        .exists()
        .withMessage("Limit is required")
        .isNumeric()
        .withMessage("Limit must be a number")
        .custom(value => value > 0)
        .withMessage("Limit must be positive"),
    query("categoryId")
        .optional()
        .isNumeric()
        .withMessage("Category id must be a number")
        .custom(value => value > 0)
        .withMessage("Category id must be positive"),
    query("authorId")
        .optional()
        .isNumeric()
        .withMessage("Author id must be a number")
        .custom(value => value > 0)
        .withMessage("Author id must be positive"),
    query("yearFrom")
        .optional()
        .isNumeric()
        .withMessage("Starting Yead must be a number")
        .custom(value => value > 0 && Number(value) <= new Date().getFullYear())
        .withMessage("Starting year must be positive and not greater then current year"),
    query("yearTo")
        .optional()
        .isNumeric()
        .withMessage("Ending year must be a number")
        .custom(value => value > 0 && Number(value) <= new Date().getFullYear())
        .withMessage("Ending year must be positive and not greater than the current year"),
    query("sortBy")
        .optional()
        .isIn(["title", "publishedYear", "availableCopies"])
        .withMessage("Sort by must be title, publishedYear, or availableCopies"),
    query("sortOrder")
        .optional()
        .isIn(["asc", "desc"])
        .withMessage("Sort order must be asc or desc"),
    query("search")
        .optional()
        .escape(),
    validateRequest,
    bookController.listBooks
)

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

router.post("/update",
    validateToken,
    isAdmin,
    body("bookId")
        .exists()
        .withMessage("Book id is required")
        .isNumeric()
        .withMessage("Book id must be a number")
        .toInt()
        .custom(value => value > 0)
        .withMessage("Book id must be positive"),
    body("title")
        .optional()
        .notEmpty()
        .withMessage("Author name must not be empty")
        .escape(),
    body("isbn")
        .optional()
        .notEmpty()
        .withMessage("ISBN must not be empty")
        .escape(),
    body("authorId")
        .optional().isNumeric()
        .withMessage("Author id must be a number")
        .toInt()
        .custom(value => value > 0)
        .withMessage("Author id must be positive"),
    body("categoryId")
        .optional()
        .isNumeric()
        .withMessage("Category id must be a number")
        .toInt()
        .custom(value => value > 0)
        .withMessage("Category id must be positive"),
    body("publishedYear")
        .optional()
        .isNumeric()
        .withMessage("Published year must be a number")
        .toInt()
        .custom(value => value > 0 && value <= new Date().getFullYear())
        .withMessage("Published year must be posititve and not greater then current year"),
    validateRequest,
    bookController.updateBook
)

router.get("/details",
    validateToken,
    body("bookId")
        .exists()
        .withMessage("Book id is required")
        .isNumeric()
        .withMessage("Book id must be a number")
        .toInt()
        .custom(value => value > 0)
        .withMessage("Book id must be positive"),
    validateRequest,
    bookController.retrieveBookDetails
)

router.post("/delete",
    validateToken,
    isAdmin,
    body("bookId")
        .exists()
        .withMessage("Book id is required")
        .isNumeric()
        .withMessage("Book id must be a number")
        .toInt()
        .custom(value => value > 0)
        .withMessage("Book id must be positive"),
    validateRequest,
    bookController.deleteBook
)