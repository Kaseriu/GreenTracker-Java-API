import express from "express";
import {StateController} from "../controllers";
import {DatabaseUtils} from "../database/database";

const stateRouter = express.Router();


/** Récuperation de tout les states disponible
 * getAllState()
 **/
stateRouter.get("/", async function (req, res) {
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
    } else {
        res.status(404).send("There is no state");
    }
});

/**Recuperation des state par Id
 * getStateById()
 */
stateRouter.get("/id", async function (req, res) {
    const connection = await DatabaseUtils.getConnection();
    const stateController = new StateController(connection);
    const stateId = req.body.stateId;
    if (stateId === undefined || stateId === "") {
        res.status(400).send('State Id is missing');
        return;
    }
    const state = await stateController.getStateById(stateId);
    if(state === null){
        res.status(404).send("This state doesn't exist !");
    }else{
        res.json({
            id: state.id,
            name: state.name
        });
    }
});

/**Recuperation des state par nom
 * getStateByName()
 */
stateRouter.get("/name", async function (req, res) {
    const connection = await DatabaseUtils.getConnection();
    const stateController = new StateController(connection);
    const stateName = req.body.stateName;
    if (stateName === undefined || stateName === "") {
        res.status(400).send('State name is missing !');
        return;
    }
    const state = await stateController.getStateByName(stateName)
    if (state === null) {
        res.status(404).send("This state doesn't exist !");
    } else {
        res.json({
            id: state.id,
            name: state.name
        });
    }
});

/**Modification des state par nom
 * updateByName()
 */
stateRouter.put("/", async function (req, res) {
    const stateName = req.body.stateName;
    const newName = req.body.newName;

    if (stateName === undefined || stateName === "") {
        res.status(400).send("State name is missing");
        return;
    }
    if (newName === undefined || newName == "") {
        res.status(400).send("New name is missing");
        return;
    }
    const connection = await DatabaseUtils.getConnection();
    const stateController = new StateController(connection);
    const state = await stateController.updateState(stateName, newName);
    if (state === null) {
        res.status(400).end();
    } else {
        if (typeof state === "string") {
            res.status(404).send(state);
            return;
        }
        res.json(state);
    }
    res.status(403).end();
});

/**Supression d'un state par nom
 * deleteStateByName()
 */
stateRouter.delete("/", async function (req, res) {
    const stateName = req.body.stateName;
    if(stateName === undefined){
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
        }
    }
    res.status(404).send(deleteSuccess);

});

/**Creation d'un state par nom
 * createStateByName()
 */
stateRouter.post("/", async function (req, res) {
    const connection = await DatabaseUtils.getConnection();
    const stateController = new StateController(connection);
    const name = req.body.name;

    if (name === undefined) {
        res.status(400).send("All information must be provided").end();
        return;
    }
    const state = await stateController.createName({
        name
    });
    if (state === null) {
        res.status(400).end();
    } else if (typeof state === "string") {
        res.status(400).send(state);
        return;
    } else {
        res.status(200).send({
            name: state.name
        });
    }
});

export{
    stateRouter
}
