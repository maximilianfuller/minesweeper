import { BasePlayer, StartInfo} from '../player';
import { Cell, CellType } from '../cell';
import { Board } from '../board'

import WebSocket from 'ws';
import { TypeFlags } from 'typescript';
import { assert } from 'console';

/**
 * Bot that searches at most one level for bombs and safe squares
 */
export class SimpleSearchBot extends BasePlayer{

    private startInfo?: StartInfo;
    private isGameOver: boolean = false;

    // board state, updated when new information is learned, or when flags are placed.
    private board: Map<number, CellType> = new Map<number, CellType>();

    notifyStart(startInfo: StartInfo): void {
        this.startInfo = startInfo;
        this.select(startInfo.startX, startInfo.startY);
        this.makeRepeatedMoves();
    }
   
    notifyGameUpdate(newCells: Cell[]): void {
        newCells.forEach(c => {
            this.board.set(this.coordsToPos(c.x, c.y), c.cellType);
            assert(c.cellType!=CellType.BOMB, "SimpleBot can't click on bombs")
        });
    }

    // Iterate through 'fringe' squares or numbers squares that border on 
    // unknown squares, and find 'freebies' or squares that can be clicked on 
    // safely, or marked as bombs.
    private makeMove(): void {
        let numSquares = this.startInfo!.boardNumCols* this.startInfo!.boardNumRows;
        let fringePositions = [...Array(numSquares).keys()].filter(p => {
            return this.board.has(p) &&
                this.board.get(p) != CellType.FLAG &&
                this.getNeighbors(p).map(n => this.board.has(n)).includes(false);
        });
        for (let i = 0; i < fringePositions.length; i++) {
            let p = fringePositions[i];
            if (!this.getNeighbors(p).map(n => this.board.has(n)).includes(false)) {
                console.log(this.board)
                console.log("WTF2")
            }

            let num = Number(this.board.get(p));
            let numBombNeighbors = this.getNeighbors(p)
                .map(n => this.board.get(n) == CellType.FLAG ? Number(1) : Number(0))
                .reduce((sum, current) => sum + current, 0);
            let remainingBombs = num - numBombNeighbors;
            let unknownNeighbors = this.getNeighbors(p).filter(n => !this.board.has(n))
            assert(unknownNeighbors.length > 0, "Missing unknown neighbors.");

            let c = this.posToCoords(unknownNeighbors[0]);
            if (remainingBombs == 0) {
                this.select(c[0], c[1]);
                return;
            }

            if (remainingBombs == unknownNeighbors.length) {
                this.markFlag(c[0], c[1]);
                this.board.set(unknownNeighbors[0], CellType.FLAG);
                return;
            }
        }
        // this.guess();
    }

    // pick topleft most unknown square.
    private guess() {
        let numSquares = this.startInfo!.boardNumCols* this.startInfo!.boardNumRows;
        let unknownPositions = [...Array(numSquares).keys()].filter(p =>!this.board.has(p));
        let c = this.posToCoords(unknownPositions[0])
        this.select(c[0], c[1]);
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

    private getNeighbors(pos: number): number[] {
        let coord = this.posToCoords(pos)
        let x = coord[0];
        let y = coord[1];
        return Board.NEIGHBOR_RELATIVE_COORDS
            .map(c => [c[0]+x, c[1]+y])
            .filter(c => this.isInBounds(c[0], c[1]))
            .map(c => this.coordsToPos(c[0], c[1]));
    }

     // Convert position in grid (single int, 'reading' direction) to [col, row]
     private posToCoords(i: number): Array<number> {
        let x = i%this.startInfo!.boardNumCols;
        let y = Math.floor(i/this.startInfo!.boardNumRows);
        return [x, y]
    }

    // Convert [col, row] to position in grid
    private coordsToPos(x: number, y: number): number {
        return y*this.startInfo!.boardNumCols + x;
    }

    private isInBounds(x: number, y: number): boolean {
        return x >= 0 && y >= 0 && x < this.startInfo!.boardNumCols && y < this.startInfo!.boardNumRows;
    }

    notifyWin(): void { this.isGameOver = true;}
    notifyLoss(): void { this.isGameOver = true;}

}