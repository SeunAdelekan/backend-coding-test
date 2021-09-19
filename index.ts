'use strict';

import * as sqlite3 from "sqlite3";
import buildSchemas from './src/schemas'
import logger from './src/util/logger';
import bootstrapApp from './src/app';

const port = 8010;
const db = new (sqlite3.verbose()).Database(':memory:');

db.serialize(() => {
    buildSchemas(db);

    const app = bootstrapApp(db);

    app.listen(port, () => logger.info(`App started and listening on port ${port}`));
});
