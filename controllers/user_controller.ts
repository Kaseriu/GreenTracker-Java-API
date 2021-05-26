import {Connection, ResultSetHeader, RowDataPacket} from "mysql2/promise";
import {IUserProps, User} from "../models";
import {compare, hash} from "bcrypt";
import * as EmailValidator from 'email-validator';

interface UserAllOptions {
    limit?: number;
    offset?: number;
}

export class UserController {

    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    /**
     * Récupération de tous les utilisateurs
     * @param options -> Limit et offset de la requete
     */
    async getAllUsers(options?: UserAllOptions): Promise<User[]> {
        //récupération des options
        const limit = options?.limit || 20;
        const offset = options?.offset || 0;

        //récupération des utilisateurs
        const res = await this.connection.query(`SELECT id, name, email
                                                 FROM user LIMIT ${offset}, ${limit}`);

        const data = res[0];
        if (Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function (row: any) {
                return new User({
                    id: Number.parseInt(row["id"]),
                    name: row["name"],
                    email: row["email"]
                });
            });
        }

        return [];
    }

    /**
     * Récupération d'un utilisateur depuis son id :
     * @param userId
     */
    async getUserById(userId: string): Promise<User | null> {
        //récupération de l'utilisateur
        const res = await this.connection.query(`SELECT id, name, email, password
                                                 FROM user
                                                 where id = '${userId}'`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new User({
                    id: Number.parseInt(row["id"]),
                    name: row["name"],
                    email: row["email"],
                    password: row["password"]
                });
            }
        }
        return null;
    }

    /**
     * Récupération d'un utilisateur depuis son email :
     * @param userEmail
     */
    async getUserByEmail(userEmail: string): Promise<User | null> {
        //récupération de l'utilisateur
        const res = await this.connection.query(`SELECT id, name, email, password
                                                 FROM user
                                                 where email = '${userEmail}'`);
        const data = res[0];
        if (Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if (rows.length > 0) {
                const row = rows[0];
                return new User({
                    id: Number.parseInt(row["id"]),
                    name: row["name"],
                    email: row["email"],
                    password: row["password"],
                });
            }
        }
        return null;
    }

    /**
     * Modification des informations d'un user
     * @param userEmail
     * @param options
     */
    async updateUser(userEmail: string, options: IUserProps): Promise<User | null | string> {
        const setClause: string[] = [];
        const params = [];

        if (await this.getUserByEmail(userEmail) === null) {
            return "No user associate to this email";
        }
        if (options.email !== undefined) {
            setClause.push("email = ?");
            params.push(options.email);
            if (!EmailValidator.validate(options.email)) {
                return "Wrong email format";
            }
            if (await this.getUserByEmail(options.email) !== null) {
                return "A user is already using this email";
            }
        }
        if (options.name !== undefined) {
            if (options.name === "") {
                return "Name cannot be empty"
            }
            setClause.push("name = ?");
            params.push(options.name);
        }

        const res = await this.connection.execute(`UPDATE user
                                                   SET ${setClause.join(", ")}
                                                   WHERE email = '${userEmail}'`, params);

        const headers = res[0] as ResultSetHeader;
        if (headers.affectedRows === 1) {
            if (options.email !== undefined) {
                return this.getUserByEmail(options.email);
            }
            return this.getUserByEmail(userEmail);
        }
        return null;
    }

    /**
     * Modification du password d'un user
     * @param userEmail
     * @param userPassword
     * @param newPassword
     */
    async updatePassword(userEmail: string, userPassword: string, newPassword: string): Promise<User | string | null> {

        if (await this.getUserByEmail(userEmail) === null) {
            return "No user associate to this email";
        }

        const user = await this.getUserByEmail(userEmail);
        const passwordHashed = await hash(newPassword, 5);

        if (user !== null) {
            if (typeof user.password === "string" && await compare(userPassword, user.password)) {
                const res = await this.connection.execute(`UPDATE user
                                                           SET password = '${passwordHashed}'
                                                           WHERE email = '${userEmail}'`);
                const headers = res[0] as ResultSetHeader;
                if (headers.affectedRows === 1) {
                    return this.getUserByEmail(userEmail);
                }
            }
            return "Wrong password";
        }
        return null;
    }

    /**
     * Suppression d'un user depuis son email :
     * @param userEmail
     */
    async deleteUserByEmail(userEmail: string): Promise<boolean | string> {
        if (await this.getUserByEmail(userEmail) === null) {
            return "No user associate to this email";
        }
        const res = await this.connection.query(`DELETE
                                                 FROM user
                                                 WHERE email = '${userEmail}'`);

        const headers = res[0] as ResultSetHeader;
        return headers.affectedRows === 1;
    }
}
