// login.js

document.getElementById("login-form").addEventListener("submit", async function (e) {
    e.preventDefault(); 

    const identifier = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const data = { identifier, password };

    try {
        const response = await fetch("http://localhost:5000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            // Store the token in localStorage
            localStorage.setItem("authToken", result.token); 

            
            window.location.href = "index.html"; // Redirect to homepage 
        } else {
            document.getElementById("error-message").textContent = result.message;
        }
    } catch (error) {
        console.error("Error during login:", error);
        document.getElementById("error-message").textContent = "An error occurred. Please try again.";
    }
});


