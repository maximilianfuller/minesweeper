import { FlagBot } from "../game/bot_players/flag_bot";
import { HumanPlayer } from "../game/human_player";
import { Player } from "../game/player";

export abstract class User {
    abstract getName(): string;
    abstract makePlayer(): Player;
    abstract getRating(): number;
    abstract handleResult(opponent: User, isWin: boolean): void;
    abstract autoQueue(): boolean;
}

const DEFAULT_STARTING_RATING = 1500;
const NINETY_PERCENT_RATING_DIFF = 400;
const K_VAL = 30;

export class BaseUser extends User {

    private name: string;
    private rating: number = DEFAULT_STARTING_RATING;

    constructor(name: string) {
        super();
        this.name = name;
    }

    getName(): string {
        return this.name;
    }

    getRating(): number {
        return this.rating;
    }

    handleResult(opponent: User, isWin: boolean): void {
        let diff = this.getRating() - opponent.getRating();
        let winOdds = 1.0 - 1.0/(1.0+10**(diff/NINETY_PERCENT_RATING_DIFF));
        if(isWin) {
            this.rating += K_VAL*(1-winOdds);
        } else {
            this.rating -= K_VAL*(winOdds);
        }
        console.log("rating updated: " + this.rating)
    }

    makePlayer(): Player {
        return new FlagBot();
    }

    autoQueue(): boolean {
        return true;
    }
}
