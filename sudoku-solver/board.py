import cell
import copy
class board : 
    cells : list[list[cell.cell]]
    def __init__(self) :
        self.cells = [[cell.cell(j, i, 0) for i in range(9)] for j in range(9)]
    def set_board(self,board) : 
        for i in range(9) : 
            for j in range(9) : 
                self.set_value(self.cells[i][j],board[i][j])
        if not self.validate_board():
            return False 
        self.intialize_domain()
    def set_value(self, cell, value) : 
        if value != 0 :
            cell.value = value
            cell.domain = [value]
        else : 
            cell.value = 0
            cell.domain = [1,2,3,4,5,6,7,8,9]
    def check_row(self, row, value) : 
        for i in range(9):
            if self.cells[row][i].value == value :
                return False 
        return True 
    def check_col(self,col,value) :
        for i in range(9):
            if self.cells[i][col].value == value :
                return False 
        return True 
    def check_box(self,row,col,value) :
        for i in range(3) :
            for j in range(3):
                if self.cells[(row//3)*3 + i][ (col//3)*3 + j].value == value :
                    return False 
        return True 
    def is_valid(self,row,col,value) :
        return self.check_row(row,value) and self.check_col(col,value) and self.check_box(row,col,value)
    def validate_board(self):
        for i in range(9):
            for j in range(9):
                current_value = self.cells[i][j].value
                if current_value == 0 :
                    continue 
                self.cells[i][j].value = 0 
                if not self.is_valid(i, j, current_value):
                    self.cells[i][j].value = current_value 
                    return False 
                self.cells[i][j].value = current_value
        return True
    def intialize_domain(self):
        for i in range(9):
            for j in range(9):
                if self.cells[i][j].value != 0 :
                    self.cells[i][j].domain = [self.cells[i][j].value]
                else : 
                    for cell in self.neighbors(self.cells[i][j]) : 
                        self.cells[i][j].remove_value(cell.value)
                        if len(self.cells[i][j].domain) == 0 :
                            return False
                        if len(self.cells[i][j].domain) == 1 :
                            if not self.assign_value(self.cells[i][j], self.cells[i][j].domain[0]):
                                return False
        return True 
    def neighbors(self,cell) : 
        neighbors = set()
        for i in range(9) : 
            if i != cell.col:
                neighbors.add(self.cells[cell.row][i])
            if i != cell.row:
                neighbors.add(self.cells[i][cell.col])
        start_row = (cell.row // 3) * 3
        start_col = (cell.col // 3) * 3
        for i in range(3) : 
            for j in range(3) : 
                r = start_row + i
                c = start_col + j
                if r != cell.row or c != cell.col:
                    neighbors.add(self.cells[r][c])
        return list(neighbors)
    def assign_value(self,cell,value):
        if not self.is_valid(cell.row, cell.col, value):
            return False
        self.set_value(cell,value)
        for neighbor in self.neighbors(cell) : 
            if neighbor.value == 0:
                if neighbor.remove_value(value):
                    if len(neighbor.domain) == 0 :
                        return False 
                    if len(neighbor.domain) == 1 :
                        if not self.assign_value(neighbor,neighbor.domain[0]):
                            return False
        return True 
    def arc_constraints(self):
        target_cell = None
        for i in range(9):
            for j in range(9):
                if self.cells[i][j].value == 0:
                    target_cell = self.cells[i][j]
                    break
            if target_cell: break
        if not target_cell:
            return True
        candidates = list(target_cell.domain)
        for value in candidates:
            if self.is_valid(target_cell.row, target_cell.col, value):
                backup = copy.deepcopy(self.cells)
                if self.assign_value(target_cell, value):
                    if self.arc_constraints():
                        return True
                self.cells = backup
            target_cell = self.cells[target_cell.row][target_cell.col]
        return False
                                    
def solve_puzzle(input_grid):
    game = board()
    if game.set_board(input_grid) == False:
        return None
    if game.arc_constraints():
        result = []
        for i in range(9):
            row = []
            for j in range(9):
                row.append(game.cells[i][j].value)
            result.append(row)
        return result
    else:
        return None


