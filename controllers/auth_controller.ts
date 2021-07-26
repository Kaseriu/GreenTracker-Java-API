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

        if (options.name === undefined || options.name === "") {
            return "Nom manquant";
        }

        if (options.email === undefined || options.email === "") {
            return "Email manquant";
        }

        if (!EmailValidator.validate(options.email)) {
            return "Mauvais format d'email";

        }

        if (options.password === undefined || options.password === ""){
            return "Mot de passe manquant";
        }

        if (options.password.length < 8) {
            return "Mot de passe trop court (8 caractères minimum)";
        }

        const passwordHashed = await hash(options.password, 5);

        if (await this.userController.getUserByEmail(options.email) !== null) {
            return "Un user est déjà associé à cette email";
        }

        if (await this.userController.getUserByName(options.name) !== null) {
            return "Nom déjà prit !";
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
            return "Vos identifiants sont incorrects";
        }
        if (typeof user.password === "string" && !await compare(password, user.password)) {
            return "Vos identifiants sont incorrects";
        }

        const token = await hash(Date.now() + email, 5);
        await this.sessionController.createSession(token, user.id ? user.id : 0);
        return await this.sessionController.getSessionByToken(token);
    }
}
