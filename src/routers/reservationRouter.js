import express from "express"
import { body, query } from "express-validator"
import { validateRequest } from "../middleware/requestValidation.js";
import { validateToken } from "../middleware/tokenValidation.js";
import { isAdmin } from "../middleware/adminValidation.js";
import * as reservationController from "../controllers/reservationController.js"

export const router = express.Router()