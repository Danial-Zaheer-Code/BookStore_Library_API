import express from "express"
import { check } from "express-validator"
import { validateRequest } from "../middleware/requestValidation.js";
import { validateToken, validateRefreshToken } from "../middleware/tokenValidation.js";
import * as authController from "../controllers/authController.js";

export const router = express.Router();

router.post('/register',
    check("email")
        .exists()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email")
        .normalizeEmail(),
    check("name")
        .exists()
        .withMessage("Name is required")
        .notEmpty()
        .withMessage("Name must not be empty")
        .trim()
        .escape(),
    check("password")
        .exists()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 chars long"),
    validateRequest,
    authController.register
)

router.post('/login',
    check("email")
        .exists()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email")
        .trim()
        .normalizeEmail(),
    check("password")
        .exists()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage("Must be at least 8 chars long"),
    validateRequest,
    authController.login
)

router.post("/refresh", 
    check("token")
    .exists()
    .withMessage("Refresh token is required")
    .notEmpty()
    .withMessage("Refresh token must not be empty"),
    validateRequest,
    validateRefreshToken,
    authController.refresh

)
