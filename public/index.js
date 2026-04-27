const registrerForm = document.getElementById("registrer");
const loginForm = document.getElementById("login");
const loginContainer = document.getElementById("login-container");
const shortenerContainer = document.getElementById("shortener-container");
const shortenForm = document.getElementById("shorten-form");
const resultDiv = document.getElementById("result");
const welcomeMsg = document.getElementById("welcome-msg");
const logoutBtn = document.getElementById("logout-btn");
const linksTable = document.getElementById("links-table");

const API_URL = "http://localhost:3000/api";

registrerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(registrerForm);

    const email = data.get("email");
    const username = data.get("brukernavn");
    const password = data.get("password");

    const res = await fetch(API_URL + "/register", {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            email,
            username,
            password
        })
    })

    if (res.ok) {
        run();
    }
})

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(loginForm);

    const email = data.get("email");
    const password = data.get("password");

    const res = await fetch(API_URL + "/login", {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            email,
            password
        })
    })

    if (res.ok) {
        run();
    }
})

shortenForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(shortenForm);
    const url = data.get("url");

    const res = await fetch(API_URL + "/shorten", {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ url })
    })

    if (res.ok) {
        const json = await res.json();
        resultDiv.innerHTML = `<a href="${json.shortUrl}">${json.shortUrl}</a>`;
        loadLinks();
    }
})

logoutBtn.addEventListener("click", async () => {
    await fetch(API_URL + "/logout", {
        method: "POST",
        credentials: "include",
    });
    run();
})

const loadLinks = async () => {
    const res = await fetch(API_URL + "/links", { credentials: "include" });
    if (!res.ok) return;
    const links = await res.json();

    linksTable.innerHTML = "<tr><th>Original URL</th><th>Kort URL</th><th>Antall Klikk</th></tr>";
    for (const link of links) {
        const shortUrl = `http://localhost:3000/${link.shortened_url}`;
        const row = document.createElement("tr");
        row.innerHTML = `<td>${link.original_url}</td><td><a href="${shortUrl}">${shortUrl}</a></td><td>${link.totalClicks}</td>`;
        linksTable.appendChild(row);
    }
}

const checkLoggedIn = async () => {
    const res = await fetch(API_URL + "/me", {
        credentials: "include",
    });
    if (!res.ok) return false;
    return await res.json();
};

const run = async () => {
    const userData = await checkLoggedIn();

    if (!userData) {
        loginContainer.style.display = "block";
        shortenerContainer.style.display = "none";
    } else {
        loginContainer.style.display = "none";
        shortenerContainer.style.display = "block";
        welcomeMsg.textContent = "Hei, " + userData.brukernavn;
        loadLinks();
    }
}

run()
