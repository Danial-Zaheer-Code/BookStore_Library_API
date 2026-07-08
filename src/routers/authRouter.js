import express from "express"
import { check } from "express-validator"
import { validateRequest } from "../middleware/requestValidation.js";
import { validateToken } from "../middleware/tokenValidation.js"
import * as authController from "../controllers/authController.js";

export const router = express.Router();

router.post('/register',
    check("email")
        .exists()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid Email")
        .normalizeEmail(),
    check("name")
        .exists()
        .withMessage("Name is required")
        .isString()
        .withMessage("The name should be a string")
        .notEmpty()
        .withMessage("Name must not be empty")
        .trim()
        .escape(),
    check("password")
        .exists()
        .withMessage("Password is required")
        .isString()
        .withMessage("Password Must be a string")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 chars long"),
    validateRequest,
    authController.register
)
