import express from "express";
import {DatabaseUtils} from "../database/database";
import {StateController, TicketController, UserController} from "../controllers";
import {isUserConnected} from "../middlewares/auth-middleware";
import {State, User} from "../models";

const ticketRouter = express.Router();

/**
 * Récupération de tous les tickets
 * URL : java-api/ticket?[limit={x}&offset={x}]
 * Requête : GET
 */
ticketRouter.get("/", async function (req, res) {
    if (await isUserConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const ticketController = new TicketController(connection);
        const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined;
        const offset = req.query.offset ? Number.parseInt(req.query.offset as string) : undefined;
        const tickets = await ticketController.getAllTicket({
            limit,
            offset
        });
        if (tickets === null) {
            res.status(404).end();
            return;
        } else {
            res.json(tickets);
            return;
        }
    }
    res.status(401).send("You must be connected").end();
    return;
});

/**
 * Récupération d'un ticket selon son name
 * URL : java-api/ticket/:name
 * Requête : GET
 */
ticketRouter.get("/:name", async function (req, res) {
    if (await isUserConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const ticketController = new TicketController(connection);
        const ticket = await ticketController.getTicketByName(req.params.name);
        if (ticket === null) {
            res.status(404).end();
            return;
        } else {
            res.json(ticket);
            return;
        }
    }
    res.status(401).send("You must be connected").end();
    return;
});

/**
 * Récupération d'un ticket selon l'id d'un user
 * URL : java-api/ticket/user/:id
 * Requête : GET
 */
ticketRouter.get("/user/:id", async function (req, res) {
    if (await isUserConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const ticketController = new TicketController(connection);
        const TreatmentType = await ticketController.getTicketByUserId(Number.parseInt(req.params.id));
        if (TreatmentType === null) {
            res.status(404).end();
            return;
        } else {
            res.json(TreatmentType);
            return;
        }
    }
    res.status(401).send("You must be connected").end();
    return;
});

/**
 * Récupération d'un ticket selon l'id d'une state
 * URL : java-api/ticket/state/:id
 * Requête : GET
 */
ticketRouter.get("/state/:id", async function (req, res) {
    if (await isUserConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const ticketController = new TicketController(connection);
        const TreatmentType = await ticketController.getTicketByStateId(Number.parseInt(req.params.id));
        if (TreatmentType === null) {
            res.status(404).end();
            return;
        } else {
            res.json(TreatmentType);
            return;
        }
    }
    res.status(401).send("You must be connected").end();
    return;
});

/**
 * Modification d'un ticket selon son name
 * URL : java-api/ticket/:ticketName
 * Requête : PUT
 */
ticketRouter.put("/:ticketName", async function (req, res) {
    if (await isUserConnected(req)) {
        const ticketName = req.params.ticketName;
        const name = req.body.name;
        const description = req.body.description;
        const assigneeName = req.body.assigneeName;
        const id_user = req.body.id_user;
        const stateName = req.body.stateName;
        let assignee: User | null = null;
        let id_state: State | null = null;


        const connection = await DatabaseUtils.getConnection();
        const ticketController = new TicketController(connection);
        const userController = new UserController(connection);
        const stateController = new StateController(connection);


        if (assigneeName !== undefined) {
            assignee = await userController.getUserByName(assigneeName);
        }
        if (stateName !== undefined) {
            id_state = await stateController.getStateByName(stateName);
        }

        if (assignee === null && assigneeName !== undefined) {
            res.status(400).send("L'user " + assigneeName + " assignée au ticket n'existe pas !");
            return;
        }
        if (id_state === null && stateName !== undefined) {
            res.status(400).send("L'état " + stateName + "n'existe pas !")
            return;
        }

        const ticket = await ticketController.updateTicket(ticketName, {
            name: name,
            description: description,
            assignee: assignee?.id,
            id_user: id_user,
            id_state: id_state?.id
        });
        if (ticket === null) {
            res.status(304).end();
            return;
        } else if (typeof ticket === "string") {
            console.log(ticket)
            res.status(400).send(ticket);
            return;
        } else {
            res.status(200).send("Ticket modifié");
            return;
        }
    }
    res.status(401).send("You must be connected").end();
    return;
});

/**
 * Supression d'un ticket selon son name
 * URL : java-api/ticket/:name
 * Requête : DELETE
 */
ticketRouter.delete("/:name", async function (req, res) {
    if (await isUserConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const ticketController = new TicketController(connection);
        const success = await ticketController.removeTicket(req.params.name);
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

/**
 * Création d'un ticket
 * URL : java-api/ticket/add
 * Requête : POST
 */
ticketRouter.post("/add", async function (req, res) {
    if (await isUserConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const ticketController = new TicketController(connection);
        const userController = new UserController(connection);

        const name = req.body.name;
        const description = req.body.description;
        const assignee = req.body.assignee;
        const id_user = req.body.id_user;
        const id_state = req.body.id_state;

        if (name === undefined || name === "") {
            res.status(400).send("Nom manquant");
            return;
        }
        if (description === undefined || description === "") {
            res.status(400).send("Description manquante");
            return;
        }

        if (assignee === "") {
            res.status(400).send("User assigné manquant");
            return;
        }

        const assigneeId = await userController.getUserByName(assignee);
        if (assigneeId === null) {
            res.status(400).send("L'user assigné au ticket n'existe pas");
            return;
        }

        const Ticket = await ticketController.createTicket({
            name: name,
            description: description,
            assignee: assigneeId?.id,
            id_user: id_user,
            id_state: id_state
        })
        if (typeof Ticket === "string") {
            res.status(401).end(Ticket);
            return;
        }

        if (Ticket !== null) {
            res.status(201).send("Ticket créé");
            return;
        } else {
            res.status(400).end();
            return;
        }
    }
    res.status(401).send("You must be connected").end();
    return;
});

export {
    ticketRouter
}
