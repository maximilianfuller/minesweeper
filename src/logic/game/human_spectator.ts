import { StartInfo} from './player';
import { Spectator } from './spectator';
import { Cell } from './cell';

import WebSocket from 'ws';
import { assert } from 'console';


export class HumanSpectator extends Spectator{
    private ws: WebSocket;
    private startInfo?: StartInfo;

    public constructor(ws: WebSocket) {
        super();
        this.ws = ws;
    }

    notifyStart(startInfo: StartInfo): void {
        this.startInfo = startInfo;
    }

    notifyWinner(playerIndex: number): void {
        // TODO
    }
    
    notifyGameUpdate(playersAllCells: Cell[][]): void {
        this.updateClient(playersAllCells);
    }

    private updateClient(playerAllCells: Cell[][]) {
        let start = this.startInfo!.boardNumCols*this.startInfo!.startY + this.startInfo!.startX;
        let data = []
        for (let i = 0; i < playerAllCells.length; i++) {
            data.push({
                "spectator": true,
                "playerName": this.startInfo!.playerNames[i],
                "playerRating": Math.round(this.startInfo!.playerRatings[i]),
                "start": start, 
                "numRows": this.startInfo!.boardNumRows,
                "numCols": this.startInfo!.boardNumCols,
                "newCells": playerAllCells[i],
            });
        }
        this.ws.send(JSON.stringify(data));
    }

}