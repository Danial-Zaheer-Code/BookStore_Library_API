import express from "express"
import { body, query } from "express-validator"
import { validateRequest } from "../middleware/requestValidation.js";
import { validateToken } from "../middleware/tokenValidation.js";
import * as reviewController from "../controllers/reviewController.js"

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
    body("rating")
        .exists()
        .withMessage("Rating is required")
        .isNumeric()
        .withMessage("Rating must be a number")
        .toInt()
        .custom(value => value >= 1 && value <= 5)
        .withMessage("Rating must be between 1 and 5"),
    body("comment")
        .optional()
        .isString()
        .withMessage("Comment must be a string")
        .isLength({ max: 200 })
        .withMessage("Comment must be at most 200 characters")
        .escape(),
    validateRequest,
    reviewController.createReview
);

router.get("/by-book",
    body("bookId")
        .exists()
        .withMessage("Book id is required")
        .isNumeric()
        .withMessage("Book id must be a number")
        .toInt()
        .custom(value => value > 0)
        .withMessage("Book id must be positive"),
    validateRequest,
    reviewController.retrieveBookReviews
);

router.post("/delete",
    validateToken,
    body("reviewId")
        .exists()
        .withMessage("Review id is required")
        .isNumeric()
        .withMessage("Review id must be a number")
        .toInt()
        .custom(value => value > 0)
        .withMessage("Review id must be positive"),
    validateRequest,
    reviewController.deleteReview
);
