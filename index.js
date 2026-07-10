import dotenv from "dotenv"
dotenv.config();

import express from "express"
import multer from "multer"
import {router as userRouter} from "./src/routers/userRouter.js"
import {router as authorRouter} from "./src/routers/authorRouter.js"

const app = express();
const upload = multer();

app.disable('x-powered-by');
app.use(upload.none());
app.use("/api/users", userRouter)
app.use("/api/authors", authorRouter)
app.listen(process.env.PORT, () => {
	console.log(`Example app listening on port ${process.env.PORT}`)
})