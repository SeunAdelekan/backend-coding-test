import { Database } from 'sqlite3';
import buildSchemas from '../src/schemas';

export default (db: Database) => {
  const setup = (): Promise<void> => new Promise((resolve) => {
    db.serialize(() => {
      buildSchemas(db);
      resolve();
    });
  });

  const cleanup = async (): Promise<Database> => db.run('DELETE FROM Rides;');

  return { setup, cleanup };
};
