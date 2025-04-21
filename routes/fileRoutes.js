// fileRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const connection = require("../db");
const cookieparser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
    throw new Error("SECRET_KEY is not defined in environment variables.");
}

router.use(cookieparser());

const verifyRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ message: "Access denied. Insufficient permissions." });
        }
        next();
    };
};

const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Access denied. No token provided." });
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid or expired token." });
        }
        req.user = decoded;
        next();
    });
};

const isValidPassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
};

// Register Method
router.post("/register", async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).json({ message: "Please fill all fields" });
    }

   
    if (!isValidPassword(password)) {
        return res.status(400).json({
            message: "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.",
        });
    }

    connection.query("SELECT * FROM users WHERE username = ? OR email = ?", [username, email], async (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (results.length > 0) return res.status(400).json({ message: "Username or email already taken" });

        const hashedPassword = await bcrypt.hash(password, 10);
        connection.query("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
            [username, email, hashedPassword, role],
            (err) => {
                if (err) return res.status(500).json({ message: "Error saving user" });
                res.status(201).json({ message: "User registered successfully" });
            }
        );
    });
});

// Login Method
router.post("/login", async (req, res) => {
    const { identifier, password } = req.body; // identifier can be username or email

    if (!identifier || !password) {
        return res.status(400).json({ message: "Please provide username/email and password" });
    }

    connection.query("SELECT * FROM users WHERE username = ? OR email = ?", [identifier, identifier], async (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (results.length === 0) return res.status(401).json({ message: "Invalid credentials" });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: "1h" });

        connection.query("INSERT INTO tokens (user_id, token) VALUES (?, ?)", [user.id, token], (err) => {
            if (err) return res.status(500).json({ message: "Error saving token" });
            res.json({ message: "Login successful", token });
        });
    });
});

// Logout Method
router.post("/logout", verifyToken, (req, res) => {
    const token = req.headers["authorization"].split(" ")[1];

    connection.query("SELECT * FROM revoked_tokens WHERE token = ?", [token], (err, results) => {
        if (err) return res.status(500).json({ message: "Error checking token", error: err.message });
        if (results.length > 0) return res.status(400).json({ message: "This token has already been revoked." });

        // Insert the token into the revoked_tokens table without deleting it from the tokens table
        connection.query("INSERT INTO revoked_tokens (token) VALUES (?)", [token], (err) => {
            if (err) return res.status(500).json({ message: "Error revoking token", error: err.message });

            res.json({ message: "Logged out successfully." });
        });
    });
});

// create favorite cities.
router.post("/create-favorite-city", verifyToken, verifyRole("user"), async (req, res) => {
    console.log("Received request to create favorite city");
    const user_Id = req.user.id;
    const { city, Country } = req.body;

    if (!city || !Country) {
        return res.status(400).json({ message: "City and Country are required." });
    }

    connection.query(
        "SELECT * FROM favorite_cities WHERE user_id = ? AND city_name = ?", [user_Id, city],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Error checking existing favorite city", error: err.message });
            }

            if (results.length > 0) {
                return res.status(400).json({ message: "This city is already in your favorites" });
            }

            connection.query(
                "INSERT INTO favorite_cities (user_id, city_name, country) VALUES (?, ?, ?)", [user_Id, city, Country],
                (err, results) => {
                    if (err) {
                        return res.status(500).json({ message: "Error saving favorite city", error: err.message });
                    }
                    res.status(201).json({ message: "Favorite city saved successfully!" });
                }
            );
        }
    );
});

// get favorite cities.
router.get("/get-favorite-cities", verifyToken, verifyRole("user"),(req, res) => {
    const user_Id = req.user.id;

    connection.query(
        "SELECT * FROM favorite_cities WHERE user_id = ?",[user_Id],(err, results) => {
            if (err) {
                return res.status(500).json({ message: "Error fetching favorite cities", error: err.message });
            }
            res.json(results);
        }
    );
});

// get favorite city by City id.
router.get("/get-favorite-city-by-id/:id", verifyToken, verifyRole("user"), (req, res) => {
    const City_id = req.params.id;

    connection.query(
        "SELECT * FROM favorite_cities WHERE id = ? AND user_id = ?", [City_id, req.user.id], (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Error fetching favorite city", error: err.message });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'City not found or user has no access to this city' });
            }

            res.json(results[0]);
        }
    );
});
  
// update favorite city.
router.put("/update-favorites-cities/:id", verifyToken, verifyRole("user"),(req, res) => {
    const user_Id = req.user.id;
    const { city } = req.body;
    const City_id = req.params.id;

    connection.query(
        "UPDATE favorite_cities SET city_name = ? WHERE id = ? AND user_id = ?",[city, City_id, user_Id],(err, results) => {
            if (err) {
                return res.status(500).json({ message: "Error updating favorite city", error: err.message });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "City not found or not authorized to update" });
            }
            res.json({ message: "Favorite city updated successfully!" });
        }
    );
});

// Delete favorite city.
router.delete("/favorites/:id", verifyToken, verifyRole("user"),(req, res) => {
    const userId = req.user.id;
    const favoriteId = req.params.id;

    connection.query(
        "DELETE FROM favorite_cities WHERE id = ? AND user_id = ?",
        [favoriteId, userId],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Error deleting favorite city", error: err.message });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "City not found or not authorized to delete" });
            }
            res.json({ message: "Favorite city deleted successfully!" });
        }
    );
});

module.exports = router;