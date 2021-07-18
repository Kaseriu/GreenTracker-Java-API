import express from "express";
import {DatabaseUtils} from "../database/database";
import {TicketController} from "../controllers";
import {isUserConnected} from "../middlewares/auth-middleware";

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
 * Modification d'un ticket selon son id
 * URL : java-api/ticket/:id
 * Requête : PUT
 */
ticketRouter.put("/:id", async function (req, res) {
    if (await isUserConnected(req)) {
        const id = Number.parseInt(req.params.id);
        const name = req.body.name;
        const description = req.body.description;
        const assignee = req.body.assignee;
        const id_user = req.body.id_user;
        const id_state = req.body.id_state;

        if (id === undefined) {
            res.status(400).end("add id");
            return;
        }
        const connection = await DatabaseUtils.getConnection();
        const ticketController = new TicketController(connection);

        const ticket = await ticketController.updateTicket({
            id: id,
            name: name,
            description: description,
            assignee: assignee,
            id_user: id_user,
            id_state: id_state
        });
        if (ticket === null) {
            res.status(404).end();
            return;
        } else {
            res.status(200).end();
            res.json(ticket);
            return;
        }
    }
    res.status(401).send("You must be connected").end();
    return;
});

/**
 * Supression d'un ticket selon son id
 * URL : java-api/ticket/:id
 * Requête : DELETE
 */
ticketRouter.delete("/:id", async function (req, res) {
    if (await isUserConnected(req)) {
        const connection = await DatabaseUtils.getConnection();
        const ticketController = new TicketController(connection);
        const success = await ticketController.removeTicketById(Number.parseInt(req.params.id));
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

        const name = req.body.name;
        const description = req.body.description;
        const assignee = req.body.assignee;
        const id_user = req.body.id_user;
        const id_state = req.body.id_state;
        if (name === undefined || description === undefined || assignee === undefined || id_user === undefined || id_state === undefined) {
            res.status(400).end("fields empty");
            return;
        }

        const Ticket = await ticketController.createTicket({
            name: name,
            description: description,
            assignee: assignee,
            id_user: id_user,
            id_state: id_state
        })
        if (typeof Ticket === "string") {
            res.status(401).end(Ticket);
            return;
        }

        if (Ticket !== null) {
            res.status(201);
            res.json(Ticket);
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
