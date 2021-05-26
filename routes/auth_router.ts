import express from "express";
import {DatabaseUtils} from "../database/database";
import {AuthController, SessionController} from "../controllers";
import {isUserConnected} from "../middlewares/auth-middleware";

const auth_router = express.Router();

/**
 * Inscription d'un user
 * URL : java-api/auth/subscribe
 * Requete : POST
 */
auth_router.post("/subscribe", async function (req, res) {
    const connection = await DatabaseUtils.getConnection();
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    if (email === undefined || password === undefined || name === undefined) {
        res.status(400).send("All information must be provided").end();
        return;
    }

    const authController = new AuthController(connection);
    const user = await authController.createUser({
        name,
        email,
        password
    });
    if (user === null) {
        res.status(400).end();
        return;
    } else if (typeof user === "string") {
        res.status(400).send(user);
        return;
    }

    const session = await authController.login(email, password);
    if (session !== null) {
        res.status(201);
        res.json({user, session});
    } else {
        res.status(400).end();
    }
});

/**
 * Connexion d'un user
 * URL : java-api/auth/login
 * Requete : POST
 */
auth_router.post("/login", async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;
    if (email === undefined || password === undefined) {
        res.status(400).send("All information must be provided").end();
        return;
    }
    const connection = await DatabaseUtils.getConnection();
    const authController = new AuthController(connection);
    const session = await authController.login(email, password);
    if (session === null) {
        res.status(404).end();
        return;
    } else {
        res.json(session);
    }
});

/**
 * Déconnexion d'un utilisateur
 * URL : java-api/auth/logout?token={{TOKEN}}
 * Requete : DELETE
 */
auth_router.delete("/logout", async function (req, res) {
    if (await isUserConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const sessionController = new SessionController(connection);
        const token = req.query.token ? req.query.token as string : "";
        if (token === "") {
            res.status(400).end();
        }
        const success = await sessionController.deleteSessionByToken(token);
        if (success) {
            res.status(204).end();
            return;
        } else {
            res.status(404).end();
            return;
        }
    }
    res.status(401).send("You must be connected").end();
    return;
});

export {
    auth_router
}
