import {IUserProps, Session, User} from "../models";
import {Connection, ResultSetHeader} from "mysql2/promise";
import {compare, hash} from "bcrypt";
import {UserController} from "./user_controller";
import {SessionController} from "./session_controller";
import * as EmailValidator from "email-validator";

export class AuthController {

    private connection: Connection;
    private userController: UserController;
    private sessionController: SessionController;

    constructor(connection: Connection) {
        this.connection = connection;
        this.userController = new UserController(this.connection);
        this.sessionController = new SessionController(this.connection);
    }

    /**
     * Création d'un user
     * @param options
     */
    async createUser(options: IUserProps): Promise<User | null | string> {

        if (options.name === undefined || options.email === undefined || options.password === undefined) {
            return null;
        }

        if (!EmailValidator.validate(options.email)) {
            return "Wrong email format"
        }

        const passwordHashed = await hash(options.password, 5);

        if (await this.userController.getUserByEmail(options.email) !== null) {
            return "Their is already an user associated to this email";
        }

        const res = await this.connection.execute(`INSERT INTO user (name, email, password)
                                                   VALUES (?, ?, ?)`,
            [
                options.name,
                options.email,
                passwordHashed
            ]);
        const headers = res[0] as ResultSetHeader;
        if (headers.affectedRows === 1) {
            return this.userController.getUserByEmail(options.email);
        }
        return null;
    }

    /**
     * Login du user
     * @param email
     * @param password
     */
    public async login(email: string, password: string): Promise<Session | string | null> {
        const user = await this.userController.getUserByEmail(email);
        if (user === null) {
            return null;
        }
        if (typeof user.password === "string" && !await compare(password, user.password)) {
            return "Wrong email or password";
        }

        const token = await hash(Date.now() + email, 5);
        await this.sessionController.createSession(token, user.id ? user.id : 0);
        return await this.sessionController.getSessionByToken(token);
    }
}
