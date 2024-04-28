import { SearchBot } from "../game/bot_players/search_bot";
import { Player } from "../game/player";
import { BaseUser } from "./user"

const DEFAULT_SPEED_MILLIS = 2000
const DEFAULT_SPEED_SD_MILLIS = 400;
const MIN_GAME_TO_GAME_SPEED_MULTIPLIER = 0.7;
const MAX_GAME_TO_GAME_SPEED_MULTIPLIER = 1.3;



export class BotUser extends BaseUser {
    
    private speed_millis: number;

    constructor(name: string, speed_millis=DEFAULT_SPEED_MILLIS) {
        super(name);
        this.speed_millis = speed_millis;

    }

    makePlayer(): Player {
        let multipler = MIN_GAME_TO_GAME_SPEED_MULTIPLIER + Math.random() * (MAX_GAME_TO_GAME_SPEED_MULTIPLIER - MIN_GAME_TO_GAME_SPEED_MULTIPLIER);
        const game_speed_millis = this.speed_millis * multipler;
        return new SearchBot(true, () => Math.max(100, gaussianRandom(game_speed_millis, DEFAULT_SPEED_SD_MILLIS)), this.getName(), this.getRating())
    }

   
}

function gaussianRandom(mean=0, stdev=1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
  }