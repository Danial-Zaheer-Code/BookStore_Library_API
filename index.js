import dotenv from "dotenv"
dotenv.config();

import express from "express"
import multer from "multer"
import {router as userRouter} from "./src/routers/userRouter.js"
import {router as authorRouter} from "./src/routers/authorRouter.js"
import {router as categoryRouter} from "./src/routers/categoryRouter.js"
import {router as bookRouter} from "./src/routers/bookRouter.js"
import {router as borrowRouter} from "./src/routers/borrowRouter.js"
import { router as reservationRouter } from "./src/routers/reservationRouter.js";
const app = express();
const upload = multer();

app.disable('x-powered-by');
app.use(upload.none());
app.use("/api/users", userRouter)
app.use("/api/authors", authorRouter)
app.use("/api/categories", categoryRouter)
app.use("/api/books", bookRouter)
app.use("/api/borrow", borrowRouter)
app.use("/api/reservations", reservationRouter)
app.listen(process.env.PORT, () => {
	console.log(`Example app listening on port ${process.env.PORT}`)
})