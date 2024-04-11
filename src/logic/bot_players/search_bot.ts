import { BasePlayer, StartInfo} from '../player';
import { Cell, CellType } from '../cell';
import { Board } from '../board'

import { assert } from 'console';


let DEFAULT_DELAY = 100

/**
 * Bot that searches for bombs and safe squares
 */
export class SearchBot extends BasePlayer{
    startInfo?: StartInfo;
    private isGameOver: boolean = false;
    private hasWon: boolean = false;

    // board state, updated when new information is learned, or when flags are placed.
    private board: CellType[][] = [];

    // whether to move automatically on a timer.
    private autoMove: boolean = true;

    // function to retrieve move delay
    private getMoveDelayMillisFn: ()=>number = ()=>DEFAULT_DELAY;
    


    public constructor(autoMove: boolean = true, getMoveDelayMillisFn: ()=>number = ()=>DEFAULT_DELAY) {
        super();
        this.autoMove = autoMove;
        this.getMoveDelayMillisFn = getMoveDelayMillisFn;
    }

    notifyStart(startInfo: StartInfo): void {
        this.startInfo = startInfo;
        for (let x = 0; x < startInfo.boardNumCols; x++) {
            let col: CellType[] = []
            for (let y = 0; y < startInfo.boardNumRows; y++) {
                col.push(CellType.UNKNOWN);
            }
            this.board.push(col);
        }
        if (this.autoMove) {
            this.select(startInfo.startX, startInfo.startY);
            this.makeRepeatedMoves(this.getMoveDelayMillisFn);
        }
    }
   
    notifyGameUpdate(newCells: Cell[]): void {
        newCells.forEach(c => {
            this.board[c.x][c.y] = c.cellType;
            assert(c.cellType != CellType.BOMB, "SimpleBot can't click on bombs")
        });
    }

    private makeRepeatedMoves(getMoveDelayMillisFn: ()=> number): void {
        if (this.isGameOver) {
            return;
        }
        let x = Math.floor(Math.random()*this.startInfo!.boardNumCols);
        let y = Math.floor(Math.random()*this.startInfo!.boardNumRows);
        if(this.tryMakeMove()) {
            let moveDelayMillis = getMoveDelayMillisFn()
            if (moveDelayMillis == 0) {
                this.makeRepeatedMoves(getMoveDelayMillisFn);
            } else {
                setTimeout(() => { this.makeRepeatedMoves(getMoveDelayMillisFn) } , moveDelayMillis);
            }
        }
        
    }


    // Iterate through candidate squares and try to prove
    // by contradiction that the square must be a bomb or a flag.
    // Return whether a move was found.
    tryMakeMove(): boolean {
        if(this.gameOver()) return false;
        
        let unknownCoords = this.getUnknownCoords();
        
        // First do a quick search, checking only one level
        for (let i = 0; i < unknownCoords.length; i++) {
            let x = unknownCoords[i][0];
            let y = unknownCoords[i][1];
            let supposeBomb = new Cell(x, y, CellType.FLAG)
            let supposeFree = new Cell(x, y, CellType.FREE)

            if (!this.isPossible([supposeBomb])) {
                this.select(x, y);
                return true;
            }
            if(!this.isPossible([supposeFree])) {
                this.markFlag(x, y);
                this.board[x][y] = CellType.FLAG;
                return true;
            }
        }

         // Then do a deeper search, checking all 'adjacent'
         // unknown squares for all bomb/free permutations.
         for (let i = 0; i < unknownCoords.length; i++) {
            let x = unknownCoords[i][0];
            let y = unknownCoords[i][1];
            let supposeBomb = new Cell(x, y, CellType.FLAG)
            let supposeFree = new Cell(x, y, CellType.FREE)
            let adjacentUnknownCoords = this.getAdjacentUnknownCoords(x, y)

            if (!this.isPossible([supposeBomb], adjacentUnknownCoords)) {
                this.select(x, y);
                return true;
            }
            if(!this.isPossible([supposeFree], adjacentUnknownCoords)) {
                this.markFlag(x, y);
                this.board[x][y] = CellType.FLAG;
                return true;
            }
        }
        return false;
    }

