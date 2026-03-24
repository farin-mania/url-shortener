import express from "express";
import jwt from "jsonwebtoken"
import Database from 'better-sqlite3';

const PORT = 3000;
const app = express();
export const db = new Database("./url-shortener.db");

app.use(express.static("./public"))

app.post("/api/login", (req, res) => {

});

app.post("/api/register", (req, res) => {
    const { email, username, password } = req.body;

});

app.listen(PORT, () => {
    console.log("Running on port:", PORT);
});