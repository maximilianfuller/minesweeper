import { BasePlayer, StartInfo} from '../player';
import { Cell } from '../cell';

import WebSocket from 'ws';


export class SimpleSearchBot extends BasePlayer{

    private startInfo?: StartInfo;
    private gameOver: boolean = false;

    private makeRepeatedRandomMoves(): void {
        let x = Math.floor(Math.random()*this.startInfo!.boardNumCols);
        let y = Math.floor(Math.random()*this.startInfo!.boardNumRows);
        this.select(x, y);
        setTimeout(() => { this.makeRepeatedRandomMoves() } , 1000);
    }

    private makeSafeMove(): void {
        
    }

    notifyGameUpdate(newCells: Cell[]): void {
        // newCells.map()
    }



    notifyStart(startInfo: StartInfo): void {
        this.startInfo = startInfo;
        this.select(startInfo.startX, startInfo.startY);
        this.makeRepeatedRandomMoves();
    }

    notifyWin(): void {
       this.gameOver = true;
    }

    notifyLoss(): void {
        this.gameOver = true;
    }

}