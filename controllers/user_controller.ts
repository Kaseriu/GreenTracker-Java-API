import {Connection} from "mysql2";

interface UserAllOptions {
    limit?: number;
    offset?: number;
}

export class UserController {

    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }
}