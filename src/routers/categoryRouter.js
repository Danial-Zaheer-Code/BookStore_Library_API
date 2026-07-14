import express from "express"
import { body, check, query } from "express-validator"
import { validateRequest } from "../middleware/requestValidation.js";
import { validateToken } from "../middleware/tokenValidation.js";
import { isAdmin } from "../middleware/adminValidation.js";
import * as categoryController from "../controllers/categoryController.js";

export const router = express.Router()

router.post("/create",
    validateToken,
    isAdmin,
    body("name")
    .exists()
    .withMessage("Name is required")
    .notEmpty()
    .withMessage("Name can't be empty"),
    validateRequest,
    categoryController.createCategory
)

router.post("/update",
    validateToken,
    isAdmin,
    body("categoryId")
    .exists()
    .withMessage("Category Id is required")
    .notEmpty()
    .withMessage("Category Id can't be empty")
    .isNumeric()
    .withMessage("Category Id must be a number")
    .toInt(),
    body("name")
    .optional()
    .notEmpty()
    .withMessage("Name can't be empty"),
    validateRequest,
    categoryController.updateCategory
)

router.post("/delete",
    validateToken,
    isAdmin,
    body("categoryId")
    .exists()
    .withMessage("Category Id is required")
    .notEmpty()
    .withMessage("Category Id can't be empty")
    .isNumeric()
    .withMessage("Category Id must be a number")
    .toInt(),
    validateRequest,
    categoryController.deleteCategory
)

router.get("/list",
    validateToken,
    categoryController.listCategories
)

router.get("/details",
    validateToken,
    body("categoryId")
    .exists()
    .withMessage("Category Id is required")
    .isNumeric()
    .withMessage("Category Id must be a number")
    .toInt(),
    query("page")
        .optional()
        .isNumeric()
        .withMessage("Not a number")
        .custom(value => value > 0)
        .withMessage("Page Number must be positive"),
    query("limit")
        .optional()
        .isNumeric()
        .withMessage("Not a number")
        .custom(value => value > 0)
        .withMessage("Page Number must be positive"),
    validateRequest,
    categoryController.retrieveCategoryDetails
)