// Checks the box count against the 1961 machine, then checks that it learns.
const assert = require("assert");
const E = require("./engine.js");

const boxes = E.allBoxes();
const perMove = [0, 1, 2, 3].map((s) => boxes.filter((b) => b.stage === s).length);
assert.deepStrictEqual(perMove, [1, 12, 108, 183]);
assert.strictEqual(boxes.length, 304);

// Someone who takes a win, blocks a loss, and otherwise moves at random.
const empties = (b) => [...b].map((v, i) => (v === "." ? i : -1)).filter((i) => i >= 0);
const finishes = (b, who) => empties(b).find((c) => E.winner(E.put(b, c, who)));
function opponent(b) {
  const win = finishes(b, "X"), block = finishes(b, "O"), free = empties(b);
  return win !== undefined ? win : block !== undefined ? block : free[Math.floor(Math.random() * free.length)];
}

// Play real games with practice in between, many times over from scratch.
const RUNS = 200, GAMES = 5, PRACTICE = 1000;
const lost = new Array(GAMES).fill(0);
for (let run = 0; run < RUNS; run++) {
  const memory = {}, ghost = {};
  for (const b of boxes) memory[b.key] = E.freshBeads(b);
  for (let game = 0; game < GAMES; game++) {
    let board = ".........", result = null;
    const opened = [];
    while (!result) {
      if (E.filled(board) === 8) {
        board = E.put(board, board.indexOf("."), "O");
        result = E.winner(board) ? "win" : "draw";
        break;
      }
      const pick = E.choose(memory, board);
      if (!pick) { result = "loss"; break; }
      assert.strictEqual(board[pick.cell], ".", "it played on a taken square");
      opened.push(pick);
      board = E.put(board, pick.cell, "O");
      if (E.winner(board)) { result = "win"; break; }
      const cell = opponent(board);
      E.remember(ghost, board, cell);
      board = E.put(board, cell, "X");
      if (E.winner(board)) result = "loss";
    }
    E.learn(memory, opened, result);
    if (result === "loss") lost[game]++;
    for (let i = 0; i < PRACTICE; i++) E.rehearse(memory, ghost);
    // Going first can always at least draw, so the first box must never run out.
    assert.ok(E.total(memory["........."]) > 0, "the first box ran out of beads");
  }
}
const pct = lost.map((n) => Math.round((100 * n) / RUNS));
assert.ok(pct[GAMES - 1] < pct[0] / 2, "by game five it should lose less than half as often: " + pct);
console.log("304 boxes. Games it lost, first to fifth: " + pct.join("%, ") + "%.");
