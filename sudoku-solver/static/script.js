const boardElement = document.getElementById('board');
const statusMsg = document.getElementById('status-msg');

function createBoard() {
    for (let i = 0; i < 81; i++) {
        let input = document.createElement('input');
        input.type = 'number';
        input.maxLength = 1;
        
        input.addEventListener('input', (e) => {
            if (e.target.value.length > 1) e.target.value = e.target.value.slice(0,1);
            if (!/[1-9]/.test(e.target.value)) e.target.value = '';
            else e.target.classList.add('user-input');
        });

        input.addEventListener('keydown', (e) => {
            const inputs = document.querySelectorAll('input');
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

function getBoardData() {
    let inputs = document.querySelectorAll('input');
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
    let inputs = document.querySelectorAll('input');
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

function clearBoard() {
    let inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.value = '';
        input.classList.remove('user-input', 'solved-input');
    });
    statusMsg.innerText = '';
}



createBoard();