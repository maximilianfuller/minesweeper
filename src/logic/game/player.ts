import { Cell } from './cell';
import WebSocket from 'ws';

export class StartInfo {
    public readonly boardNumCols: number;
    public readonly boardNumRows: number;
    public readonly startX: number;
    public readonly startY: number;
    public readonly numBombs: number;
    public readonly playerNames: string[];
    public readonly playerRatings: number[];

    public constructor(
        boardNumCols: number,
        boardNumRows: number,
        startX: number,
        startY: number,
        numBombs: number,
        playerNames: string[],
        playerRatings: number[],
    ) {
        this.boardNumCols = boardNumCols;
        this.boardNumRows = boardNumRows;
        this.startX = startX;
        this.startY = startY;
        this.numBombs = numBombs
        this.playerNames = playerNames
        this.playerRatings = playerRatings
    }
}

export abstract class Player {
    abstract setSelectCallback(callback: (x: number, y: number) => void): void;
    abstract setMarkFlagCallback(callback: (x: number, y: number) => void): void;
    abstract notifyStart(startInfo: StartInfo):void;
    abstract notifyWin(): void;
    abstract notifyLoss(): void;
    abstract notifyGameUpdate(newCells: Array<Cell>): void;
    abstract notifyEnemyGameUpdate(newCells: Array<Cell>): void;
    abstract getName(): string;
    abstract getRating(): number;
    abstract getId(): string;
    abstract setWebSocket(ws: WebSocket): void; // only relevant for humans coming from matchmaking

}

export class BasePlayer extends Player{
    selectCallback: (x: number, y: number) => void = (x, y) => {};
    markFlagCallback: (x: number, y: number) => void = (x, y) => {};

    setSelectCallback(callback: (x: number, y: number) => void): void {
        this.selectCallback = callback;
    }

    setMarkFlagCallback(callback: (x: number, y: number) => void): void {
        this.markFlagCallback = callback;
    }

    notifyStart(startInfo: StartInfo):void {};

    notifyWin(): void {};

    notifyLoss(): void {};

    notifyGameUpdate(newCells: Cell[]): void {};

    notifyEnemyGameUpdate(newCells: Array<Cell>) {};
    
    // select a cell
    select(x: number, y: number) {
        this.selectCallback(x, y);
    }

    markFlag(x: number, y: number) {
        this.markFlagCallback(x, y);
    }

    getName(): string {
        return "STEPHE";
    }

    getRating(): number {
        return 0.0;
    }

    getId(): string {
        return this.getName();
    }

    setWebSocket(ws: WebSocket): void {}
}