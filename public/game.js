let countUpInterval;

function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    const display = document.getElementById('countup');
    let timer = 0;

    overlay.style.display = 'flex';

    countUpInterval = setInterval(function () {
        display.textContent = timer + "s";
        if (timer >= 60) {
            display.textContent = "Completed in " + timer + "s!";
        }
        timer++;
    }, 1000);
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    clearInterval(countUpInterval);
    overlay.style.display = 'none';
}

const difficulties = {
    easy: { rows: 8, cols: 8, mines: 10 },
    medium: { rows: 10, cols: 10, mines: 15 },
    hard: { rows: 12, cols: 12, mines: 25 }
};

let currentDifficulty = "medium";
let ROWS, COLS, MINES_COUNT;
let board = [];
let gameOver = false;
let flagsUsed = 0;
let timerInterval = null;
let startTime = null;
let currentPlayer = "";

const gameContainer = document.getElementById('game');
const timerDisplay = document.getElementById('timer');
const mineCounterDisplay = document.getElementById('mine-counter');
const flagCounterDisplay = document.getElementById('flag-counter');
const scoreboardBody = document.getElementById('scoreboard-body');

let scoreboard = {};

function fetchScoreboardAndUpdateDisplay() {
    showLoading();

    const url = `https://raw.githubusercontent.com/motonis463394/z-Minesweeper/main/Scoreboard.json?cacheBust=${Date.now()}`;

    fetch(url, { cache: "no-store" })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch scoreboard");
            }
            return response.json();
        })
        .then(data => {
            //console.log("✅ Scoreboard fetched:", data);
            scoreboard = data;
            updateScoreboardDisplay();
        })
        .catch(error => {
            console.error("❌ Error loading scoreboard:", error);
            hideLoading();
        });
}


