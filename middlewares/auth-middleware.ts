import express from "express";
import {DatabaseUtils} from "../database/database";
import {SessionController, UserController} from "../controllers";

export async function isUserConnected(req: express.Request): Promise<boolean> {
    const token = req.headers['authorization']?.slice(7);
    if (token !== "") {
        const connection = await DatabaseUtils.getConnection();
        const sessionController = new SessionController(connection);
        const userController = new UserController(connection);
        if (typeof token === "string") {
            const session = await sessionController.getSessionByToken(token);
            if (session !== null) {
                if (session.userId != null) {
                    const user = await userController.getUserById(session.userId.toString());
                    if (user !== null) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}
