import { Cell, CellType } from './cell';

export class Board {
    public readonly numCols: number;
	public readonly numRows: number;

    // "reading" order position of the bombs in the grid
    public readonly bombs: Set<number> = new Set();

    public readonly startPosition: number;

    public static NEIGHBOR_RELATIVE_COORDS = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ];

    // Creates a random configuration board if bombs is not specified
	public constructor(numCols: number, numRows: number, numBombs: number, bombs? : Set<number>) {
        this.numCols = numCols;
		this.numRows = numRows;

        if (numBombs > numCols * numRows) {
            throw new Error(`${numBombs} requested but grid is size ${numCols} by ${numRows}`);
        }

        // set or create bombs
        if (bombs) {
            if(numBombs != bombs?.size) {
                throw new Error('numBombs does not match bombs.');
            }
            this.bombs = new Set(bombs);
        } else {
            for (let i = 0; i < numBombs; i++) {
                let bomb = -1;
                do {
                    bomb = Math.floor(Math.random() * numCols * numRows);
                } while (this.bombs.has(bomb));
                this.bombs.add(bomb);
            }
        }

        // find a random empty start square with no adjacent bombs
        let startPositions = []
        for (let y = 0; y < numRows; y++) {
            for (let x = 0; x < numCols; x++) {
                if(
                    !this.isBomb(x, y) && 
                    !this.getNeighborCoords(x, y).some((c) => this.isBomb(c[0], c[1]))
                ) {
                    startPositions.push(y*this.numCols+x);
                }
            }
        }
        // if none were found (common in toy boards for testing), find a non bomb square
        if (startPositions.length == 0) {
            for (let y = 0; y < numRows; y++) {
                for (let x = 0; x < numCols; x++) {
                    if (!this.isBomb(x, y)) {
                        startPositions.push(y*this.numCols+x);
                    }
                }
            }
        }

        this.startPosition = startPositions[Math.floor(Math.random()*startPositions.length)];
    }

    private isInBounds(x: number, y: number): boolean {
        return x >= 0 && y >= 0 && x < this.numCols && y < this.numRows;
    }

    private validateInBounds(x: number, y: number): void {
        if (!this.isInBounds(x, y)) {
            throw new Error(`(${x}, ${y}) out of bounds for grid of size (${this.numCols}, ${this.numRows}).`);
        }
    }

    public isBomb(x: number, y: number): boolean {
        return this.isInBounds(x, y) && this.bombs.has(y*this.numCols + x)
    }

    public get(x: number, y: number): Cell {
        this.validateInBounds(x, y);
        if (this.isBomb(x, y))  {
            return new Cell(x, y, CellType.BOMB);
        }
        let count = 0;
        Board.NEIGHBOR_RELATIVE_COORDS.forEach(
            c =>  { if (this.isBomb(x + c[0], y + c[1])) count++; }
        )
        return new Cell(x, y, count)
    }

    private getNeighborCoords(x:number, y:number): Array<Array<number>> {
        return Board.NEIGHBOR_RELATIVE_COORDS.map(c => [c[0]+x, c[1]+y]).filter(c => this.isInBounds(c[0], c[1]));
    }

    public getNeighborCells(x: number, y: number): Array<Cell> {
        this.validateInBounds(x, y);
        return this.getNeighborCoords(x, y).map(c => this.get(c[0], c[1]));
    }
}