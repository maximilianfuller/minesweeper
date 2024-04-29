import { BasePlayer, StartInfo} from './player';
import { Cell } from './cell';

import WebSocket from 'ws';


export class HumanPlayer extends BasePlayer{

    private sessionId: string;
    private ws?: WebSocket;
    private startInfo?: StartInfo;

    private rating: number;

    // How many cells each player has uncovered.
    private playerProgress: number = 0;
    private enemyProgress: number = 0;

    public constructor(sessionId: string, ws?: WebSocket, rating: number = 0) {
        super();
        this.sessionId = sessionId;
        this.ws = ws;
        this.rating = rating
    }

    private updateClient(
        cells: Array<Cell> = [], 
        enemyCells: Array<Cell> = [], 
        gameOverMessage: string = "",
    ) {
        if(!this.ws) {return;}
        let start = this.startInfo!.boardNumCols*this.startInfo!.startY + this.startInfo!.startX;
        let totalProgress = this.startInfo!.boardNumCols * this.startInfo!.boardNumRows - this.startInfo!.numBombs
        let data = [{
            "spectator": false,
            "playerName": this.getName(),
            "playerRating": Math.round(this.getRating()),
            "start": start, 
            "numRows": this.startInfo!.boardNumRows,
            "numCols": this.startInfo!.boardNumCols,
            "newCells": cells,
            "enemyNewCells": enemyCells,
            "progress": this.playerProgress,
            "enemyProgress": this.enemyProgress,
            "totalProgress": totalProgress,
            "gameOverMessage": gameOverMessage,
        }]
        this.ws!.send(JSON.stringify(data));
    }

    notifyStart(startInfo: StartInfo): void {
        this.startInfo = startInfo;
        this.updateClient();
    }

    notifyWin(): void {
        this.updateClient([], [], "You Win!");
        this.ws?.close();
    }

    notifyLoss(): void {
        this.updateClient([], [], "You Lose!");
        this.ws?.close();
    }

    notifyGameUpdate(newCells: Cell[]): void {
        this.playerProgress += newCells.length;
        this.updateClient(newCells);
    }

    notifyEnemyGameUpdate(newCells: Array<Cell>) {
        this.enemyProgress += newCells.length;
        this.updateClient([], newCells);
    };

    getId(): string {
        return this.sessionId;
    }

    setWebSocket(ws: WebSocket): void {
        this.ws = ws;
        this.updateClient();
    }

    getRating(): number {
        return this.rating
    }

}