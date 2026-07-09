import express from "express"
import { check } from "express-validator"
import { validateRequest } from "../middleware/requestValidation.js";
import { validateToken, validateRefreshToken } from "../middleware/tokenValidation.js";
import { isAdmin } from "../middleware/adminValidation.js";
import * as userController from "../controllers/userController.js";

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
    userController.register
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
    userController.login
)

router.post("/refresh-token",
    check("token")
        .exists()
        .withMessage("Refresh token is required")
        .notEmpty()
        .withMessage("Refresh token must not be empty"),
    validateRequest,
    validateRefreshToken,
    userController.refresh

)

router.post("/update-profile",
    check("email")
        .optional()
        .isEmail()
        .withMessage("Invalid email")
        .normalizeEmail(),
    check("name")
        .optional()
        .notEmpty()
        .withMessage("Name must not be empty")
        .trim()
        .escape(),
    check("password")
        .optional()
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 chars long"),
    validateRequest,
    validateToken,
    userController.updateUser
)

router.get("/profile",
    validateRequest,
    validateToken,
    userController.retrieveProfile
)

router.get("/list",
    validateRequest,
    validateToken,
    isAdmin,
    (req, res) => {
        return res.status(200).json("Authenticated")
    }
)