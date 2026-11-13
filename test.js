// Checks the box count against the 1961 machine, then lets it play
// 20,000 games against someone who moves at random.
const assert = require("assert");
const E = require("./engine.js");

const boxes = E.allBoxes();
const perMove = [0, 1, 2, 3].map((s) => boxes.filter((b) => b.stage === s).length);
assert.deepStrictEqual(perMove, [1, 12, 108, 183]);
assert.strictEqual(boxes.length, 304);

const memory = {};
for (const b of boxes) memory[b.key] = E.freshBeads(b);
const tally = { win: 0, draw: 0, loss: 0 };
const early = { win: 0, draw: 0, loss: 0 };

for (let game = 0; game < 20000; game++) {
  let board = ".........", result = null;
  const opened = [];
  while (!result) {
    if (E.filled(board) === 8) {
      board = E.put(board, board.indexOf("."), "O");
      result = E.winner(board) ? "win" : "draw";
      break;
    }
    const pick = E.choose(memory, board);
    if (!pick) {
      const key = E.canon(board).key;
      memory[key] = E.freshBeads(boxes.find((b) => b.key === key));
      result = "loss";
      break;
    }
    assert.strictEqual(board[pick.cell], ".", "it played on a taken square");
    opened.push(pick);
    board = E.put(board, pick.cell, "O");
    if (E.winner(board)) { result = "win"; break; }
    const empty = [...board].map((v, i) => (v === "." ? i : -1)).filter((i) => i >= 0);
    board = E.put(board, empty[Math.floor(Math.random() * empty.length)], "X");
    if (E.winner(board)) result = "loss";
  }
  E.learn(memory, opened, result);
  tally[result]++;
  if (game < 500) early[result]++;
}

const late = (tally.win - early.win) / 19500;
assert.ok(late > early.win / 500, "it should win more often once it has practised");
console.log("304 boxes. First 500 games: won " + early.win + ". After that: won " + (late * 100).toFixed(1) + "%.");
