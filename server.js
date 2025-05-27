// Import required modules
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Define a route to return environment variables securely (if needed)
app.get("/config", (req, res) => {
    res.json({ githubToken: process.env.Z_GITHUB_TOKEN || "Not available" });
});

// Define a route to serve index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
