import {Express} from "express";
import {userRouter} from "./user_route";
import {stateRouter} from "./state_router";
import {ticketRouter} from "./ticket_route";

export function buildRouter(app: Express) {
    app.use("/user", userRouter);
    app.use("/state", stateRouter);
    app.use("/ticket", ticketRouter);
}
