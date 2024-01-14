import { Cell } from './cell';

export class StartInfo {
    public readonly boardNumCols: number;
    public readonly boardNumRows: number;
    public readonly startX: number;
    public readonly startY: number;
    public readonly numBombs: number;

    public constructor(
        boardNumCols: number,
        boardNumRows: number,
        startX: number,
        startY: number,
        numBombs: number
    ) {
        this.boardNumCols = boardNumCols;
        this.boardNumRows = boardNumRows;
        this.startX = startX;
        this.startY = startY;
        this.numBombs = numBombs
    }
}

export abstract class Player {
    abstract setSelectCallback(callback: (x: number, y: number) => void): void;
    abstract notifyStart(startInfo: StartInfo):void;
    abstract notifyWin(): void;
    abstract notifyLoss(): void;
    abstract notifyGameUpdate(newCells: Array<Cell>): void;
    abstract notifyEnemyGameUpdate(newCells: Array<Cell>): void;

}

export class BasePlayer extends Player{
    selectCallback: (x: number, y: number) => void = (x, y) => {};

    setSelectCallback(callback: (x: number, y: number) => void): void {
        this.selectCallback = callback
    }

    notifyStart(startInfo: StartInfo):void {}

    notifyWin(): void {}

    notifyLoss(): void {}

    notifyGameUpdate(newCells: Cell[]): void {}

    notifyEnemyGameUpdate(newCells: Array<Cell>) {};
    
    // select a cell
    select(x: number, y: number) {
        this.selectCallback(x, y)
    }
}