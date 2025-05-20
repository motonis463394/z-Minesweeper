const fs = require('fs');
const fetch = require('node-fetch');

async function updateScoreboardOnGitHub() {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        console.error("❌ GITHUB_TOKEN environment variable not set.");
        return;
    }

    const owner = 'motonis463394';
    const repo = 'z-Minesweeper';
    const path = 'Scoreboard.json';
    const branch = 'main';
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    console.log("🔄 Starting scoreboard update...");

    // Step 1: Get the current file SHA
    console.log("📥 Fetching current file metadata...");
    const getRes = await fetch(url, {
        headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json'
        }
    });

    if (!getRes.ok) {
        console.error(`❌ Failed to fetch file metadata: ${getRes.status} ${await getRes.text()}`);
        return;
    }

    const fileData = await getRes.json();
    const sha = fileData.sha;
    console.log(`✅ File SHA retrieved: ${sha}`);

    // Step 2: Prepare updated content
    const updatedScoreboard = {
        player1: {
            easy: { bestTime: 120, wins: 5 },
            medium: { bestTime: 300, wins: 3 },
            hard: { bestTime: 600, wins: 1 }
        },
        player2: {
            easy: { bestTime: 150, wins: 4 },
            medium: { bestTime: 350, wins: 2 },
            hard: { bestTime: 700, wins: 1 }
        }
    };

    const content = Buffer.from(JSON.stringify(updatedScoreboard, null, 2)).toString('base64');
    console.log("📝 Updated content prepared.");

    // Step 3: Send PUT request to update the file
    console.log("📤 Sending update request to GitHub...");
    const updateRes = await fetch(url, {
        method: 'PUT',
        headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
            message: 'Update scoreboard via GitHub Actions',
            content: content,
            sha: sha,
            branch: branch
        })
    });

    if (updateRes.ok) {
        const result = await updateRes.json();
        console.log("✅ Scoreboard updated successfully!");
        console.log(`🔗 View it here: ${result.content.html_url}`);
    } else {
        console.error(`❌ Failed to update scoreboard: ${updateRes.status} ${await updateRes.text()}`);
    }
}

updateScoreboardOnGitHub();
