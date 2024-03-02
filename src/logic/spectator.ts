import { Cell } from './cell';
import { StartInfo } from './player';

export abstract class Spectator {
    abstract notifyStart(startInfo: StartInfo): void;
    abstract notifyWinner(playerIndex: number): void;
    // Unlike players, we send the entire state on every update.
    // TBD if there are performance implications here.
    abstract notifyGameUpdate(playersAllCells: Cell[][], playersFlags: Cell[][]): void;
}

export class BaseSpectator extends Spectator {
    notifyStart(startInfo: StartInfo): void {}
    notifyWinner(playerIndex: number): void {}
    notifyGameUpdate(playersAllCells: Cell[][]) {}
}