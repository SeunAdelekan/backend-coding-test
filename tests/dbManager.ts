import { Database } from 'sqlite';
import buildSchemas from '../src/schemas';

export default (db: Database) => {
  const setup = (): Promise<void> => new Promise((resolve) => {
    buildSchemas(db);
    resolve();
  });

  const cleanup = async () => db.run('DELETE FROM Rides;');

  return { setup, cleanup };
};
