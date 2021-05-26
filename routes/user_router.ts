import express from "express";
import {UserController} from "../controllers";
import {DatabaseUtils} from "../database/database";
import {isUserConnected} from "../middlewares/auth-middleware";

const userRouter = express.Router();

/**
 * Récupération de tous les utilisateurs
 * URL : java-api/user?[limit={x}&offset={x}]
 * Requête : GET
 */
userRouter.get("/", async function (req, res) {
    if (await isUserConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const userController = new UserController(connection);
        const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined;
        const offset = req.query.offset ? Number.parseInt(req.query.offset as string) : undefined;
        const userList = await userController.getAllUsers({
            limit,
            offset
        });
        if (userList.length !== 0) {
            res.json(userList);
            return;
        } else {
            res.status(404).send("There is no user").end();
            return;
        }
    }
    res.status(401).send("You must be connected").end();
    return;
});

/**
 * Récupération d'un utilisateur selon son id
 * URL : java-api/user/id
 * Requête : GET
 */
userRouter.get("/id", async function (req, res) {
    if (await isUserConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const userController = new UserController(connection);
        const userId = req.body.userId;
        if (userId === undefined || userId === "") {
            res.status(400).send('User Id is missing');
            return;
        }
        const user = await userController.getUserById(userId);
        if (user === null) {
            res.status(404).send("This user doesn't exist");
            return;
        } else {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email
            });
            return;
        }
    }
    res.status(401).send("You must be connected").end();
    return;
});

/**
 * Récupération d'un utilisateur selon son email
 * URL : java-api/user/email
 * Requête : GET
 */
userRouter.get("/email", async function (req, res) {
    if (await isUserConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const userController = new UserController(connection);
        const userEmail = req.body.userEmail;
        if (userEmail === undefined || userEmail === "") {
            res.status(400).send('User email is missing');
            return;
        }
        const user = await userController.getUserByEmail(userEmail);
        if (user === null) {
            res.status(404).send("This user doesn't exist");
            return;
        } else {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email
            });
            return;
        }
    }
    res.status(401).send("You must be connected").end();
    return;
});

/**
 * Modification d'un utilisateur selon son email
 * URL : java-api/user/
 * Requête : PUT
 */
userRouter.put("/", async function (req, res) {
    if (await isUserConnected(req)) {
        const userEmail = req.body.userEmail
        const name = req.body.name;
        const email = req.body.email;

        if (userEmail === undefined || userEmail === "") {
            res.status(400).send("User email is missing");
            return;
        }
        if (name === undefined && email == undefined) {
            res.status(400).send("You should fill in at least one of the following : email/name");
            return;
        }
        const connection = await DatabaseUtils.getConnection();
        const userController = new UserController(connection);
        const user = await userController.updateUser(userEmail, {
            name,
            email
        });
        if (user === null) {
            res.status(400).end();
        } else {
            if (typeof user === "string") {
                res.status(404).send(user);
                return;
            }
            res.json({
                id: user.id,
                name: user.name,
                email: user.email
            });
            return;
        }
        res.status(403).end();
        return;
    }
    res.status(401).send("You must be connected").end();
    return;
});

/**
 * Modification du mdp d'un user
 * URL : java-api/user/updatePassword
 * Requête : PUT
 */
userRouter.put("/updatePassword", async function (req, res) {
    if (await isUserConnected(req)) {
        const userEmail = req.body.userEmail
        const userPassword = req.body.userPassword;
        const newPassword = req.body.newPassword;

        if (userEmail === undefined) {
            res.status(400).send("Email missing");
            return;
        }
        if (userPassword === undefined) {
            res.status(400).send("User password missing")
            return;
        }
        if (newPassword == undefined) {
            res.status(400).send("New password missing");
            return;
        }
        const connection = await DatabaseUtils.getConnection();
        const userController = new UserController(connection);
        const user = await userController.updatePassword(userEmail, userPassword, newPassword);
        if (user === null) {
            res.status(400).end();
            return;
        } else {
            if (typeof user === "string") {
                res.status(404).send(user);
                return;
            }
            res.json("Password updated");
            return;
        }
    }
    res.status(401).send("You must be connected").end();
    return;
});

/**
 * Suppression d'un utilisateur selon son email
 * URL : java-api/user/
 * Requête : DELETE
 */
userRouter.delete("/", async function (req, res) {
    if (await isUserConnected(req)) {
        const userEmail = req.body.userEmail;
        if (userEmail === undefined) {
            res.status(400).send("Email missing");
            return;
        }
        const connection = await DatabaseUtils.getConnection();
        const userController = new UserController(connection);

        const success = await userController.deleteUserByEmail(userEmail);
        if (typeof success !== "string") {
            if (success) {
                res.status(204).end();
                return;
            } else {
                res.status(404).end();
                return;
            }
        }
        res.status(404).send(success);
        return;
    }
    res.status(401).send("You must be connected").end();
    return;
});

export {
    userRouter
}
