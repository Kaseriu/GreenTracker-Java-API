import {Connection, ResultSetHeader, RowDataPacket} from "mysql2/promise";
import {ITicketProps, Ticket} from "../models";
import {UserController} from "./user_controller";
import {StateController} from "./state_controller";


interface TicketAllOptions {
    limit?: number;
    offset?: number;
}

export class TicketController {

    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;

    }

    async getAllTicket(options?: TicketAllOptions): Promise<Ticket[]> {
        const limit = options?.limit || 20;
        const offset = options?.offset || 0;

        const res = await this.connection.query(`SELECT id, name, description, assignee, id_user, id_state
                                                 FROM ticket LIMIT ${offset}, ${limit}`);
        const data = res[0];
        if (Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function (row: any) {
                return new Ticket({
                    id: Number.parseInt(row["id"]),
                    name: row["name"],
                    description: row["description"],
                    assignee: row["assignee"],
                    id_user: row["id_user"],
                    id_state: row["id_state"]
                });
            });
        }
        return [];
    }

    async getTicketById(id: number | undefined): Promise<Ticket | any> {
        /*if (id === undefined)
            return new LogError({numError:400,text:"There is no treatment id"});*/

        const res = await this.connection.query(`SELECT id, name, description, assignee, id_user, id_state
                                                 FROM ticket
                                                 where id = ${id}`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new Ticket({
                    id: Number.parseInt(row["id"]),
                    name: row["name"],
                    description: row["description"],
                    assignee: row["assignee"],
                    id_user: row["id_user"],
                    id_state: row["id_state"]
                });
            }
        }
        return [];
    }

    async getTicketByUserId(UserId: number): Promise<Ticket | any> {
        /*if (UserId === undefined)
            return new LogError({numError:400,text:"There is no user id"});*/

        const res = await this.connection.query(`SELECT id, name, description, assignee, id_user, id_state
                                                 FROM ticket
                                                 where id_user = ${UserId}`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new Ticket({
                    id: Number.parseInt(row["id"]),
                    name: row["name"],
                    description: row["description"],
                    assignee: row["assignee"],
                    id_user: row["id_user"],
                    id_state: row["id_state"]
                });
            }
        }
        return [];
    }

    async getTicketByStateId(StateId: number): Promise<Ticket | any> {
        /*if (StateId === undefined)
            return new LogError({numError:400,text:"There is no state id"});*/

        const res = await this.connection.query(`SELECT id, name, description, assignee, id_user, id_state
                                                 FROM ticket
                                                 where id_state = ${StateId}`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new Ticket({
                    id: Number.parseInt(row["id"]),
                    name: row["name"],
                    description: row["description"],
                    assignee: row["assignee"],
                    id_user: row["id_user"],
                    id_state: row["id_state"]
                });
            }
        }
        return [];
    }

    async createTicket(options: ITicketProps): Promise<Ticket | string | null> {
        const user = new UserController(this.connection);
        const state = new StateController(this.connection);

        if (options.name === undefined || options.description === undefined || options.assignee === undefined) {
            return null;
        }

        if (options.id_user !== undefined && options.id_state !== undefined) {
            if (!await user.getUserById(options.id_user.toString())) {
                return "No user associate with this id";
            }
            if (!await state.getStateById(options.id_state.toString())) {
                return "No state associate with this id";
            }
        }

        const res = await this.connection.execute("INSERT INTO ticket (name, description, assignee, id_user, id_state) VALUES (?,?,?,?,?)", [
            options.name,
            options.description,
            options.assignee,
            options.id_user,
            options.id_state
        ]);
        const headers = res[0] as ResultSetHeader;
        if (headers.affectedRows === 1) {
            return new Ticket({
                name: options.name,
                description: options.description,
                assignee: options.assignee,
                id_user: options.id_user,
                id_state: options.id_state
            });
        }
        return null;
    }

    async removeTicketById(id: number): Promise<boolean> {
        try {
            const res = await this.connection.query(`DELETE
                                                     FROM ticket
                                                     where id = ${id}`);
            const headers = res[0] as ResultSetHeader;
            return headers.affectedRows === 1;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    async updateTicket(options: ITicketProps): Promise<Ticket | string | null> {
        const user = new UserController(this.connection);
        const state = new StateController(this.connection);
        const setClause: string[] = [];
        const params = [];

        if (options.name !== undefined) {
            setClause.push("name = ?");
            params.push(options.name);
        }
        if (options.description !== undefined) {
            setClause.push("description = ?");
            params.push(options.description);
        }
        if (options.assignee !== undefined) {
            setClause.push("assignee = ?");
            params.push(options.assignee);
        }
        if (options.id_user !== undefined) {
            if (!await user.getUserById(options.id_user.toString())) {
                return "No user associate with this id";
            }
            setClause.push("id_user = ?");
            params.push(options.id_user);
        }
        if (options.id_state !== undefined) {
            if (!await state.getStateById(options.id_state.toString())) {
                return "No state associate with this id";
            }
            setClause.push("id_state = ?");
            params.push(options.id_state);
        }
        params.push(options.id);
        const res = await this.connection.execute(`UPDATE ticket
                                                   SET ${setClause.join(", ")}
                                                   WHERE id = ?`, params);
        const headers = res[0] as ResultSetHeader;
        if (headers.affectedRows === 1) {
            return this.getTicketById(options.id);
        }
        return null;
    }
}

