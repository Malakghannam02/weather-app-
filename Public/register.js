document.getElementById("register-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    const data = { username, email, password, role };

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
            window.location.href = "login.html";
        } else {
            // عرض رسالة الخطأ القادمة من السيرفر
            document.getElementById("error-message").textContent = result.message || "Registration failed.";
        }
    } catch (error) {
        console.error("Error during registration:", error);
        document.getElementById("error-message").textContent = "An error occurred. Please try again.";
    }
});
