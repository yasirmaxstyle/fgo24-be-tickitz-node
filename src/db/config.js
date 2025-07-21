require("dotenv").config();

module.exports = {
  "development": {
    "username": process.env.PGUSER || "postgres",
    "password": process.env.PGPASSWORD || "1",
    "database": process.env.PGDATABASE || "postgres",
    "host": process.env.PGHOST || "localhost",
    "dialect": "postgres",
  },
  "test": {
    "username": process.env.PGUSER || "postgres",
    "password": process.env.PGPASSWORD || "1",
    "database": process.env.PGDATABASE || "postgres" + "_test",
    "host": process.env.PGHOST || "localhost",
    "dialect": "postgres"
  },
  "production": {
    "username": process.env.PGUSER || "postgres",
    "password": process.env.PGPASSWORD || "1",
    "database": process.env.PGDATABASE || "postgres",
    "host": process.env.PGHOST || "localhost",
    "dialect": "postgres"
  }
};