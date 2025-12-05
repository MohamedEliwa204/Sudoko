const boardElement = document.getElementById('board');
const statusMsg = document.getElementById('status-msg');
const playerControls = document.getElementById('player-controls');
const stepCounter = document.getElementById('step-counter');

let solutionSteps = [];
let currentStepIndex = 0;
let initialGridState = [];

function createBoard() {
    boardElement.innerHTML = '';
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

async function solveSudoku() {
    statusMsg.innerText = 'Solving...';
    statusMsg.className = 'status';
    playerControls.style.display = 'none';
    
    const grid = getBoardData();
    initialGridState = JSON.parse(JSON.stringify(grid));

    try {
        const response = await fetch('/solve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ grid: grid })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            solutionSteps = data.steps;
            currentStepIndex = 0;
            statusMsg.innerText = 'Solved! Use controls to replay.';
            statusMsg.className = 'status success';
            playerControls.style.display = 'block';
            updateCounter();
        } else {
            statusMsg.innerText = data.message;
            statusMsg.className = 'status error';
        }
    } catch (error) {
        statusMsg.innerText = 'Server Error';
        statusMsg.className = 'status error';
    }
}

function updateCounter() {
    stepCounter.innerText = `${currentStepIndex} / ${solutionSteps.length}`;
    document.getElementById('btn-prev').disabled = currentStepIndex === 0;
    document.getElementById('btn-next').disabled = currentStepIndex === solutionSteps.length;
}

function nextStep() {
    if (currentStepIndex < solutionSteps.length) {
        const step = solutionSteps[currentStepIndex];
        const inputs = boardElement.querySelectorAll('input');
        const index = step.row * 9 + step.col;
        const input = inputs[index];

        if (step.value === 0) {
            input.value = '';
            input.classList.remove('solved-input');
        } else {
            input.value = step.value;
            input.classList.add('solved-input');
            input.style.transform = "scale(1.2)";
            setTimeout(() => input.style.transform = "scale(1)", 200);
        }

        currentStepIndex++;
        updateCounter();
    }
}

function prevStep() {
    if (currentStepIndex > 0) {
        currentStepIndex--;
        const step = solutionSteps[currentStepIndex];
        const inputs = boardElement.querySelectorAll('input');
        const index = step.row * 9 + step.col;
        
        input = inputs[index];
        input.value = '';
        input.classList.remove('solved-input');

        let foundPrevValue = false;
        for (let k = currentStepIndex - 1; k >= 0; k--) {
            if (solutionSteps[k].row === step.row && solutionSteps[k].col === step.col) {
                if (solutionSteps[k].value !== 0) {
                    inputs[index].value = solutionSteps[k].value;
                    inputs[index].classList.add('solved-input');
                }
                foundPrevValue = true;
                break;
            }
        }
        
        if (!foundPrevValue) {
            if (initialGridState[step.row][step.col] !== 0) {
                 inputs[index].value = initialGridState[step.row][step.col];
                 inputs[index].classList.add('user-input');
            }
        }
        
        updateCounter();
    }
}

function playAll() {
    let interval = setInterval(() => {
        if (currentStepIndex < solutionSteps.length) {
            nextStep();
        } else {
            clearInterval(interval);
        }
    }, 50);
}

async function fetchRandomBoard() {
    clearBoard();
    statusMsg.innerText = 'Generating...';
    let clues = document.getElementById('clues-count').value;
    if (clues < 0) clues = 0;
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
    playerControls.style.display = 'none';
    currentStepIndex = 0;
    solutionSteps = [];
}
function finalstep() {
    const finalBoard = JSON.parse(JSON.stringify(initialGridState));
    for (let i = 0; i < solutionSteps.length; i++) {
        const step = solutionSteps[i];
        finalBoard[step.row][step.col] = step.value;
    }
    const inputs = boardElement.querySelectorAll('input');
    finalBoard.forEach((row, r) => {
        row.forEach((val, c) => {
            const index = r * 9 + c;
            const input = inputs[index];
            
            if (val !== 0) {
                input.value = val;
                if (initialGridState[r][c] !== 0) {
                    input.classList.add('user-input');
                    input.classList.remove('solved-input');
                } else {
                    input.classList.add('solved-input');
                    input.classList.remove('user-input');
                }
            } else {
                input.value = '';
                input.classList.remove('user-input', 'solved-input');
            }
        });
    }); 
    currentStepIndex = solutionSteps.length;
    updateCounter();
}

createBoard();