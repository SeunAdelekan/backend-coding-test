const buildSchemas = require('../src/schemas');

module.exports = (db) => {
  const setup = () => new Promise((resolve, reject) => {
    db.serialize((error) => {
      if (error) {
        reject(error);
      }

      buildSchemas(db);
      resolve();
    });
  });

  const cleanup = async () => db.run('DELETE FROM Rides;');

  return { setup, cleanup };
};
