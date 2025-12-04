from flask import Flask, render_template, request, jsonify
from board import solve_puzzle
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

if __name__ == '__main__':
    app.run(debug=True)