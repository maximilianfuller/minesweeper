import { BasePlayer, StartInfo} from '../player';
import { Cell, CellType } from '../cell';
import { Board } from '../board'

import { assert } from 'console';

/**
 * Bot that searches for bombs and safe squares
 */
export class SearchBot extends BasePlayer{

    

    private startInfo?: StartInfo;
    private isGameOver: boolean = false;
    private hasWon: boolean = false;

    // board state, updated when new information is learned, or when flags are placed.
    private board: CellType[][] = [];

    // whether to move automatically on a timer.
    private autoMove: boolean = false;


    public constructor(autoMove: boolean = false) {
        super();
        this.autoMove = autoMove;
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
            this.makeRepeatedMoves();
        }
    }
   
    notifyGameUpdate(newCells: Cell[]): void {
        newCells.forEach(c => {
            this.board[c.x][c.y] = c.cellType;
            assert(c.cellType != CellType.BOMB, "SimpleBot can't click on bombs")
        });
    }

    // Iterate through 'fringe' squares or numbers squares that border on 
    // unknown squares, and find 'freebies' or squares that can be clicked on 
    // safely, or marked as bombs.
    makeMove(): void {
        let fringeCoords: number[][] = []
        for (let x = 0; x < this.startInfo!.boardNumCols; x++) {
            for (let y = 0; y < this.startInfo!.boardNumRows; y++) {
                if([CellType.UNKNOWN, CellType.FLAG].includes(this.board[x][y])) {
                    continue;
                }
                if (!this.getNeighbors(x, y).map(c => this.board[c[0]][c[1]]).includes(CellType.UNKNOWN))  {
                    continue;
                }
                fringeCoords.push([x, y])
            }
        }
        for (let i = 0; i < fringeCoords.length; i++) {
            let x = fringeCoords[i][0];
            let y = fringeCoords[i][1];

            let num = Number(this.board[x][y]);
            let numBombNeighbors = this.getNeighbors(x, y)
                .map(c => this.board[c[0]][c[1]] == CellType.FLAG ? Number(1) : Number(0))
                .reduce((sum, current) => sum + current, 0);
            let remainingBombs = num - numBombNeighbors;
            let unknownNeighbors = this.getNeighbors(x, y).filter(c => this.board[c[0]][c[1]] == CellType.UNKNOWN)
            assert(unknownNeighbors.length > 0, "Missing unknown neighbors.");

            let c = unknownNeighbors[0];
            if (remainingBombs == 0) {
                this.select(c[0], c[1]);
                return;
            }
            if (remainingBombs == unknownNeighbors.length) {
                this.markFlag(c[0], c[1]);
                this.board[c[0]][c[1]] = CellType.FLAG;
                return;
            }
        }
    }

    private makeRepeatedMoves(): void {
        if (this.isGameOver) {
            return;
        }
        let x = Math.floor(Math.random()*this.startInfo!.boardNumCols);
        let y = Math.floor(Math.random()*this.startInfo!.boardNumRows);
        this.makeMove();
        setTimeout(() => { this.makeRepeatedMoves() } , 100);
    }

    private getNeighbors(x: number, y: number): number[][] {
        return Board.NEIGHBOR_RELATIVE_COORDS
            .map(c => [c[0]+x, c[1]+y])
            .filter(c => this.isInBounds(c[0], c[1]))
    }

    private isInBounds(x: number, y: number): boolean {
        return x >= 0 && y >= 0 && x < this.startInfo!.boardNumCols && y < this.startInfo!.boardNumRows;
    }

    notifyWin(): void {
        console.log("WIN")
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


}