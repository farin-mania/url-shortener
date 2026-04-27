import { db } from "../index.js"

export const documentClick = (ip, link_id) => {
    const time = new Date().getTime();
    const insert = db.prepare("INSERT INTO clicks (link_id, timestamp, ip_adresse) VALUES (?, ?, ?)");
    insert.run(link_id, time, ip);
}

export const getTotalClicks = (link_id) => {
    const totalClicks = db.prepare("SELECT COUNT(*) AS total FROM clicks WHERE link_id = ?").get(link_id);
    console.log(totalClicks)

    return totalClicks.total;
}