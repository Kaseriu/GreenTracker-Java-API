import {Connection} from "mysql2";

interface UserAllOptions {
    limit?: number;
    offset?: number;
}

export class StateController {

    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }
}
