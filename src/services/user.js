import { db, saltRounds } from "../index.js";
import bryct from "bcrypt";

export const getUserByEmail = async (email) => {
    const user = await db.prepare("SELECT * FROM brukere WHERE epost = ?").get(email);

    return user;
}

export const getUserById = async (id) => {
    const user = await db.prepare("SELECT * FROM brukere WHERE bruker_id = ?").get(id);

    return user;
}


export const createUser = async (email, password, username) => {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        throw Error("A user for this email address already exists");
    }

    const salt = await bryct.genSalt(saltRounds);
    const encrypted = await bryct.hash(password, salt);

    const insert = db.prepare('INSERT INTO brukere (brukernavn, passord, epost) VALUES (?, ?, ?)');
    await insert.run(username, encrypted, email);

    return await getUserByEmail(email);
}