import { Board } from './board';
import { Player, StartInfo } from './player';
import { Cell, CellType } from './cell';



export class Referee {
    private board: Board;

    private players: Array<Player>;

    // Keeps track of what each player has already seen. Stores
    // x, y coords as a single value equal to the 'reading' position
    // of the cell.
    private playerVisited: Array<Set<number>>;

    private isGameOver: Boolean = false;

	public constructor(board: Board, players: Array<Player>) {
        this.board = board;
		this.players = players;
        this.playerVisited = players.map(_ => new Set<number>());
        
        let startInfo = new StartInfo(
            this.board.numCols, 
            this.board.numRows, 
            this.board.startPosition%this.board.numCols,
            Math.floor(this.board.startPosition/this.board.numRows),
            this.board.bombs.size,
        );
        
        for (let i = 0; i < players.length; i++) {
            players[i].setSelectCallback((x, y) => this.handlePlayerSelect(x, y, i));
            players[i].notifyStart(startInfo);
        }
    }

    public gameOver(): Boolean {
        return this.isGameOver;
    }

    handlePlayerSelect(x: number, y: number, playerIndex: number): void {
        let visited = new Set<number>();
        this.dfs(x, y, visited);

        let newPositions = Array.from(visited.values()).filter(i => {
            return !this.playerVisited[playerIndex].has(i);
        })
        let newCells = newPositions.map(i => {
            let x = i%this.board.numCols;
            let y = Math.floor(i/this.board.numRows);
            return this.board.get(x, y);
        });
        visited.forEach(i => this.playerVisited[playerIndex].add(i));
        this.players[playerIndex].notifyGameUpdate(newCells);
        
        // Enemy notifications only really make sense in two player
        // Right now we just pick an arbitrary player to notify
        let enemyIndex = (this.players.length + playerIndex-1)%this.players.length;
        this.players[enemyIndex].notifyEnemyGameUpdate(newCells);

        if (this.board.isBomb(x, y)) {
            this.isGameOver = true;
            this.players[playerIndex].notifyLoss();
            // All other players win. 
            // TODO: only let last one standing win.
            for (let i = 0; i < this.players.length; i++) {
                if(i != playerIndex) {
                    this.players[i].notifyWin();
                }
            }
            return;
        }
        let totalCells = this.board.numCols*this.board.numCols;
        if (this.playerVisited[playerIndex].size >= totalCells-this.board.bombs.size) {
            this.isGameOver = true;
            this.players[playerIndex].notifyWin();
            for (let i = 0; i < this.players.length; i++) {
                if(i != playerIndex) {
                    this.players[i].notifyLoss();
                }
            }
        }
    }

    private dfs(x: number, y: number, visited: Set<Number>) {
        let i = y*this.board.numCols + x;
        if (visited.has(i)) { return; }
        visited.add(i);
        if(this.board.get(x, y).cellType != CellType.ZERO) { return; }
        for (let cell of this.board.getNeighborCells(x, y)) {
            this.dfs(cell.x, cell.y, visited)
        }

        return visited;
    }
}