import express from 'express';
import dotenv from 'dotenv'
import http from 'http'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import cors from 'cors'
import authRoutes from './routes/AuthRoute.js'
import podcastsRoutes from './routes/PodcastRoute.js'
import userRoutes from './routes/UserRoute.js'
import subscriptionRoutes from './routes/SubRoute.js'


dotenv.config(
    {
        path: '.env.local'
    }
)

const app = express();
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: `${process.env.FRONTEND_URL}`,
        credentials: true,
    }
})

app.use((req, res, next) => {
    req.io = io;
    next();
})

io.on("connection", (socket) => {
    console.log("User connected");

    socket.on('join', (userId) => {
        socket.join(userId)
    })

    socket.on("disconnecting", () => {
        for (const room of socket.rooms) {
            if (room !== socket.id) {
                socket.to(room).emit("user has left", socket.id)
            }
        }
    })
})

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const corsConfig = {
    credentials: true,
    origin: `${process.env.FRONTEND_URL}`
}

app.use(cors(corsConfig))

const port = process.env.PORT || 5000

const connect = () => {
    mongoose.set('strictQuery', true)
    mongoose.connect(process.env.MONGODB_DRIVER, { serverSelectionTimeoutMS: 10000 }).then(() => {
        console.log(`Connected to MONGODB`)
    }).catch((err) => {
        console.log(`Error connecting ${err}`)
    })
}

app.use("/api/auth", authRoutes)
app.use("/api/podcasts", podcastsRoutes)
app.use("/api/user", userRoutes)
app.use("/api/subscription", subscriptionRoutes)

app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Something went wrong";
    return res.status(status).json({
        success: false,
        status,
        message
    })
})

server.listen(port, () => {
    console.log(`Server listening on port ${port}`)
    console.info('connecting...')
    connect()
})