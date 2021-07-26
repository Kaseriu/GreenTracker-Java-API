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

    async getTicketByName(name: string | undefined): Promise<Ticket | any> {
        /*if (id === undefined)
            return new LogError({numError:400,text:"There is no treatment id"});*/

        const res = await this.connection.query(`SELECT id, ticket.name, description, assignee, id_user, id_state
                                                 FROM ticket
                                                 where ticket.name = "${name}"`);
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
        return null;
    }

    async getTicketByUserId(UserId: number): Promise<Ticket | any> {
        const res = await this.connection.query(`SELECT id, name, description, assignee, id_user, id_state
                                                 FROM ticket
                                                 where assignee = ${UserId}`);
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

    async getTicketByStateId(StateId: number): Promise<Ticket | any> {
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

        if (options.name === undefined || options.description === undefined || options.assignee === undefined
            && options.name === "" || options.description === "" || options.assignee === null) {
            return "Tous les champs doivent être remplis !";
        }

        if (options.assignee !== undefined && await user.getUserById(options.assignee) === null) {
            return "L'user " + options.assignee + " assigné à la tache n'existe pas !";
        }

        if (options.id_user !== undefined && options.id_state !== undefined
            && options.id_user !== null && options.id_state !== null) {
            if (!await user.getUserById(options.id_user) === null) {
                return "No user associate with this id";
            }
            if (!await state.getStateById(options.id_state) === null) {
                return "No state associate with this id";
            }
        }

        if (await this.getTicketByName(options.name) !== null) {
            return "Un ticket portant ce nom existe déjà !";
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

    async removeTicket(name: string): Promise<boolean> {
        try {
            const res = await this.connection.query(`DELETE
                                                     FROM ticket
                                                     where ticket.name = "${name}"`);
            const headers = res[0] as ResultSetHeader;
            return headers.affectedRows === 1;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    async updateTicket(ticketName: string, options: ITicketProps): Promise<Ticket | string | null> {
        const user = new UserController(this.connection);
        const state = new StateController(this.connection);
        const setClause: string[] = [];
        const params = [];

        if (options.name !== undefined && options.name !== "") {
            setClause.push("name = ?");
            params.push(options.name);
        }
        if (options.description !== undefined && options.description !== "") {
            setClause.push("description = ?");
            params.push(options.description);
        }
        if (options.assignee !== undefined && options.assignee !== null) {
            if (await user.getUserById(options.assignee) === null) {
                return "L'user " + options.assignee + " assignée au ticket n'existe pas !";
            }
            setClause.push("assignee = ?");
            params.push(options.assignee);
        }
        if (options.id_user !== undefined && options.id_user !== null) {
            if (await user.getUserById(options.id_user) === null) {
                return "L'user " + options.id_user + " n'existe pas !";
            }
            setClause.push("id_user = ?");
            params.push(options.id_user);
        }
        if (options.id_state !== undefined && options.id_state !== null) {
            if (await state.getStateById(options.id_state) === null) {
                return "La state " + options.id_state.toString() + " n'existe pas";
            }
            setClause.push("id_state = ?");
            params.push(options.id_state);
        }

        params.push(ticketName);
        const res = await this.connection.execute(`UPDATE ticket
                                                   SET ${setClause.join(", ")}
                                                   WHERE name = ?`, params);
        const headers = res[0] as ResultSetHeader;
        if (headers.affectedRows === 1) {
            if (options.name !== undefined) {
                return this.getTicketByName(options.name);
            } else {
                return this.getTicketByName(ticketName);
            }
        }
        return null;
    }
}

