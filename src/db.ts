const dotenv = require('dotenv');
const knex = require("knex");

dotenv.config();

export const db = knex({
  client: "pg",
  connection: {
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE_NAME,
  },
});
