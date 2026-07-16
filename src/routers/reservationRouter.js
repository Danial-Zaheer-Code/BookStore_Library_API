import express from "express"
import { body, query } from "express-validator"
import { validateRequest } from "../middleware/requestValidation.js";
import { validateToken } from "../middleware/tokenValidation.js";
import { isAdmin } from "../middleware/adminValidation.js";
import * as reservationController from "../controllers/reservationController.js"

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
    reservationController.reserveBook
)