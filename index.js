import dotenv from "dotenv"
dotenv.config();

import express from "express"
import {router as authRouter} from "./src/routers/authRouter.js"

const app = express();

app.disable('x-powered-by');
app.use(express.json());
app.use("/api/users", authRouter)
app.listen(process.env.PORT, () => {
	console.log(`Example app listening on port ${process.env.PORT}`)
})