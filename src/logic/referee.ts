import { Board } from './board';
import { Player, StartInfo } from './player';
import { Cell, CellType } from './cell';
import { Spectator } from './spectator';


/**
 * a Referee adjudicates logic for all players, as well as
 * keep players and spectators informed.
 */
export class Referee {
    private board: Board;

    private players: Array<Player>;

    private spectators: Array<Spectator> = [];

    // Keeps track of what each player has already seen. Stores
    // x, y coords as a single value equal to the 'reading' position
    // of the cell.
    private playerVisited: Array<Set<number>>;

    // Keeps track of the flags each player has marked so this
    // can be conveyed to spectators (does not affect logic)
    private playerFlags: Array<Set<number>>;

    private isGameOver: Boolean = false;
    private onGameOver: () => void = () => {};


	public constructor(board: Board, players: Array<Player>, onGameOver: () => void = () => {}) {
        this.board = board;
		this.players = players;
        this.playerVisited = players.map(_ => new Set<number>());
        this.playerFlags = players.map(_ => new Set<number>());
        this.onGameOver = onGameOver;
        
        for (let i = 0; i < players.length; i++) {
            players[i].setSelectCallback((x, y) => this.handlePlayerSelect(x, y, i));
            players[i].setMarkFlagCallback((x, y) => this.handlePlayerMarkFlag(x, y, i));
            players[i].notifyStart(this.getStartInfo());
        }
    }

    public gameOver(): Boolean {
        return this.isGameOver;
    }

    public addSpectator(spectator: Spectator): void {
        this.spectators.push(spectator);
        spectator.notifyStart(this.getStartInfo())
        spectator.notifyGameUpdate(this.getGameState(), [])
    }

    handlePlayerSelect(x: number, y: number, playerIndex: number): void {
        if (this.gameOver()) {
            return;
        }
        let visited = new Set<number>();
        this.dfs(x, y, visited);

        let newPositions = Array.from(visited.values()).filter(i => {
            return !this.playerVisited[playerIndex].has(i);
        })
        let newCells = newPositions.map(i => {
            let c = this.posToCoords(i)
            return this.board.get(c[0], c[1]);
        });
        visited.forEach(i => this.playerVisited[playerIndex].add(i));
        visited.forEach(i => this.playerFlags[playerIndex].delete(i));
        this.players[playerIndex].notifyGameUpdate(newCells);
        for(let s of this.spectators) {
            s.notifyGameUpdate(this.getGameState(), [])
        }
        
        // Enemy notifications only really make sense in two player
        // Right now we just pick an arbitrary player to notify
        let enemyIndex = (this.players.length + playerIndex-1)%this.players.length;
        this.players[enemyIndex].notifyEnemyGameUpdate(newCells);

        if (this.board.isBomb(x, y)) {
            this.isGameOver = true;
            this.onGameOver()
            this.players[playerIndex].notifyLoss();
            // All other players win. 
            // TODO: only let last one standing win.
            for (let i = 0; i < this.players.length; i++) {
                if(i != playerIndex) {
                    this.players[i].notifyWin();
                    for(let s of this.spectators) {
                        s.notifyWinner(i)
                    }
                }
            }
            return;
        }
        // Check if a player has revealed all non-bomb squares.
        let totalCells = this.board.numCols*this.board.numRows;
        if (this.playerVisited[playerIndex].size >= totalCells-this.board.bombs.size) {
            this.isGameOver = true;
            this.onGameOver()
            this.players[playerIndex].notifyWin();
            for(let s of this.spectators) {
                s.notifyWinner(playerIndex)
            }
            for (let i = 0; i < this.players.length; i++) {
                if(i != playerIndex) {
                    this.players[i].notifyLoss();
                }
            }
        }
    }

    private dfs(x: number, y: number, visited: Set<Number>) {
        let i = this.coordsToPos(x, y);
        if (visited.has(i)) { return; }
        visited.add(i);
        if(this.board.get(x, y).cellType != CellType.ZERO) { return; }
        for (let cell of this.board.getNeighborCells(x, y)) {
            this.dfs(cell.x, cell.y, visited)
        }

        return visited;
    }

    handlePlayerMarkFlag(x: number, y: number, playerIndex: number): void {
        this.playerFlags[playerIndex].add(this.coordsToPos(x, y));
        for(let s of this.spectators) {
            s.notifyGameUpdate(this.getGameState(), [])
        }
    }

    private getStartInfo(): StartInfo {
        return new StartInfo(
            this.board.numCols, 
            this.board.numRows, 
            this.board.startPosition%this.board.numCols,
            Math.floor(this.board.startPosition/this.board.numCols),
            this.board.bombs.size,
        );
    }

    private getGameState(): Array<Array<Cell>> {
        let gameState = [];
        for (let p = 0; p < this.players.length; p++) {
            let visitedSet = this.playerVisited[p];
            let cells = Array.from(visitedSet).map(i => {
                let c = this.posToCoords(i)
                return this.board.get(c[0], c[1])
            });
            let flagCells = Array.from(this.playerFlags[p]).map(i => {
                let c = this.posToCoords(i)
                return new Cell(c[0], c[1], CellType.FLAG);
            });
            cells.push(...flagCells)
            gameState.push(cells);
        }
        return gameState
    }

    // Convert position in grid (single int, 'reading' direction)
    private posToCoords(i: number): Array<number> {
        let x = i%this.board.numCols;
        let y = Math.floor(i/this.board.numCols);
        return [x, y]
    }

    private coordsToPos(x: number, y: number): number {
        return y*this.board.numCols + x;
    }
}