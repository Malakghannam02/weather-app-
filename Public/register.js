// register.js

document.getElementById("register-form").addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent default form submission

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    const data = { username, password, role };

    try {
        const response = await fetch("http://localhost:5000/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert("Registration successful! Please log in.");
            window.location.href = "login.html"; // Redirect to login page
        } else {
            document.getElementById("error-message").textContent = result.message;
        }
    } catch (error) {
        console.error("Error during registration:", error);
        document.getElementById("error-message").textContent = "An error occurred. Please try again.";
    }
});

