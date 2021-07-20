import express from "express";
import {StateController} from "../controllers";
import {DatabaseUtils} from "../database/database";
import {isUserConnected} from "../middlewares/auth-middleware";

const stateRouter = express.Router();


/**
 * Récupération de toutes les states disponible
 * URL : java-api/state/
 * Requête : GET
 **/
stateRouter.get("/", async function (req, res) {
    if (await isUserConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const stateController = new StateController(connection);
        const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined;
        const offset = req.query.offset ? Number.parseInt(req.query.offset as string) : undefined;
        const stateList = await stateController.getAllState({
            limit,
            offset
        });
        if (stateList.length !== 0) {
            res.json(stateList);
            return;
        } else {
            res.status(404).send("There is no state");
            return;
        }
    }
    res.status(401).send("You must be connected").end();
    return;
});

/**
 * Récupération des state par Id
 * URL : java-api/state/id
 * Requête : GET
 */
stateRouter.get("/id", async function (req, res) {
    if (await isUserConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const stateController = new StateController(connection);
        const stateId = req.body.stateId;
        if (stateId === undefined || stateId === "") {
            res.status(400).send('State Id is missing');
            return;
        }
        const state = await stateController.getStateById(stateId);
        if (state === null) {
            res.status(404).send("This state doesn't exist !");
            return;
        } else {
            res.json({
                id: state.id,
                name: state.name
            });
            return;
        }
    }
    res.status(401).send("You must be connected").end();
    return;
});

/**
 * Recuperation des state par nom
 * URL : java-api/state/:name
 * Requête : GET
 */
stateRouter.get("/:name", async function (req, res) {
    if (await isUserConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const stateController = new StateController(connection);
        const stateName = req.params.name;
        if (stateName === undefined || stateName === "") {
            res.status(400).send('State name is missing !');
            return;
        }
        const state = await stateController.getStateByName(stateName)
        if (state === null) {
            res.status(404).send("This state doesn't exist !");
            return;
        } else {
            res.json({
                id: state.id,
                name: state.name
            });
            return;
        }
    }
    res.status(401).send("You must be connected").end();
    return;
});

/**
 * Modification des state par nom
 * URL : java-api/state/:stateName
 * Requête : PUT
 */
stateRouter.put("/:stateName", async function (req, res) {
    if (await isUserConnected(req)) {
        const stateName = req.params.stateName;
        const newName = req.body.newName;

        if (newName === undefined || newName == "") {
            res.status(400).send("Vous devez renseigner le nouveau nom !");
            return;
        }
        const connection = await DatabaseUtils.getConnection();
        const stateController = new StateController(connection);
        const state = await stateController.updateState(stateName, newName);
        if (state === null) {
            res.status(400).end();
            return;
        } else {
            if (typeof state === "string") {
                res.status(404).send(state);
                return;
            }
            res.json(state);
            return;
        }
    }
    res.status(401).send("You must be connected").end();
    return;
});

/**
 * Supression d'un state par nom
 * URL : java-api/state/:name
 * Requête : DELETE
 */
stateRouter.delete("/:name", async function (req, res) {
    if (await isUserConnected(req)) {
        const stateName = req.params.name;
        if (stateName === undefined) {
            res.status(400).send("Name missing");
            return;
        }
        const connection = await DatabaseUtils.getConnection();
        const stateController = new StateController(connection);

        const deleteSuccess = await stateController.deleteStateByName(stateName);
        if (typeof deleteSuccess !== "string") {
            if (deleteSuccess) {
                res.status(204).end();
                return;
            } else {
                res.status(404).end();
                return;
            }
        }
        res.status(404).send(deleteSuccess);
        return;
    }
    res.status(401).send("You must be connected").end();
    return;
});

/**
 * Création d'une state par nom
 * URL : java-api/state
 * Requête : POST
 */
stateRouter.post("/", async function (req, res) {
    if (await isUserConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const stateController = new StateController(connection);
        const name = req.body.name;

        if (name === undefined) {
            res.status(400).send("All information must be provided").end();
            return;
        }
        const state = await stateController.createState({
            name
        });
        if (state === null) {
            res.status(400).end();
            return;
        } else if (typeof state === "string") {
            res.status(400).send(state);
            return;
        } else {
            res.status(200).send({
                name: state.name
            });
            return;
        }
    }
    res.status(401).send("You must be connected").end();
    return;
});

export {
    stateRouter
}
