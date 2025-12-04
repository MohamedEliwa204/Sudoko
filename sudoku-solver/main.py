from flask import Flask, render_template, request, jsonify
from board import solve_puzzle, generate_random_board
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/solve', methods=['POST'])
def solve():
    data = request.get_json()
    grid = data.get('grid')
    
    if not grid:
        return jsonify({'status': 'error', 'message': 'No grid provided'})

    solution = solve_puzzle(grid)
    
    if solution:
        return jsonify({'status': 'success', 'solution': solution})
    else:
        return jsonify({'status': 'error', 'message': 'Unsolvable Board or Invalid Input'})

@app.route('/generate', methods=['GET'])
def generate():
    difficulty = request.args.get('difficulty', default=25, type=int)
    board = generate_random_board(difficulty=difficulty)
    return jsonify({'status': 'success', 'board': board})

if __name__ == '__main__':
    app.run(debug=True)