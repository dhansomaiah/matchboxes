// The whole "brain". No strategy lives in this file, only boxes of beads.
// The machine plays O and always goes first. You play X.
(function (root) {
  // The 8 ways to turn or flip a noughts-and-crosses board.
  // Each entry says: new cell i takes its value from old cell SYM[k][i].
  const SYM = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8],
    [6, 3, 0, 7, 4, 1, 8, 5, 2],
    [8, 7, 6, 5, 4, 3, 2, 1, 0],
    [2, 5, 8, 1, 4, 7, 0, 3, 6],
    [2, 1, 0, 5, 4, 3, 8, 7, 6],
    [6, 7, 8, 3, 4, 5, 0, 1, 2],
    [0, 3, 6, 1, 4, 7, 2, 5, 8],
    [8, 5, 2, 7, 4, 1, 6, 3, 0],
  ];
  const LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  // Beads per move in a fresh box, by which of its moves the machine is on.
  const START = [4, 3, 2, 1];

  const turn = (b, k) => SYM[k].map((from) => b[from]).join("");

  // Boards that are the same after a turn or flip share one box.
  function canon(b) {
    let best = null, bestK = 0;
    for (let k = 0; k < 8; k++) {
      const t = turn(b, k);
      if (best === null || t < best) { best = t; bestK = k; }
    }
    return { key: best, k: bestK };
  }

  function winner(b) {
    for (const [x, y, z] of LINES) {
      if (b[x] !== "." && b[x] === b[y] && b[y] === b[z]) return { who: b[x], line: [x, y, z] };
    }
    return null;
  }

  // Moves that are really different. On an empty board there are only three:
  // a corner, an edge, the centre.
  function distinctMoves(key) {
    const same = [];
    for (let k = 0; k < 8; k++) if (turn(key, k) === key) same.push(k);
    const seen = new Set(), moves = [];
    for (let c = 0; c < 9; c++) {
      if (key[c] !== "." || seen.has(c)) continue;
      moves.push(c);
      // After a turn that leaves the board unchanged, cell c lands on cell j.
      for (const k of same) seen.add(SYM[k].indexOf(c));
    }
    return moves;
  }

  const put = (b, c, mark) => b.slice(0, c) + mark + b.slice(c + 1);
  const filled = (b) => 9 - b.split(".").length + 1;

  // Every position the machine can ever be asked about. There are 304.
  function allBoxes() {
    const boxes = new Map();
    const visit = (b) => {
      const { key } = canon(b);
      if (boxes.has(key)) return;
      boxes.set(key, { key, stage: filled(key) / 2, moves: distinctMoves(key) });
      for (const m of distinctMoves(key)) {
        const afterO = put(key, m, "O");
        if (winner(afterO)) continue;
        for (let c = 0; c < 9; c++) {
          if (afterO[c] !== ".") continue;
          const afterX = put(afterO, c, "X");
          if (winner(afterX) || filled(afterX) >= 8) continue;
          visit(afterX);
        }
      }
    };
    visit(".........");
    return [...boxes.values()].sort((a, b) => a.stage - b.stage || (a.key < b.key ? -1 : 1));
  }

  function freshBeads(box) {
    const beads = {};
    for (const m of box.moves) beads[m] = START[box.stage];
    return beads;
  }

  // Open the box for this board, shake it, take a bead.
  // Returns null if the box is empty, which means the machine gives up.
  function choose(memory, board, random) {
    const { key, k } = canon(board);
    const beads = memory[key];
    const total = Object.values(beads).reduce((a, n) => a + n, 0);
    if (total === 0) return null;
    let pick = Math.floor((random || Math.random)() * total);
    let move = null;
    for (const m of Object.keys(beads)) {
      pick -= beads[m];
      if (pick < 0) { move = Number(m); break; }
    }
    return { key, move, cell: SYM[k][move], k };
  }

  // After the game: 3 more beads for each move if it won, 1 if it drew,
  // and the bead it used is taken away if it lost.
  const REWARD = { win: 3, draw: 1, loss: -1 };
  function learn(memory, opened, result) {
    for (const { key, move } of opened) {
      memory[key][move] = Math.max(0, memory[key][move] + REWARD[result]);
    }
  }

  const api = { SYM, START, REWARD, canon, turn, winner, distinctMoves, put, filled, allBoxes, freshBeads, choose, learn };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Matchboxes = api;
})(typeof self !== "undefined" ? self : this);
