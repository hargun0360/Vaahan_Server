import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

export const db = knex({
  client: "pg",
  connection: {
    host: process.env.POSTGRES_URL_HOST,
    user: process.env.POSTGRES_URL_USER,
    password: process.env.POSTGRES_URL_PASSWORD,
    database: process.env.POSTGRES_URL_DATABASE,
    ssl : process.env.POSTGRES_URL_URL
  },
});
