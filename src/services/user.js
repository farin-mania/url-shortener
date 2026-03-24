import { db } from "../index.js"

export const getUser = async (email) => {
    const user = await db.prepare("SELECT * FROM brukere WHERE epost = ?").get(email);

    return user;
}

export const createUser = async (email, password, username) => {
    const existingUser = await getUser(email);
    if (existingUser) {
        throw Error("A user for this email address already exists");
    }

    const insert = db.prepare('INSERT INTO brukere (brukernavn, passord, epost) VALUES (?, ?, ?)');
    await insert.run(username, password, email);
}