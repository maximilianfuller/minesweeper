import { BasePlayer, StartInfo} from '../player';
import { Cell } from '../cell';

import WebSocket from 'ws';


export class DumbPlayer extends BasePlayer{

    private startInfo?: StartInfo;
    private gameOver: boolean = false;

    private makeRandomMove(): void {
        let x = Math.floor(Math.random()*this.startInfo!.boardNumCols);
        let y = Math.floor(Math.random()*this.startInfo!.boardNumRows);
        this.select(x, y);
        setTimeout(() => { this.makeRandomMove() } , 10000);
    }

    notifyStart(startInfo: StartInfo): void {
        console.log(startInfo);
        this.startInfo = startInfo;
        this.makeRandomMove();
    }

    notifyWin(): void {
        console.log("DUMB BOT Wins!")
        this.gameOver = true;
    }

    notifyLoss(): void {
        console.log("DUMB BOT Loses!")
        this.gameOver = true;
    }

}