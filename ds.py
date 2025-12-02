class SudokoBoard:
    peers = []

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

    def available_options(self, r, c):
        ops = []
        for i in range(1, 10):
            if self.is_value_in_domain(r, c, i):
                ops.append(i)
        return ops

    @classmethod
    def compute_peers(cls):
        cls.peers = [set() for _ in range(81)]
        for idx in range(81):
            row = idx // 9
            col = idx % 9
            # in the same row
            for c in range(9):
                cls.peers[idx].add(row * 9 + c)

            # in the same col
            for r in range(9):
                cls.peers[idx].add(r * 9 + col)

            # same box
            box_r = (row // 3) * 3
            box_c = (col // 3) * 3
            for r in range(3):
                for c in range(3):
                    cls.peers[idx].add((box_r + r) * 9 + (box_c + c))

            cls.peers[idx].discard(idx)

        cls.peers = [list(p) for p in cls.peers]

    def remove_value(self, r, c, value):
        idx = self.get_idx(r, c)
        mask = (1 << (value - 1))

        if self.domains[idx] & mask:
            self.domains[idx] &= ~mask
            return True

        return False

    def copy(self):
        newBoard = SudokoBoard()
        newBoard.grid = self.grid[:]
        newBoard.domains = self.domains[:]
        return newBoard

    def domain_size(self, r, c):
        idx = self.get_idx(r, c)

        return self.domains[idx].bit_count()


SudokoBoard.compute_peers()
