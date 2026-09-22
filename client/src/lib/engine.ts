export class Engine {
  private stockfish: Worker | null = null;
  private onMessageCallback: ((data: string) => void) | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.stockfish = new Worker("/stockfish-18-lite-single.js");
      this.stockfish.onmessage = (e) => {
        if (this.onMessageCallback) {
          this.onMessageCallback(e.data);
        }
      };
      // Initialize
      this.stockfish.postMessage("uci");
      this.stockfish.postMessage("isready");
    }
  }

  public onMessage(callback: (data: string) => void) {
    this.onMessageCallback = callback;
  }

  public evaluatePosition(fen: string, depth: number = 10) {
    if (!this.stockfish) return;
    this.stockfish.postMessage(`position fen ${fen}`);
    this.stockfish.postMessage(`go depth ${depth}`);
  }

  public setSkillLevel(level: number) {
    if (!this.stockfish) return;
    this.stockfish.postMessage(`setoption name Skill Level value ${level}`);
  }

  public evaluateFen(fen: string, depth: number = 10): Promise<{score: number, isMate: boolean, pv?: string, score2?: number, isMate2?: boolean}> {
    return new Promise((resolve) => {
      if (!this.stockfish) return resolve({score: 0, isMate: false});
      
      this.stockfish.postMessage("setoption name MultiPV value 2");

      let lastScore = 0;
      let lastIsMate = false;
      let lastPv = "";

      let lastScore2 = 0;
      let lastIsMate2 = false;
      
      const listener = (e: MessageEvent) => {
        const line = e.data;
        
        // Track the latest evaluations we see
        const cpMatch = line.match(/score cp (-?\d+)/);
        const mateMatch = line.match(/score mate (-?\d+)/);
        const pvMatch = line.match(/ pv (([a-h][1-8][a-h][1-8][qrbn]?)+)/);
        const isMultiPv2 = line.includes("multipv 2");
        
        if (isMultiPv2) {
          if (mateMatch) {
            lastIsMate2 = true;
            lastScore2 = parseInt(mateMatch[1]);
          } else if (cpMatch) {
            lastIsMate2 = false;
            lastScore2 = parseInt(cpMatch[1]);
          }
        } else {
          if (mateMatch) {
            lastIsMate = true;
            lastScore = parseInt(mateMatch[1]);
          } else if (cpMatch) {
            lastIsMate = false;
            lastScore = parseInt(cpMatch[1]);
          }
          if (pvMatch) lastPv = pvMatch[1];
        }

        // Stop condition: engine finishes search (bestmove)
        if (line.includes("bestmove")) {
          this.stockfish?.removeEventListener("message", listener);
          resolve({ score: lastScore, isMate: lastIsMate, pv: lastPv, score2: lastScore2, isMate2: lastIsMate2 });
        }
      };
      
      this.stockfish.addEventListener("message", listener);
      this.stockfish.postMessage(`position fen ${fen}`);
      this.stockfish.postMessage(`go depth ${depth}`);
    });
  }

  public stop() {
    if (!this.stockfish) return;
    this.stockfish.postMessage("stop");
  }

  public quit() {
    if (!this.stockfish) return;
    this.stockfish.postMessage("quit");
  }
}
