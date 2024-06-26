import { BasePlayer, StartInfo} from '../player';

/**
 * Bot that loves to place flags and nothing else.
 */
export class FlagBot extends BasePlayer{

    private startInfo?: StartInfo;
    private gameOver: boolean = false;

    private makeRandomMove(): void {
        let x = Math.floor(Math.random()*this.startInfo!.boardNumCols);
        let y = Math.floor(Math.random()*this.startInfo!.boardNumRows);
        this.markFlag(x, y);
        if(!this.gameOver) {
            setTimeout(() => { this.makeRandomMove() } , 1000);
        }
    }

    notifyStart(startInfo: StartInfo): void {
        this.startInfo = startInfo;
        this.makeRandomMove();
    }

    notifyWin(): void {
        this.gameOver = true;
    }

    notifyLoss(): void {
        this.gameOver = true;
    }

}