function updateScoreboardDisplay() {
    if (!scoreboardBody) {
        console.warn("scoreboardBody element not found.");
        return;
    }

    scoreboardBody.innerHTML = "";

    const difficultyOrder = { hard: 0, medium: 1, easy: 2 };
    const rows = [];

    for (const [player, data] of Object.entries(scoreboard)) {
        for (const [difficulty, stats] of Object.entries(data)) {
            rows.push({
                player,
                difficulty,
                bestTime: stats.bestTime ?? Infinity,
                wins: stats.wins ?? 0
            });
        }
    }

    rows.sort((a, b) => {
        const diffCompare = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        if (diffCompare !== 0) return diffCompare;
        return a.bestTime - b.bestTime;
    });

    for (const rowData of rows) {
        const row = document.createElement("tr");
        row.innerHTML = `
                                <td>${rowData.player}</td>
                                <td>${rowData.difficulty}</td>
                                <td>${formatTime(rowData.bestTime)}</td>
                                <td>${rowData.wins}</td>
                                `;
        scoreboardBody.appendChild(row);
    }

    if (rows.length === 0) {
        const emptyRow = document.createElement("tr");
        emptyRow.innerHTML = "<td colspan='4'>No scores available</td>";
        scoreboardBody.appendChild(emptyRow);
    }
    hideLoading();
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        let seconds = Math.floor((Date.now() - startTime) / 1000);
        timerDisplay.innerHTML = "Time: " + seconds + " s";
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function formatTime(seconds) {
    if (seconds === Infinity) return "-";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
}

async function updateScoreboardOnGitHub(updatedScoreboard) {
    showLoading();
    // Step 1: Fetch GitHub token correctly
    let token;
    try {
        const configRes = await fetch("/config");
        if (!configRes.ok) {
            throw new Error(`Failed to fetch config: ${configRes.status}`);
        }
        const configData = await configRes.json();
        token = configData.githubToken;

        if (!token) {
            console.error("❌ GitHub token is undefined!");
            return;
        }
    } catch (error) {
        console.error("❌ Error fetching config:", error);
        return;
    }

    const owner = 'motonis463394';
    const repo = 'z-Minesweeper';
    const path = 'Scoreboard.json';
    const branch = 'main';
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    //console.log("🔄 Starting scoreboard update...");
    //console.log("🔑 Using GitHub token:", token);

    try {
        // Step 2: Get the current file SHA
        //console.log("📥 Fetching current file metadata...");
        const getRes = await fetch(url, {
            headers: {
                Authorization: `token ${token}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        if (!getRes.ok) {
            throw new Error(`Failed to fetch file metadata: ${getRes.status}`);
        }

        const fileData = await getRes.json();
        const sha = fileData.sha;
        //console.log("✅ File SHA retrieved:", sha);

        // Step 3: Prepare updated content
        const content = btoa(JSON.stringify(updatedScoreboard, null, 2));
        //console.log("📝 Updated content prepared.");

        // Step 4: Send PUT request to update the file
        //console.log("📤 Sending update request to GitHub...");
        const updateRes = await fetch(url, {
            method: 'PUT',
            headers: {
                Authorization: `token ${token}`,
                Accept: 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: 'Update scoreboard',
                content: content,
                sha: sha,
                branch: branch
            })
        });

        if (!updateRes.ok) {
            throw new Error(`Failed to update scoreboard: ${updateRes.status}`);
        }

        const result = await updateRes.json();
        //console.log("✅ Scoreboard updated successfully!");
        //console.log("🔗 View it here:", result.content.html_url);
        setTimeout(fetchScoreboardAndUpdateDisplay, 60000); // Refresh scoreboard after 60 seconds
    } catch (error) {
        console.error("❌ Error during scoreboard update:", error);
    }
}

function saveScoreboard() {
    //localStorage.setItem("minesweeperScoreboard", JSON.stringify(scoreboard));
    updateScoreboardOnGitHub(scoreboard);
}

function initGame() {
    const nameInput = document.getElementById("playerName").value.trim();
    if (!nameInput) {
        alert("Please enter your name before starting the game.");
        return;
    }
    currentPlayer = nameInput;

    const config = difficulties[currentDifficulty];
    ROWS = config.rows;
    COLS = config.cols;
    MINES_COUNT = config.mines;
    board = [];
    gameOver = false;
    flagsUsed = 0;
    mineCounterDisplay.innerHTML = "Mines Left: " + MINES_COUNT;
    flagCounterDisplay.innerHTML = "Flags Used: " + flagsUsed;
    clearInterval(timerInterval);
    timerDisplay.innerHTML = "Time: 0 s";
    startTimer();

    gameContainer.innerHTML = "";
    gameContainer.style.gridTemplateColumns = `repeat(${COLS}, 30px)`;

    for (let row = 0; row < ROWS; row++) {
        let rowArr = [];
        for (let col = 0; col < COLS; col++) {
            rowArr.push({
                row, col, isMine: false, revealed: false, flagged: false, adjacentMines: 0
            });
        }
        board.push(rowArr);
    }

    let minesPlaced = 0;
    while (minesPlaced < MINES_COUNT) {
        let r = Math.floor(Math.random() * ROWS);
        let c = Math.floor(Math.random() * COLS);
        if (!board[r][c].isMine) {
            board[r][c].isMine = true;
            minesPlaced++;
        }
    }

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            board[row][col].adjacentMines = countAdjacentMines(row, col);
        }
    }

    renderBoard();
}
function countAdjacentMines(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            let newRow = row + i;
            let newCol = col + j;
            if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
                if (board[newRow][newCol].isMine) count++;
            }
        }
    }
    return count;
}

function renderBoard() {
    gameContainer.innerHTML = "";
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('cell');
            cellDiv.setAttribute('data-row', row);
            cellDiv.setAttribute('data-col', col);
            cellDiv.addEventListener('click', cellLeftClick);
            cellDiv.addEventListener('contextmenu', cellRightClick);
            gameContainer.appendChild(cellDiv);
        }
    }
}

function cellLeftClick(e) {
    if (gameOver) return;
    const cellDiv = e.currentTarget;
    const row = parseInt(cellDiv.getAttribute('data-row'));
    const col = parseInt(cellDiv.getAttribute('data-col'));
    const cell = board[row][col];

    if (cell.flagged || cell.revealed) return;

    if (cell.isMine) {
        cellDiv.classList.add('mine');
        cellDiv.innerHTML = "💣";
        gameOver = true;
        stopTimer();
        revealAllMines();
        alert("Game Over! You hit a mine.");
        return;
    }

    revealCell(cellDiv, cell);
    checkWin();
}

function cellRightClick(e) {
    e.preventDefault();
    if (gameOver) return;
    const cellDiv = e.currentTarget;
    const row = parseInt(cellDiv.getAttribute('data-row'));
    const col = parseInt(cellDiv.getAttribute('data-col'));
    const cell = board[row][col];

    if (cell.revealed) return;

    cell.flagged = !cell.flagged;
    if (cell.flagged) {
        cellDiv.classList.add('flagged');
        cellDiv.innerHTML = "🚩";
        flagsUsed++;
    } else {
        cellDiv.classList.remove('flagged');
        cellDiv.innerHTML = "";
        flagsUsed--;
    }

    flagCounterDisplay.innerHTML = "Flags Used: " + flagsUsed;
    mineCounterDisplay.innerHTML = "Mines Left: " + (MINES_COUNT - flagsUsed);
    if (flagsUsed > MINES_COUNT) {
        alert("Too many flags used!");
        cell.flagged = false;
        cellDiv.classList.remove('flagged');
        cellDiv.innerHTML = "";
        flagsUsed--;
    }
}

function revealCell(cellDiv, cell) {
    if (cell.revealed || cell.flagged) return;
    cell.revealed = true;
    cellDiv.classList.add('revealed');
    if (cell.adjacentMines > 0) {
        cellDiv.innerHTML = cell.adjacentMines;
    } else {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                let newRow = cell.row + i;
                let newCol = cell.col + j;
                if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
                    const neighbor = board[newRow][newCol];
                    const neighborDiv = document.querySelector(`.cell[data-row='${newRow}'][data-col='${newCol}']`);
                    revealCell(neighborDiv, neighbor);
                }
            }
        }
    }
}

function revealAllMines() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = board[row][col];
            if (cell.isMine) {
                const cellDiv = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
                cellDiv.classList.add('mine');
                cellDiv.innerHTML = "💣";
            }
        }
    }
}

function checkWin() {
    let revealedCount = 0;
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col].revealed) revealedCount++;
        }
    }
    if (revealedCount === ROWS * COLS - MINES_COUNT) {
        //fetchScoreboardAndUpdateDisplay();
        gameOver = true;
        stopTimer();
        alert("Congratulations! You won!");
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        if (!scoreboard[currentPlayer]) scoreboard[currentPlayer] = {};
        if (!scoreboard[currentPlayer][currentDifficulty]) {
            scoreboard[currentPlayer][currentDifficulty] = { bestTime: timeTaken, wins: 1 };
        } else {
            const stats = scoreboard[currentPlayer][currentDifficulty];
            stats.wins++;
            if (timeTaken < stats.bestTime) {
                stats.bestTime = timeTaken;
            }
        }
        saveScoreboard();
    }
}

document.getElementById('reset').addEventListener('click', initGame);
document.getElementById('difficulty-select').addEventListener('change', (e) => {
    currentDifficulty = e.target.value;
});

fetchScoreboardAndUpdateDisplay();