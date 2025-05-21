const express = require("express");
const path = require("path");
require("dotenv").config(); // Load .env variables

const app = express();
const PORT = process.env.PORT || 3000; // Use environment variable for port

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Define a route for the homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
