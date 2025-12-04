class cell : 
    row : int 
    col : int 
    value : int 
    domain : list
    def __init__(self, row, col,value) : 
        self.row = row
        self.col = col
        self.value = value
        self.domain = [1,2,3,4,5,6,7,8,9]
    def remove_value(self,value) : 
        if value in self.domain and len(self.domain) > 1: 
            self.domain.remove(value)
            print(f"[Arc-Consistency] Cell[{self.row}][{self.col}]: Removed {value} -> New Domain: {self.domain}")
            return True 
        return False 
        