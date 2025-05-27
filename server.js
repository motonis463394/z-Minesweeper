// Import required modules
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables (only needed for local development)
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// API to expose environment variables securely
app.get("/config", (req, res) => {
    res.json({ githubToken: process.env.Z_GITHUB_TOKEN || "Not available" });
});

// Serve index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
