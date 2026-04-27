import express from "express";
import Database from 'better-sqlite3';
import { createUser, getUserByEmail, getUserById } from "./services/user.js";
import cors from "cors";
import session from "express-session";
import bcrypt from "bcrypt";
import { requireAuth } from "./services/middleware.js";
import crypto from "crypto";
import { documentClick, getTotalClicks } from "./services/metrics.js";

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
    console.log(user);
    if (!user || !(await bcrypt.compare(password, user.passord))) {
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
    return res.json({
        email: user.epost,
        brukernavn: user.brukernavn
    });
})

app.get("/api/links", requireAuth, async (req, res) => {
    const links = db.prepare("SELECT * FROM links WHERE bruker_id = ?").all(req.session.userId);


    for (const link of links) {
        const totalClicks = getTotalClicks(link.link_id);
        link.totalClicks = totalClicks;
    }

    return res.json(links);
});

app.post("/api/shorten", requireAuth, async (req, res) => {
    const { url } = req.body;

    const shortened = crypto.randomBytes(4).toString("hex");

    const insert = db.prepare("INSERT INTO links (bruker_id, original_url, shortened_url) VALUES (?, ?, ?)");
    insert.run(req.session.userId, url, shortened);

    return res.json({
        shortUrl: `http://localhost:${PORT}/${shortened}`
    });
});

app.get("/:code", async (req, res) => {
    const link = db.prepare("SELECT * FROM links WHERE shortened_url = ?").get(req.params.code);
    if (!link) {
        return res.status(404).send("Ikke funnet");
    }
    const ip = req.ip;
    console.log(ip, link)
    documentClick(ip, link.link_id);
    getTotalClicks(link.link_id);


    return res.redirect(link.original_url);
});

app.post("/api/logout", requireAuth, async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
    });

    return res.json({ ok: true });
})

app.listen(PORT, () => {
    console.log("Running on port:", PORT);
});