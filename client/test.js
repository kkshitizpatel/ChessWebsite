const { Chess } = require('chess.js');
const c = new Chess();
try {
  c.loadPgn('1. e4 e5 2. InvalidMove');
  console.log('Success');
} catch (e) {
  console.log('Error thrown:', e.message);
}
