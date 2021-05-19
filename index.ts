import {buildRouter} from "./routes";
import express, {Express} from "express";
import bodyParser from "body-parser";

const app: Express = express();

app.use(bodyParser.json());

//création des routes utilisables par l'application
buildRouter(app);

const port = process.env.PORT || 3003;
app.listen(port, function () {
    console.log(`Listening on ${port}...`);
});