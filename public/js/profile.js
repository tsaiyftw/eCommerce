const token = localStorage.getItem("jwt")

window.addEventListener("load", async (event) => {
    try {
        if (!token) {
            alert("Please sign in first")
            window.location.href = "/sign.html"
            return
        }
        await authMember();
        revealProfile(auth_res)

        console.log("token:", token)

    }
    catch (error) {
        console.log(error)
    }

})

let auth_res
async function authMember() {
    try {
        auth_res = await axios.get("/api/1.0/user/profile", {
            headers: {
                "Authorization": `${localStorage.getItem("jwt")}`
            }
        }).catch(error => {
            let err = error.response.data
            alert(err)
        })
        console.log("auth res: ", auth_res)
        return auth_res
    }
    catch (error) {
        console.log(error)
    }
}

function revealProfile(auth_res) {
    const provider = document.getElementById("provider")
    const name = document.getElementById("name")
    const email = document.getElementById("email")
    const picture = document.getElementById("picture")

    const profile_info = auth_res.data.data

    provider.innerHTML = `Provider: ${profile_info.provider}`
    name.innerHTML = `Name: ${profile_info.name}`
    email.innerHTML = `Email: ${profile_info.email}`
    picture.style.backgroundImage = `"url("${profile_info.picture}")"`
}

function logout() {
    localStorage.removeItem("jwt")
    window.location.href = "/sign.html"
}