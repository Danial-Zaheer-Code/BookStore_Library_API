import express from "express"
import { body, query } from "express-validator"
import { validateRequest } from "../middleware/requestValidation.js";
import { validateToken } from "../middleware/tokenValidation.js";
import { isAdmin } from "../middleware/adminValidation.js";
import * as borrowController from "../controllers/borrowController.js";

export const router = express.Router()

router.post("/create",
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
    borrowController.borrowBook
)

router.post("/return",
    validateToken,
    body("borrowId")
        .exists()
        .withMessage("Borrow id is required")
        .isNumeric()
        .withMessage("Borrow id must be a number")
        .toInt()
        .custom(value => value > 0)
        .withMessage("Book id must be positive"),
    validateRequest,
    borrowController.returnBook
)

router.get("/my-history",
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
    validateRequest,
    borrowController.retrieveMyBorrowHistory
)