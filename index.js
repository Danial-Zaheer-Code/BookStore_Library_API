import dotenv from "dotenv"
dotenv.config();

import express from "express"

const app = express();

app.disable('x-powered-by');
app.use(express.json());

app.listen(process.env.PORT, () => {
	console.log(`Example app listening on port ${process.env.PORT}`)
})