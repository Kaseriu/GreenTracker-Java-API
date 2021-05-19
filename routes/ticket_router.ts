import express from "express";
import {DatabaseUtils} from "../database/database";
import {TicketController} from "../controllers";

const ticketRouter = express.Router();

ticketRouter.get("/", async function (req, res) {
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
    } else {
        res.json(tickets);
    }
});
ticketRouter.get("/:id", async function (req, res) {
    const connection = await DatabaseUtils.getConnection();
    const ticketController = new TicketController(connection);
    const ticket = await ticketController.getTicketById(Number.parseInt(req.params.id));
    if (ticket === null) {
        res.status(404).end();
    } else {
        res.json(ticket);
    }
});

ticketRouter.get("/user/:id", async function (req, res) {
    const connection = await DatabaseUtils.getConnection();
    const ticketController = new TicketController(connection);
    const TreatmentType = await ticketController.getTicketByUserId(Number.parseInt(req.params.id));
    if (TreatmentType === null) {
        res.status(404).end();
    } else {
        res.json(TreatmentType);
    }
});

ticketRouter.get("/state/:id", async function (req, res) {
    const connection = await DatabaseUtils.getConnection();
    const ticketController = new TicketController(connection);
    const TreatmentType = await ticketController.getTicketByStateId(Number.parseInt(req.params.id));
    if (TreatmentType === null) {
        res.status(404).end();
    } else {
        res.json(TreatmentType);
    }
});

ticketRouter.put("/:id", async function (req, res) {

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
    }

});

ticketRouter.delete("/:id", async function (req, res) {
    const connection = await DatabaseUtils.getConnection();
    const ticketController = new TicketController(connection);
    const success = await ticketController.removeTicketById(Number.parseInt(req.params.id));
    if (success) {
        res.status(204).end();
    } else {
        res.status(404).end();
    }
});

ticketRouter.post("/add", async function (req, res) {

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
        id: 0,
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
    } else {
        res.status(400).end();
    }
});

export{
    ticketRouter
}
