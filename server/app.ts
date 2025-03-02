import express, {Express} from "express"
import path from "path"
import morgan from "morgan"
import mongoose, { Connection } from 'mongoose'
import cors, {CorsOptions} from 'cors'
import router from  "./src/routes/index"
import passport from "./src/middleware/google-passport-config"

require('dotenv').config()

const app: Express = express()
const port: number = parseInt(process.env.PORT as string) || 1234

const mongoDB: string = "mongodb://127.0.0.1:27017/project"
mongoose.connect(mongoDB)
mongoose.Promise = Promise
const db: Connection = mongoose.connection

db.on("error", console.error.bind(console, "MongoDB connection error"))

const corsOptions: CorsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(morgan("dev"))

app.use(passport.initialize())

app.use(express.static(path.join(__dirname, "../public")))
app.use("/", router)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)

})