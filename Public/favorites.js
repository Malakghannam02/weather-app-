const API_BASE = "http://localhost:5000/api";
const token = localStorage.getItem("authToken");

if (!token) {
    alert("You are not logged in. Please login first.");
}

async function fetchFavoriteCities() {
    try {
        const response = await fetch(`${API_BASE}/get-favorite-cities`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const cities = await response.json();
        displayCities(cities);
    } catch (error) {
        console.error("Error fetching favorite cities:", error);
        alert("Failed to load favorite cities.");
    }
}

function displayCities(cities) {
    const container = document.getElementById("cities-container");
    container.innerHTML = "";

    if (cities.length === 0) {
        container.innerHTML = "<p>No favorite cities found.</p>";
        return;
    }

    cities.forEach(city => {
        const cityDiv = document.createElement("div");
        cityDiv.className = "city-item";
        cityDiv.innerHTML = `
            <input type="text" value="${city.city_name}" id="city-${city.id}" />
            <button onclick="updateCity(${city.id})">Update</button>
            <button onclick="deleteCity(${city.id})">Delete</button>
            <button onclick="getCityById(${city.id})">Get Details</button>
        `;
        container.appendChild(cityDiv);
    });
}

async function getCityById(id) {
    try {
        const response = await fetch(`${API_BASE}/get-favorite-city-by-id/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const city = await response.json();
        alert(`City: ${city.city_name}`);
    } catch (error) {
        console.error("Error fetching city by ID:", error);
        alert("Failed to get city details.");
    }
}

async function updateCity(id) {
    const newName = document.getElementById(`city-${id}`).value.trim();

    if (!newName) {
        alert("City name cannot be empty.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/update-favorites-cities/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ city: newName })
        });

        const result = await response.json();
        alert(result.message);
        fetchFavoriteCities();
    } catch (error) {
        console.error("Error updating city:", error);
        alert("Failed to update city.");
    }
}

async function deleteCity(id) {
    if (!confirm("Are you sure you want to delete this city?")) return;

    try {
        const response = await fetch(`${API_BASE}/favorites/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();
        alert(result.message);
        fetchFavoriteCities();
    } catch (error) {
        console.error("Error deleting city:", error);
        alert("Failed to delete city.");
    }
}

window.onload = fetchFavoriteCities;
