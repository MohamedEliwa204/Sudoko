const boardElement = document.getElementById('board');
const statusMsg = document.getElementById('status-msg');

function createBoard() {
    for (let i = 0; i < 81; i++) {
        let input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 1;
        input.dataset.index = i;
        
        input.addEventListener('input', (e) => {
            if (e.target.value.length > 1) e.target.value = e.target.value.slice(0,1);
            if (!/[1-9]/.test(e.target.value)) {
                e.target.value = '';
                e.target.classList.remove('user-input', 'invalid');
            } else {
                e.target.classList.add('user-input');
                validateInput(i, e.target.value);
            }
        });

        input.addEventListener('keydown', (e) => {
            const inputs = boardElement.querySelectorAll('input');
            const currentIndex = Array.from(inputs).indexOf(e.target);
            const row = Math.floor(currentIndex / 9);
            const col = currentIndex % 9;
            let nextIndex = null;

            if (e.key === 'ArrowRight') {
                if (col < 8) nextIndex = currentIndex + 1;
            } else if (e.key === 'ArrowLeft') {
                if (col > 0) nextIndex = currentIndex - 1;
            } else if (e.key === 'ArrowDown') {
                if (row < 8) nextIndex = currentIndex + 9;
            } else if (e.key === 'ArrowUp') {
                if (row > 0) nextIndex = currentIndex - 9;
            }

            if (nextIndex !== null) {
                e.preventDefault();
                inputs[nextIndex].focus();
            }
        });

        boardElement.appendChild(input);
    }
}

function validateInput(index, value) {
    const inputs = boardElement.querySelectorAll('input');
    const row = Math.floor(index / 9);
    const col = index % 9;
    
    let isValid = true;
    
    for (let i = 0; i < 9; i++) {
        let rVal = inputs[row * 9 + i].value;
        if (i !== col && rVal === value) isValid = false;
        
        let cVal = inputs[i * 9 + col].value;
        if (i !== row && cVal === value) isValid = false;
    }
    
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let idx = (startRow + i) * 9 + (startCol + j);
            if (idx !== index && inputs[idx].value === value) isValid = false;
        }
    }

    if (!isValid) inputs[index].classList.add('invalid');
    else inputs[index].classList.remove('invalid');
}

function getBoardData() {
    let inputs = boardElement.querySelectorAll('input');
    let grid = [];
    let row = [];
    
    inputs.forEach((input, index) => {
        let val = input.value === '' ? 0 : parseInt(input.value);
        row.push(val);
        if ((index + 1) % 9 === 0) {
            grid.push(row);
            row = [];
        }
    });
    return grid;
}

function updateBoard(solution, originalGrid) {
    let inputs = boardElement.querySelectorAll('input');
    inputs.forEach((input, index) => {
        let row = Math.floor(index / 9);
        let col = index % 9;
        
        if (originalGrid[row][col] === 0) {
            input.value = solution[row][col];
            input.classList.add('solved-input');
            input.classList.remove('user-input');
        }
    });
}

async function solveSudoku() {
    statusMsg.innerText = 'Solving...';
    statusMsg.className = 'status';
    
    const grid = getBoardData();
    
    try {
        const response = await fetch('/solve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ grid: grid })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            updateBoard(data.solution, grid);
            statusMsg.innerText = 'Solved Successfully!';
            statusMsg.className = 'status success';
        } else {
            statusMsg.innerText = data.message;
            statusMsg.className = 'status error';
        }
    } catch (error) {
        statusMsg.innerText = 'Server Error';
        statusMsg.className = 'status error';
    }
}

async function fetchRandomBoard() {
    clearBoard();
    statusMsg.innerText = 'Generating...';
    let clues = document.getElementById('clues-count').value;
    if (clues < 17) clues = 17;
    if (clues > 81) clues = 81;
    document.getElementById('clues-count').value = clues;

    try {
        const response = await fetch(`/generate?difficulty=${clues}`);
        const data = await response.json();
        
        if (data.status === 'success') {
            let inputs = boardElement.querySelectorAll('input');
            data.board.forEach((row, r) => {
                row.forEach((val, c) => {
                    if (val !== 0) {
                        let input = inputs[r * 9 + c];
                        input.value = val;
                        input.classList.add('user-input');
                    }
                });
            });
            statusMsg.innerText = `Generated Board with ${clues} clues`;
            statusMsg.className = 'status';
        }
    } catch (error) {
        statusMsg.innerText = 'Error generating board';
        statusMsg.className = 'status error';
    }
}

function clearBoard() {
    let inputs = boardElement.querySelectorAll('input');
    inputs.forEach(input => {
        input.value = '';
        input.classList.remove('user-input', 'solved-input', 'invalid');
    });
    statusMsg.innerText = '';
}

createBoard();