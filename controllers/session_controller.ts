import {Connection, ResultSetHeader, RowDataPacket} from "mysql2/promise";
import {UserController} from "./user_controller";
import {Session} from "../models";

export class SessionController {

    private connection: Connection;
    private userController: UserController;

    constructor(connection: Connection) {
        this.connection = connection;
        this.userController = new UserController(this.connection);
    }

    /**
     * Récupération d'une session depuis le token
     * @param token
     */
    async getSessionByToken(token: string): Promise<Session | null> {
        const res = await this.connection.query(`SELECT id, token, user_id FROM session where token = ? `, [token]);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new Session({
                    sessionId: Number.parseInt(row["id"]),
                    token: row["token"],
                    userId: row["user_id"]
                });
            }
        }
        return null;
    }

    /**
     * Création d'une session
     * @param token
     * @param userId
     */
    async createSession(token: string, userId: number): Promise<Session | null> {
        await this.deleteOldSessionsByUserId(userId);
        await this.connection.execute(`INSERT INTO session (token, user_id) VALUES (?, ?)`, [token, userId]);
        return await this.getSessionByToken(token);
    }

    /**
     * Suppression de l'ancienne session de l'user
     * @param userId
     */
    async deleteOldSessionsByUserId(userId: number): Promise<void> {
        await this.connection.query(`DELETE FROM session WHERE user_id = ?`, [userId]);
    }

    /**
     * Suppression d'une session depuis le token
     * @param token
     */
    async deleteSessionByToken(token: string): Promise<boolean | null> {
        const res = await this.connection.query(`DELETE FROM session WHERE token = ?`, [token]);
        const headers = res[0] as ResultSetHeader;
        return headers.affectedRows === 1;
    }
}