    // Get all adjacent coordinates of unknown cells to a given cell,
    // Where adjacent means that the given cell and the unknown cell
    // share a neighboring number cell.
    private getAdjacentUnknownCoords(x: number, y: number): number[][] {
        let numberNeighbors = this.getNeighbors(x, y)
            .filter(c => 
                ![CellType.UNKNOWN, CellType.FLAG, CellType.FREE]
                    .includes(this.board[c[0]][c[1]])
            )
        let unknownNeighborsPosSet = new Set<number>();
        for (let n of numberNeighbors) {
            let unknown = this.getNeighbors(n[0], n[1])
                .filter(c => this.board[c[0]][c[1]] == CellType.UNKNOWN)
            unknown.forEach(u => unknownNeighborsPosSet.add(this.coordsToPos(u[0], u[1])))
        }
        unknownNeighborsPosSet.delete(this.coordsToPos(x, y));
        return Array.from(unknownNeighborsPosSet.values()).map(p => this.posToCoords(p));
    }

    // Check if a given board position is possible. Explore everything in coordsToExplore recursively.
    private isPossible(tentativeCells: Cell[], coordsToExplore: number[][] = []): boolean {
        for(let cell of tentativeCells) {
            let x = cell.x
            let y = cell.y

            let numberNeighbors = this.getNeighbors(x, y)
                    .filter(c => 
                        ![CellType.UNKNOWN, CellType.FLAG, CellType.FREE]
                            .includes(this.coordToCellType(c, tentativeCells))
                    )

            for (let i = 0; i < numberNeighbors.length; i++) {
                let n_x = numberNeighbors[i][0];
                let n_y = numberNeighbors[i][1];

                let num = Number(this.board[n_x][n_y]);
                let numBombNeighbors = this.getNeighbors(n_x, n_y)
                    .map(c => this.coordToCellType(c, tentativeCells) == CellType.FLAG ? Number(1) : Number(0))
                    .reduce((sum, current) => sum + current, 0);
                let remainingBombs = num - numBombNeighbors;
                let unknownNeighbors = this.getNeighbors(n_x, n_y)
                    .filter(c => this.coordToCellType(c, tentativeCells) == CellType.UNKNOWN)

                if (remainingBombs < 0) {
                    return false;
                }
                if (remainingBombs > unknownNeighbors.length) {
                    return false;
                }
            }
        }

        coordsToExplore = [...coordsToExplore]
        let nextCoord = coordsToExplore.pop();
        if(!nextCoord) {
            return true;
        }

        let supposeBomb = new Cell(nextCoord[0], nextCoord[1], CellType.FLAG)
        let supposeFree = new Cell(nextCoord[0], nextCoord[1], CellType.FREE)
        if (!this.isPossible(tentativeCells.concat([supposeBomb]), coordsToExplore) &&
            !this.isPossible(tentativeCells.concat([supposeFree]), coordsToExplore)) {
            return false;
        }


        return true;
    }

    private coordToCellType(c: number[], tentativeCells: Cell[] = []): CellType {
        let matchingCells = tentativeCells.filter(cell => cell.x == c[0] && cell.y == c[1]);
        if (matchingCells.length > 0) return matchingCells[0].cellType;
        return this.board[c[0]][c[1]]
    }

    
    private getUnknownCoords(): number[][] {
        let coords: number[][] = [];
        for (let x = 0; x < this.startInfo!.boardNumCols; x++) {
            for (let y = 0; y < this.startInfo!.boardNumRows; y++) {
                if(this.board[x][y] == CellType.UNKNOWN) {
                    coords.push([x, y]);
                }
            }
        }
        return coords;
    }


    // Return list of [x, y] tuples
    private getNeighbors(x: number, y: number): number[][] {
        return Board.NEIGHBOR_RELATIVE_COORDS
            .map(c => [c[0]+x, c[1]+y])
            .filter(c => this.isInBounds(c[0], c[1]))
    }

    private isInBounds(x: number, y: number): boolean {
        return x >= 0 && y >= 0 && x < this.startInfo!.boardNumCols && y < this.startInfo!.boardNumRows;
    }

    notifyWin(): void {
        this.isGameOver = true;
        this.hasWon = true;
    }
    notifyLoss(): void { 
        console.log("LOSS")
        this.isGameOver = true;
        this.hasWon = false;
    }

    public gameOver(): boolean{
        return this.isGameOver;
    }

    public winner(): boolean {
        return this.hasWon;
    }

    // Convert position in grid (single int, 'reading' direction)
    private posToCoords(i: number): Array<number> {
        let x = i%this.startInfo!.boardNumCols;
        let y = Math.floor(i/this.startInfo!.boardNumCols);
        return [x, y]
    }

    private coordsToPos(x: number, y: number): number {
        return y*this.startInfo!.boardNumCols + x;
    }
}