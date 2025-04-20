function getWeather() {
    const city = document.getElementById('city-input').value;
    if (!city) {
        alert('Please enter a city');
        return;
    }

    fetch(`http://localhost:5000/api/weather/${city}`)
        .then(response => response.json())
        .then(data => displayWeather(data))
        .catch(error => {
            console.error('Error fetching weather:', error);
            alert('Error fetching weather data.');
        });
}

function displayWeather(data) {
    if (!data || typeof data !== "object") {
        alert("Invalid weather data.");
        return;
    }

    document.getElementById("city-input").value = data.city; // Set city name in search box
    document.getElementById("temperature").textContent = `Temperature: ${Math.round(data.temperature)}°C`;
    document.getElementById("description").textContent = `Description: ${data.description}`;
    document.getElementById("humidity").textContent = `Humidity: ${data.humidity}%`;
    document.getElementById("wind-speed").textContent = `Wind Speed: ${data.windSpeed} m/s`;

    document.getElementById("fav-icon").style.display = "inline"; // Show the star icon
}

async function saveFavoriteCity() {
    const city = document.getElementById('city-input').value.trim();
    if (!city) {
        alert("Please enter a city before saving.");
        return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
        alert("Token not found. Please log in again.");
        return;
    }

    const country = "Jordan";

    try {
        console.log("City:", city);
        console.log("Token:", token);

        const response = await fetch("http://localhost:5000/api/create-favorite-city", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ city, Country: country })
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById("fav-icon").classList.add("saved");
            document.getElementById("fav-icon").title = "Saved to Favorites";
            alert("City added to favorites!");
        } else {
            console.log("Response Status:", response.status);
            console.log("Response Body:", result);
            alert(result.message || "Failed to save city.");
        }
    } catch (error) {
        console.error("Error saving favorite city:", error);
        alert("Error saving favorite city.");
    }
}

// Function to check if the user is logged in
function checkLoginStatus() {
    const token = localStorage.getItem("authToken");

    if (token) {
        document.getElementById("logout-btn").style.display = "inline"; // إظهار زر تسجيل الخروج
    } else {
        document.getElementById("logout-btn").style.display = "none"; // إخفاء زر تسجيل الخروج
    }
}

// Function to handle logout
function logout() {
    localStorage.removeItem("authToken");
    checkLoginStatus();
}

window.onload = checkLoginStatus;

