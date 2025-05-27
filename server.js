// Import required modules
const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS (optional, useful if frontend makes API requests)
app.use(cors());

// Serve static files efficiently
app.use(express.static("public", { extensions: ["html"] }));

// API to expose environment variables securely
app.get("/config", (req, res) => {
    res.json({ githubToken: process.env.Z_GITHUB_TOKEN || "Not available" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
