import { BasePlayer, StartInfo} from '../player';

export class RandomBot extends BasePlayer{

    private startInfo?: StartInfo;
    private gameOver: boolean = false;

    private makeRandomMove(): void {
        let x = Math.floor(Math.random()*this.startInfo!.boardNumCols);
        let y = Math.floor(Math.random()*this.startInfo!.boardNumRows);
        this.select(x, y);
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