import { HumanPlayer } from "../game/human_player";
import { Player } from "../game/player";
import { BaseUser } from "./user"
import WebSocket from 'ws';


export class HumanUser extends BaseUser {
    
    private sessionId: string;

    constructor(sessionId: string, name: string) {
        super(name);
        this.sessionId = sessionId;
    }

    makePlayer(): Player {
        return new HumanPlayer(this.sessionId, undefined, this.getRating());
    }

    autoQueue(): boolean {
        return false;
    }

   
}