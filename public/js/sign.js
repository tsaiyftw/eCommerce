async function signUp(event) {
    event.preventDefault();

    let name = document.getElementById("sign_up_name").value;
    let email = document.getElementById("sign_up_email").value;
    let password = document.getElementById("sign_up_pwd").value;

    if (name == "" | email == "" | password == "") {
        alert("You need to provid name, email and password!")
        return
    }
    try {
        const data = {
            name: name,
            email: email,
            password: password,
        }
        const singup_res = await axios.post('/api/1.0/user/signup', data, {
            headers: { "content-type": "application/json" }
        }).catch(error => {
            let err = error.response.data
            alert(err)
        })

        const token = singup_res.data.data.access_token
        localStorage.setItem("Authoriztion", `Bearer ${token}`)
        if (token) {
            alert("Sign up successfully!")
            window.location.href = '/profile.html'
        }
        // const fields = {
        //     name: name,
        //     email: email,
        //     password: password,
        // }
        // fetch('/api/1.0/user/signup', {
        //     method: "POST",
        //     headers: new Headers({ "content-type": "application/json" }),
        //     body: JSON.stringify(fields),
        // })

    }
    catch (error) {
        console.log(error)
    }
};

async function signIn(event) {
    event.preventDefault();

    let email = document.getElementById("sign_in_email").value;
    let password = document.getElementById("sign_in_pwd").value;

    if (email == "" | password == "") {
        alert("You need to provid email and password!")
        return
    }
    try {
        const data = {
            email: email,
            password: password,
            provider: "native",
        }
        const singin_res = await axios.post('/api/1.0/user/signin', data, {
            headers: { "content-type": "application/json" }
        }).catch(error => {
            let err = error.response.data
            alert(err)
        })

        const token = singin_res.data.data.access_token
        localStorage.setItem("jwt", `Bearer ${token}`)
        if (token) {
            alert("Sign in successfully!")
            window.location.href = '/profile.html'
        }
    }
    catch (error) {
        console.log(error)
    }
};

function statusChangeCallback(response) {  // Called with the results from FB.getLoginStatus().
    console.log('statusChangeCallback');
    console.log(response);                   // The current login status of the person.
    if (response.status === 'connected') {
        // Logged into your webpage and Facebook.
        console.log("res token: ", response.authResponse.accessToken);
        const fields = {
            provider: "facebook",
            access_token: response.authResponse.accessToken,
        }
        fetch('/api/1.0/user/signin', {
            method: "POST",
            headers: new Headers({ "content-type": "application/json" }),
            body: JSON.stringify(fields),
        })
        testAPI();
    } else {                                 // Not logged into your webpage or we are unable to tell.
        document.getElementById('status').innerHTML = 'Please log ' +
            'into this webpage.';
    }
}


function checkLoginState() {               // Called when a person is finished with the Login Button.
    FB.getLoginStatus(function (response) {   // See the onlogin handler
        statusChangeCallback(response);
    });
}


window.fbAsyncInit = function () {
    FB.init({
        appId: '573821514272795',
        cookie: true,                     // Enable cookies to allow the server to access the session.
        xfbml: true,                     // Parse social plugins on this webpage.
        version: 'v14.0'           // Use this Graph API version for this call.
    });


    FB.getLoginStatus(function (response) {   // Called after the JS SDK has been initialized.
        statusChangeCallback(response);        // Returns the login status.
    });
};

function testAPI() {                      // Testing Graph API after login.  See statusChangeCallback() for when this call is made.
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function (response) {
        console.log('Successful login for: ' + response.name);
        document.getElementById('status').innerHTML =
            'Thanks for logging in, ' + response.name + '!';
    });
}