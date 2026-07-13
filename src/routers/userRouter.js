import express from "express"
import { check, query } from "express-validator"
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
    validateToken,
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
    userController.updateUser
)

router.post("/update-role",
    validateToken,
    isAdmin,
    check("userId")
        .exists()
        .withMessage("User Id is required")
        .isNumeric()
        .withMessage("Not a number")
        .customSanitizer(value => Number(value)),
    check("role")
        .exists()
        .withMessage("Role is required")
        .custom(role => role == "USER" || role == "ADMIN")
        .withMessage("Invalid role"),
    validateRequest,

    userController.updateRole
)

router.get("/profile",
    validateToken,
    validateRequest,
    userController.retrieveProfile
)

router.get("/list",
    validateToken,
    isAdmin,
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
    userController.listUsers
)