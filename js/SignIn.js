if (!sessionStorage.getItem("username")) {

    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    signin.onclick = async function () {
        var email = document.getElementById("email").value;
        var pwd = document.getElementById("pwd").value;
        var role = document.getElementById("role").value;

        if (role == "" || email == "") {
            alert("Please select your role and enter your email.");
            return;
        }

        if (!email.match(mailformat)) {
            alert("Please enter a valid email address!");
            return;
        }

        if (pwd == "") {
            alert("Please enter password!");
            return;
        }

        try {
            var response = await fetch("api/login.php", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({role: role, email: email, password: pwd})
            });

            var result = await response.json();
            if (result.success) {
                alert("Congratulations! " + result.user.username + " logged in successfully!");
                sessionStorage.setItem("username", result.user.username);
                sessionStorage.setItem("mnumber", result.user.mobilenumber);
                sessionStorage.setItem("role", result.user.role);
                window.location.href = "index.html";
            } else {
                alert(result.message || "Login failed.");
            }
        } catch (error) {
            console.error(error);
            alert("Login failed due to a server error.");
        }
    }
}
