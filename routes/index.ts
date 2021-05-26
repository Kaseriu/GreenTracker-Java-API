import {Express} from "express";
import {stateRouter} from "./state_router";
import {userRouter} from "./user_router";
import {ticketRouter} from "./ticket_router";
import {auth_router} from "./auth_router";

export function buildRouter(app: Express) {
    app.use("/java-api/user", userRouter);
    app.use("/java-api/state", stateRouter);
    app.use("/java-api/ticket", ticketRouter);
    app.use("/java-api/auth", auth_router);
}
