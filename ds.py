class SudokoBoard:
    def __init__(self, initial_state: str = None):
        self.grid = [0] * 81
        self.domains = [0b111111111] * 81

        if initial_state:
            self.load_state(initial_state)

    def load_state(self, state: str):
        s = state.strip().replace(".", "0").replace("\n", "").replace(" ", "")

        if len(s) != 81:
            raise ValueError(f"Invalid Board: Expected 81 characters, got {len(s)}")

        for i in range(81):
            if s[i].isdigit():
                val = int(s[i])
            else:
                val = 0

            if val != 0:
                self.grid[i] = val

                self.domains[i] = (1 << (val - 1))

    def get_idx(self, r, c):
        return 9 * r + c

    def is_value_in_domain(self, r, c, value):
        idx = self.get_idx(r, c)
        mask = (1 << (value - 1))
        return (self.domains[idx] & mask) != 0

