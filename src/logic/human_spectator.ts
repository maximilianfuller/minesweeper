import { StartInfo} from './player';
import { Spectator } from './spectator';
import { Cell } from './cell';

import WebSocket from 'ws';


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
    
    notifyGameUpdate(playersAllCells: Array<Array<Cell>>): void {
        this.updateClient(playersAllCells);
    }

    private updateClient(playerAllCells: Array<Array<Cell>>) {
        let start = this.startInfo!.boardNumCols*this.startInfo!.startY + this.startInfo!.startX;
        let data = playerAllCells.map(allCells => {
        return {
            "spectator": true,
            "start": start, 
            "numRows": this.startInfo!.boardNumRows,
            "numCols": this.startInfo!.boardNumCols,
            "newCells": allCells,
        }});
        this.ws.send(JSON.stringify(data));
    }

}