import {IStateProps, State} from "../models";
import {Connection, ResultSetHeader, RowDataPacket} from "mysql2/promise";

interface UserAllOptions {
    limit?: number;
    offset?: number;
}

export class StateController {

    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    /** Récuperation de toutes les informations du state**/
    async getAllState(options?: UserAllOptions): Promise<State[]> {
        const limit = options?.limit || 20;
        const offset = options?.offset || 0;

        const res = await this.connection.query(`SELECT *
                                                 FROM state LIMIT ${offset}, ${limit}`);
        const data = res[0];

        if (Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function (row: any) {
                return new State({
                    id: Number.parseInt(row["id"]),
                    name: row["name"]
                })
            });

        }

        return [];
    }

    /**
     * Récupération d'un state depuis son id :
     * @param stateId
     */
    async getStateById(stateId: number): Promise<State | null> {
        const res = await this.connection.query(`SELECT id, name
                                                 FROM state
                                                 where id = ${stateId}`);
        const data = res[0];

        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new State({
                    id: Number.parseInt(row["id"]),
                    name: row["name"]
                });

            }
        }
        return null;
    }

    /**
     * Récupération d'un state depuis son name :
     * @param stateName
     */
    async getStateByName(stateName: string): Promise<State | null> {
        const res = await this.connection.query(`SELECT id, name
                                                 FROM state
                                                 where name = '${stateName}'`);

        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new State({
                    id: Number.parseInt(row["id"]),
                    name: row["name"]
                });
            }
        }
        return null;
    }

    async updateState(stateName: string, newName: string): Promise<State | null | string> {
        const state = new StateController(this.connection);

        if (await state.getStateByName(newName)) {
            return "Une autre state porte ce nom !";
        }

        const res = await this.connection.execute(`UPDATE state
                                                   SET name = '${newName}'
                                                   WHERE name = '${stateName}'`);

        const headers = res[0] as ResultSetHeader;
        if (headers.affectedRows === 1) {
            return this.getStateByName(newName);
        }
        return null;
    }

    /**
     * Suppression d'un state depuis son name :
     * @param stateName
     */
    async deleteStateByName(stateName: string): Promise<boolean | string> {

        if (await this.getStateByName(stateName) === null) {
            return "No state associated to this name";
        }

        const res = await this.connection.query(`DELETE
                                                 FROM state
                                                 WHERE name = '${stateName}'`)

        const headers = res[0] as ResultSetHeader;
        return headers.affectedRows === 1;
    }

    /**
     * Création d'un state
     * @param options
     */
    async createState(options: IStateProps): Promise<State | null | string> {
        if (options.name === undefined) {
            return null;
        }
        if (await this.getStateByName(options.name) !== null) {
            return "Ce nom existe déjà !";
        }
        if (options.name === "") {
            return "Vous devez renseigner un nom !";
        }
        const res = await this.connection.execute(`INSERT INTO state (name)
                                                   VALUES (?)`,
            [
                options.name,
            ]);
        const headers = res[0] as ResultSetHeader;
        if (headers.affectedRows === 1) {
            return this.getStateByName(options.name);
        }
        return null;
    }

}



