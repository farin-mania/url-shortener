const registrerForm = document.getElementById("registrer");


const API_URL = "http://localhost:3000/api";

registrerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(registrerForm);

    const email = data.get("email");
    const username = data.get("brukernavn");
    const password = data.get("password");

    console.log(email, password, username);

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

})


const checkLoggedIn = async () => {
    console.log("Checking login")
    const res = await fetch(API_URL + "/me", {
        credentials: "include",
    });
    const data = await res.json();

    return data;
}


checkLoggedIn()