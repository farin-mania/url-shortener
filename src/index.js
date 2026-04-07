import express from "express";
import Database from 'better-sqlite3';
import { createUser, getUserByEmail, getUserById } from "./services/user.js";
import cors from "cors";
import session from "express-session";
import bcrypt from "bcrypt";
import { requireAuth } from "./services/middleware.js";

const PORT = 3000;
const app = express();

export const saltRounds = 10;

app.use(cors({
    origin: "http://127.0.0.1:3000",
    credentials: true,
})); app.use(express.json());

app.use(session({
    secret: "594IMZr8ARbA5G1Q9WnyOKAbg9++vgs3dOEb0ku4+XJMH9HqmrkLWCfFagak+vJCh1NUGXZMcUxbJi6GIQra1A==",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 // 24 Timer
    }
}))

export const db = new Database("./url-shortener.db");

app.use(express.static("./public"))

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await getUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({
            error: "Invalid credentials"
        });
    }

    req.session.userId = user.bruker_id;

    return res.json({ ok: true });
});

app.post("/api/register", async (req, res) => {
    console.log(req.body);
    const { email, username, password } = req.body;

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        return res.status(409).json({
            error: "Email already exists"
        });
    }

    const user = await createUser(email, password, username);
    console.log(user)

    req.session.userId = user.bruker_id;

    return res.json({ ok: true });
});

app.get("/api/me", requireAuth, async (req, res) => {
    const user = await getUserById(req.session.userId);
    return user;
})

app.listen(PORT, () => {
    console.log("Running on port:", PORT);
});