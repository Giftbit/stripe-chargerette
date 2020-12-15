import express from "express";
import bodyParser from "body-parser";
import {routes} from "./routes";
import {RestError} from "./api/RestError";
import {idempotencyRoute} from "./api/idempotency";
import {auth} from "./api/auth";
import {accountStore} from './api/AccountData';
import log = require("loglevel");

export function createExpressApp(): express.Application {
    const app = express();

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(auth.authRoute);
    app.use(idempotencyRoute);
    app.use("/", routes);

    // Error handling comes last.
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (err instanceof RestError) {
            res.status(err.statusCode).send({error: err.error});
            return;
        }

        log.error("Unexpected error:", err.stack);
        res.status(500).send({
            message: "Unexpected error: " + err.message,
            stack: err.stack
        });
    });

    return app;
}

export function resetData(accountId: string = "acct_default"): void {
  for(const accountData of accountStore) {
    accountData.removeAll(accountId)
  }
}