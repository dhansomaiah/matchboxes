# Matchboxes

A noughts and crosses opponent that knows nothing. It has 304 matchboxes of beads and learns by losing to you.

Each box is one position it can face, and each bead in it is a vote for a square. It shakes the box and plays whichever bead falls out. A win puts three more beads behind every move it made, a draw puts one, and a loss takes away the beads it used.

There is no strategy in the code. [`engine.js`](engine.js) is the whole brain, and it only counts beads.

Donald Michie built the original in 1961 from 304 real matchboxes, because he had no computer to hand.

## Run it

Open `index.html` in a browser. Its memory is kept in that browser, so it only ever learns from you.

```bash
node test.js
```
