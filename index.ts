'use strict';

import sqlite3 from "sqlite3";
import { open } from "sqlite";
import buildSchemas from './src/schemas'
import logger from './src/util/logger';
import bootstrapApp from './src/app';

const port = 8010;

(async () => {
    const db = await open({
        filename: ':memory:',
        driver: sqlite3.Database,
    });
    buildSchemas(db);
    const app = bootstrapApp(db);

    app.listen(port, () => logger.info(`App started and listening on port ${port}`));
})();
